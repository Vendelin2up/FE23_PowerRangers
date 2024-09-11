const { db } = require('../../services/db');
const { sendResponse, sendError } = require('../../responses/index');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Kontrollera att alla nödvändiga fält finns med
    if (!body.date || !body.numberOfGuests || !body.roomIds) {
      return sendError(400, { message: 'Missing required fields: bookingId, date, numberOfGuests, or roomIds' });
    }

    const bookingId = event.pathParameters.id;

    // Kontrollera om bokningen finns
    const bookingParams = {
      TableName: 'bookings',
      Key: { id: bookingId },
    };
    const bookingResult = await db.get(bookingParams);
    const booking = bookingResult.Item;

    if (!booking) {
      return sendError(404, { message: `Booking with id ${bookingId} not found` });
    }
// Kontrollera tillgänglighet för de nya rummen
    const roomIds = body.roomIds;
    const availableRooms = [];
    let totalPrice = 0;

    for (const roomId of roomIds) {
      const params = {
        TableName: 'rooms',
        Key: { 'room-id': roomId },
      };
      const result = await db.get(params);
      const room = result.Item;

      if (!room) {
        return sendError(404, { message: `Room with id ${roomId} not found` });
      }

      if (room.Booked) {
        return sendError(400, { message: `Room with id ${roomId} is already booked` });
      }

      availableRooms.push(room);
      totalPrice += room.roomCost;
    }

    // Uppdatera bokningen
    const updateParams = {
      TableName: 'bookings',
      Key: { id: bookingId },
      UpdateExpression: 'SET #date = :date, numberOfGuests = :numberOfGuests, rooms = :rooms, totalPrice = :totalPrice',
      ExpressionAttributeNames: {
        '#date': 'date',  // 'date' är ett reserverat ord i DynamoDB, därför använder vi en alias för det.
      },
      ExpressionAttributeValues: {
        ':date': body.date,
        ':numberOfGuests': body.numberOfGuests,
        ':rooms': availableRooms.map(room => room['room-id']),  // Spara bara room-id:n
        ':totalPrice': totalPrice,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const updateResult = await db.update(updateParams);

    return sendResponse({ message: 'Booking updated successfully', result: updateResult });

  } catch (error) {
    console.error('Error updating booking:', error);
    return sendError(500, { message: 'Internal server error', error });
  }
};