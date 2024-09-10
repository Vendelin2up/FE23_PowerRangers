const { sendResponse, sendError } = require('../../responses/index');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../../services/db');  // Importera rätt dynamoDb från AWS SDK v3

exports.handler = async (event) => {
  try {
    // Parsear förfrågans body
    const body = JSON.parse(event.body);

    // Validera indata
    if (!body.date || !body.numberOfGuests || !body.roomIds) {
      return sendError(400, { message: 'Missing required fields: date, numberOfGuests, or roomIds' });
    }

    const roomIds = body.roomIds;
    const availableRooms = [];
    let totalPrice = 0;

    // Hämta varje rum från DynamoDB och kontrollera om de är tillgängliga
    for (const roomId of roomIds) {
      const params = {
        TableName: 'rooms',
        Key: {
          'room-id': roomId,  // Vi söker efter room-id
        },
      };

      const result = await db.get(params);  // Ingen .promise() behövs med AWS SDK v3
      const room = result.Item;

      // Kontrollera om rummet finns
      if (!room) {
        return sendError(404, { message: `Room with id ${roomId} not found` });
      }

      // Kontrollera om rummet redan är bokat
      if (room.Booked) {
        return sendError(400, { message: `Room with id ${roomId} is already booked` });
      }

      // Lägg till rummet till tillgängliga rum och uppdatera totalpriset
      availableRooms.push(room);
      totalPrice += room.roomCost;
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
      roomsBooked: availableRooms.map(room => room['room-id']),
      totalPrice: totalPrice,
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return sendError(500, { message: 'Could not create booking', error: error.message });
  }
};
