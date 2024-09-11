const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/db');

exports.handler = async (event) => {
  try {
    // Hämta boknings-ID från URL:en
    const bookingId = event.pathParameters.id;

    // Hämta bokningen från DynamoDB
    const getParams = {
      TableName: 'bookings',
      Key: { id: bookingId },
    };

    const bookingResult = await db.get(getParams);
    const booking = bookingResult.Item;

    if (!booking) {
      return sendError(404, { message: `Booking with id ${bookingId} not found` });
    }

    // Ta bort bokningen från DynamoDB
    const deleteParams = {
      TableName: 'bookings',
      Key: { id: bookingId },
    };

    await db.delete(deleteParams);
    console.log(`Booking with id ${bookingId} has been deleted`);

    // Markera rummen som tillgängliga (sätt Booked = false)
    for (const roomId of booking.rooms) {
      const updateRoomParams = {
        TableName: 'rooms',
        Key: { 'room-id': roomId },
        UpdateExpression: 'SET Booked = :booked',
        ExpressionAttributeValues: { ':booked': false },
      };

      await db.update(updateRoomParams);
      console.log(`Room ${roomId} is now available`);
    }

    // Returnera avbokningsbekräftelse
    return sendResponse({
      message: `Booking with id ${bookingId} has been successfully cancelled`,
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return sendError(500, { message: 'Could not cancel booking', error: error.message });
  }
};
