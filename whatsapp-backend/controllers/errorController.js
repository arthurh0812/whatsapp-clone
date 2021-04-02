// MODULES
const AppError = require("../utils/appError");

const state = {
  alreadyError: false,
};

// HANDLERS
const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${JSON.stringify(error.value)}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsErrorDB = (error) => {
  const object = error.message.match(/{([^}]+)}/)[0];
  const message = `Duplicate field value: ${object}. Please use another value.`;
  return new AppError(message, 400);
};

const handleGeoExtractionErrorDB = (error) => {
  const message = `You have to specify the coordinates of the location.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(`. `)}`;
  return new AppError(message, 400);
};

const handleJWTVerificationError = () =>
  new AppError(`Invalid token. Please login again.`, 401);

const handleJWTExpiredError = () =>
  new AppError(`Your token session has expired. Please login again.`, 401);

// SENDERS
// for API- and backend-related errors (in JSON)
const sendBackendErrorDev = (error, request, response) => {
  // leak everything to client
  response.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};
const sendBackendErrorProd = (error, request, response) => {
  // Operational errors
  if (error.isOperational) {
    return response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }
  // Programming/other errors
  console.error("ERROR: ", error);
  // generic response
  return response.status(500).json({
    status: "error",
    message: "Something went wrong...",
  });
};

exports.backendErrorHandler = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development" && !state.alreadyError) {
    sendBackendErrorDev(error, request, response);
  } else if (process.env.NODE_ENV === "production" && !state.alreadyError) {
    let errorRes;
    // CAST ERROR
    if (error.name === "CastError") {
      errorRes = handleCastErrorDB(error);
    }
    // DUPLICATE FIELD NAME ERROR
    else if (error.code === 11000) {
      errorRes = handleDuplicateFieldsErrorDB(error);
    }
    // GEOSPATIAL EXTRACTION ERROR
    else if (error.code === 16755) {
      errorRes = handleGeoExtractionErrorDB(error);
    }
    // VALIDATION ERROR
    else if (error.name === "ValidationError") {
      errorRes = handleValidationErrorDB(error);
    }
    // JSON WEB TOKEN VERIFICATION ERROR
    else if (error.name === "JsonWebTokenError") {
      errorRes = handleJWTVerificationError();
    }
    // JSON WEB TOKEN EXPIRED ERROR
    else if (error.name === "TokenExpiredError") {
      errorRes = handleJWTExpiredError();
    }
    // ALL OTHER ERRORS
    else {
      errorRes = error;
    }
    sendBackendErrorProd(errorRes, request, response);
  }

  state.alreadyBackendError = true;
};

exports.catchHandler = (cbfn) => {
  return (request, response, next) => {
    cbfn(request, response, next).catch(next);
  };
};

exports.catchParamHandler = (cbfn) => {
  return (request, response, next, param) => {
    cbfn(request, response, next, param).catch(next);
  };
};
