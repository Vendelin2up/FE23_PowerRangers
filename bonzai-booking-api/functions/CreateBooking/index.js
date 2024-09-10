const { sendResponse, sendError } = require('../../responses/index');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../../services/db');

exports.handler = async (event) => {
  try {
    // Parse the request body
    const body = JSON.parse(event.body);

    // Create a unique bookingId
    const bookingId = uuidv4();

    // Insert the new booking into DynamoDB
    await db.put({
      TableName: 'bookings',
      Item: {
        id: bookingId,
        date: body.date,
        numberOfGuests: body.numberOfGuests,
        
      },
    })

    // Send response with the new bookingId
    return sendResponse({ bookingId, body });

  } catch (error) {
    console.error('Error creating booking:', error);  // Log error details
    return sendError(500, { message: 'Could not create booking', error: error.message });
  }
};