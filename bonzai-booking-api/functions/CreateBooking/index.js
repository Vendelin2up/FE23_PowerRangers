const { sendResponse, sendError } = require('../../responses/index');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../../services/db');  // Importera rätt dynamoDb från AWS SDK v3


// Funktion för att extrahera numeriska värdet från roomCost-strängen
  function extractPrice(roomCost) {
  return Number(roomCost.replace(/[^0-9.-]+/g,""));  // Tar bort alla icke-numeriska tecken
}

// Funktion för att beräkna antalet nätter mellan två datum.
const calculateNumberOfNights = (checkIn, checkOut) => {
// Konvertera checkIn och checkOut till Date-objekt
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const numberOfNights = (checkOutDate - checkInDate) / millisecondsPerDay;
    if (numberOfNights <= 0) {
      return sendError(400, { message: 'Check-out date must be after check-in date' });
    } else {
      return numberOfNights;
    }
  };


// Funktion för att hämta tillgängliga rum baserat på kategori och antal
const getAvailableRoomsByRoomType = async (roomType, requestedCount) => {
  const params = {
    TableName: 'rooms',
    FilterExpression: 'roomType = :roomType AND Booked = :booked',
    ExpressionAttributeValues: {
      ':roomType': roomType,
      ':booked': false,
    },
  };
  const result = await db.scan(params);
  const availableRooms = result.Items || [];
  console.log(`Available rooms in category ${roomType}:`, availableRooms);  // Debugging line
   
  if (availableRooms.length < requestedCount) {
    throw new Error(`Not enough rooms available in the ${roomType} room type.`);
    }

  //returnerar efterfrågat antal rum i rums-typ  
  return availableRooms.slice(0, requestedCount);
};  



exports.handler = async (event) => {
  try {
    // Parsear förfrågans body
    const body = JSON.parse(event.body);

    // Validera indata
    if (!body.checkIn || !body.checkOut || !body.numberOfGuests || !body.name || !body.email || body.singleRooms === undefined || body.doubleRooms === undefined || body.suiteRooms === undefined) {
      return sendError(400, { message: 'Missing required fields: date, numberOfGuests, room categories, name, or email.' });
    }

    // Deklarera och initiera variablerna för tillgängliga rum, totalpris och totalbäddar
    const availableRooms = [];
    let totalPrice = 0;
    let totalBeds = 0;

    // Håll koll på antalet bokade rum av varje typ
    const roomTypeCount = {};

    // Hämta och kontrollera tillgänglighet för varje rumskategori som har efterfrågats i Body.
    try {
      if (body.singleRooms > 0) {
        const singleRooms = await getAvailableRoomsByRoomType('Single', body.singleRooms);
        availableRooms.push(...singleRooms);
        roomTypeCount.Single = singleRooms.length; 
      }

      if (body.doubleRooms > 0) {
        const doubleRooms = await getAvailableRoomsByRoomType('Double', body.doubleRooms);
        availableRooms.push(...doubleRooms);
        roomTypeCount.Double = doubleRooms.length;
      }

      if (body.suiteRooms > 0) {
        const suiteRooms = await getAvailableRoomsByRoomType('Suite', body.suiteRooms);
        availableRooms.push(...suiteRooms);
        roomTypeCount.Suite = suiteRooms.length;
      }
    } catch (error) {
      return sendError(400, { message: error.message });
    }


    // Beräkna antalet nätter som bokningen efterfrågar 
    const numberOfNights = calculateNumberOfNights(body.checkIn, body.checkOut);
    
    // Summerar ihop  totala antalet bäddar. Beräknar  totalpris för bokade nätter och rum.
    availableRooms.forEach(room => {
      totalBeds += parseInt(room.numberOfBeds, 10) || 0;
      totalPrice += extractPrice(room.roomCost) * numberOfNights;
    });

    //Kontrollera att Number of Guests <= Totalt antal bäddar i valt/valda rum
    if (body.numberOfGuests > totalBeds) {
      return sendError(400, { message: `Number of guests exceeds total available beds (${totalBeds}) in selected rooms.` });
    }


    // Skapa ett unikt boknings-ID
    const bookingId = uuidv4();

    // Skapa bokningen i DynamoDB (bookings-tabellen)
    await db.put({
      TableName: 'bookings',
      Item: {
        id: bookingId,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        numberOfGuests: body.numberOfGuests,
        rooms: availableRooms.map(room => room['room-id']),
        totalPrice: totalPrice,
        name: body.name,
        email: body.email,
        createdAt: new Date().toISOString(),
      },
    });

    // Uppdatera rummen till "booked" i DynamoDB
    for (const room of availableRooms) {
      const updateParams = {
        TableName: 'rooms',
        Key: { 'room-id': room['room-id'] },
        UpdateExpression: 'SET Booked = :booked',
        ExpressionAttributeValues: { ':booked': true },
      };

      await db.update(updateParams);  // Ingen .promise() behövs med AWS SDK v3
    }

    // Returnera bokningsbekräftelse
    return sendResponse({
      message: "Booking confirmation",
      bookingId: bookingId,
      numberOfGuests: body.numberOfGuests,
      roomTypes: roomTypeCount, 
      totalPrice: totalPrice,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      name: body.name
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return sendError(500, { message: 'Could not create booking', error: error.message });
  }
};
