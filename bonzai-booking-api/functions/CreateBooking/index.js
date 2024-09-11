const { sendResponse, sendError } = require('../../responses/index');
const { calculateNumberOfNights, getAvailableRoomsByRoomType, extractPrice} = require('../../services/utils');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../../services/db');  // Importera rätt dynamoDb från AWS SDK v3


exports.handler = async (event) => {
  try {
    // Parsear förfrågans body
    const body = JSON.parse(event.body);

    // Validera indata
    if (!body.checkIn || !body.checkOut || !body.numberOfGuests || !body.name || !body.email || body.singleRooms === undefined || body.doubleRooms === undefined || body.suiteRooms === undefined) {
      return sendError(400, { message: 'Det saknas data i något fält: check-in, check-out, valda rum, , namn, eller email.' });
    }

    
    //Kontrollera att Number of Rooms i bokningen <= 20
    // Summera alla valda rumstyper för att få totalt antal bokade rum
    const totalRooms = (body.singleRooms || 0) + (body.doubleRooms || 0) + (body.suiteRooms || 0);
    if (totalRooms > 20) {
      return sendError(400, { message: `Bokningen överskrider maxantalet av rum (20) för en bokning. Du har valt ${totalRooms} rum.` });
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
      return sendError(400, { message: `Antalet gäster är fler än tillgängliga sängar  (${totalBeds}) i specifierade rum.` });
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

      await db.update(updateParams);  
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
    return sendError(500, { message: 'Det gick inte att göra en bokning.', error: error.message });
  }
};
