const { sendResponse } = require('../../responses/index');
const { db } = require('../../services/db');

async function getBookings() {
  try {
  const { Items } = await db.scan({
    TableName: 'bookings',
  });
  return Items;
  } catch (error) {
    throw new Error('Error fetching bookings from the database');
  }
}

exports.handler = async () => {
  try {
  const bookings = await getBookings();

    // Anpassar ordningen på attributen i svaret
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      numberOfGuests: booking.numberOfGuests,
      rooms: booking.rooms,
      name: booking.name,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
    }));

  return sendResponse({data: formattedBookings});
} catch (error) {
  console.error('Error fetching bookings:', error);  // Log error details
  return sendError(500, { message: 'Could not fetch bookings', error: error.message });
}

};