const { sendResponse, sendError } = require('../../responses/index');
const { calculateNumberOfNights, getAvailableRoomsByRoomType, extractPrice, releaseRooms  } = require('../../services/utils');
const { db } = require('../../services/db');


exports.handler = async (event) => {
  try {
    // Extract bookingId from path parameters
    const bookingId = event.pathParameters.id;

     // Validate bookingId
     if (!bookingId || bookingId.trim() === '') {
      return sendError(400, { message: 'BokningsId är felaktigt eller saknas.' });
    }

  // Parse request body
  const body = JSON.parse(event.body);

     // Hämta efterfrågad bokning
     const existingBookingResult = await db.get({
      TableName: 'bookings',
      Key: { id: bookingId }
    });

    if (!existingBookingResult.Item) {
      return sendError(404, { message: 'Bokning kan inte hittas.' });
    }

    const existingBooking = existingBookingResult.Item;
    const oldRooms = existingBooking.rooms;

    // Avboka rum.
    await releaseRooms(oldRooms);


    // Hitta nytt rum som passar uppdaterat önskemål.
    const availableRooms = [];
    let totalPrice = 0;
    let totalBeds = 0;
    const roomTypeCount = {};

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

    // Calculate number of nights and total price
    const numberOfNights = calculateNumberOfNights(body.checkIn, body.checkOut);
    availableRooms.forEach(room => {
      totalBeds += parseInt(room.numberOfBeds, 10) || 0;
      totalPrice += extractPrice(room.roomCost) * numberOfNights;
    });

    // Check if the number of guests fits within the available beds
    if (body.numberOfGuests > totalBeds) {
      return sendError(400, { message: `Antalet gäster är fler än tillgängliga sängar  (${totalBeds}) i specifierade rum.`  });
    }

    // Update booking in DynamoDB
    await db.update({
      TableName: 'bookings',
      Key: { id: bookingId },
      UpdateExpression: 'SET checkIn = :checkIn, checkOut = :checkOut, numberOfGuests = :numberOfGuests, rooms = :rooms, totalPrice = :totalPrice',
      ExpressionAttributeValues: {
        ':checkIn': body.checkIn,
        ':checkOut': body.checkOut,
        ':numberOfGuests': body.numberOfGuests,
        ':rooms': availableRooms.map(room => room['room-id']),
        ':totalPrice': totalPrice
      },
      ReturnValues: 'ALL_NEW'
    });

    // Mark the new rooms as booked
    for (const room of availableRooms) {
      const updateParams = {
        TableName: 'rooms',
        Key: { 'room-id': room['room-id'] },
        UpdateExpression: 'SET Booked = :booked',
        ExpressionAttributeValues: { ':booked': true },
      };
      await db.update(updateParams);
    }

    // Return updated booking confirmation
    return sendResponse({
      message: "Booking updated successfully",
      bookingId: bookingId,
      numberOfGuests: body.numberOfGuests,
      roomTypes: roomTypeCount,
      totalPrice: totalPrice,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      name: body.name
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    return sendError(500, { message: 'Det gick inte att uppdatera bokningen.', error: error.message });
  }
};