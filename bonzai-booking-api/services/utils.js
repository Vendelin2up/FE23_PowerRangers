const { db } = require('./db');


// Function to calculate number of nights between two dates
const calculateNumberOfNights = (checkIn, checkOut) => {
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


// Function to get available rooms based on type and count
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
  if (availableRooms.length < requestedCount) {
    throw new Error(`Not enough rooms available in the ${roomType} room type.`);
  }
  return availableRooms.slice(0, requestedCount);
};



// Function to extract numeric values from cost strings
function extractPrice(roomCost) {
  return Number(roomCost.replace(/[^0-9.-]+/g,""));  // Remove non-numeric characters
}



// Function to set boooked room to free in Room-db.
const releaseRooms = async (roomIds) => {
  for (const roomId of roomIds) {
    const updateParams = {
      TableName: 'rooms',
      Key: { 'room-id': roomId },
      UpdateExpression: 'SET Booked = :booked',
      ExpressionAttributeValues: { ':booked': false },
    };
    await db.update(updateParams);
  }
};

module.exports = { calculateNumberOfNights, getAvailableRoomsByRoomType, extractPrice, releaseRooms  };