export const globalErrHandler = (err, req, res, next) => {
  const stack = err?.stack;
  const message = err?.message;

  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Check if it's a validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);

    return res.status(400).json({
      success: false,
      error: messages,
    });
  }

  const statusCode = err?.statusCode ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    statusCode,
    stack,
    message,
  });
};

// 404 handler
export const notFound = (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404; // assign 404 status code to the error
  next(err);
};


// The globalErrHandler middleware function is not called on every request by the client.
// It is only called when there is an error that occurs during the processing of a request,
// or in any middleware or route function that calls next() with an error object.

// When an error occurs in a middleware or route function,
// that function should call next() with an error object.
// The error object will then be passed down the middleware chain
// until it reaches the globalErrHandler middleware function.

// The globalErrHandler middleware function is the last middleware function
// in the middleware chain, so if an error is not caught and handled by any of the previous middleware
// functions or route handlers, it will eventually reach the globalErrHandler middleware function.

// In summary, the globalErrHandler middleware function is only called when there
// is an unhandled error that occurs during the processing of a request.
// It is not called on every request by the client.
