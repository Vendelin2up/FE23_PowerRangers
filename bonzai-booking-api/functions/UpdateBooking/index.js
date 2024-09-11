const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
      const body = JSON.parse(event.body);

    // Kontrollera att alla nödvändiga fält finns med
    if (!body.bookingId || !body.date || !body.numberOfGuests || !body.roomIds) {
        return sendError(400, { message: 'Missing required fields: bookingId, date, numberOfGuests, or roomIds' });
      }

      const bookingId = body.bookingId;

    // Kontrollera om bokningen finns
    const bookingParams = {
      TableName: 'bookings',
      Key: { id: bookingId },
    };
    const bookingResult = await db.get(bookingParams).promise();
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
        const result = await db.get(params).promise();
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
            '#date': 'date',
        },
        ExpressionAttributeValues: {
            ':date': body.date,
            ':numberOfGuests': body.numberOfGuests,
            ':rooms': availableRooms,
            ':totalPrice': totalPrice,
        },
            ReturnValues: 'UPDATED_NEW',
        };
    
        const updateResult = await db.update(updateParams).promise();
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Booking updated successfully', result: updateResult }),
            };
        } catch (error) {
            return sendError(500, { message: 'Internal server error', error });
        }
    };
    
    // Helper function to handle errors
    function sendError(statusCode, message) {
        return {
            statusCode: statusCode,
            body: JSON.stringify(message),
        };
    }