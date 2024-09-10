function sendResponse(data) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data,
    }),
  };
}

function sendError(statusCode, errorMessage) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      errorMessage,
    }),
  };
}

module.exports = { sendResponse, sendError };