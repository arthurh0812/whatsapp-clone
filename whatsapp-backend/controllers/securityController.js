exports.filterRequestBody = (...inputFields) => {
  return (request, response, next) => {
    Object.keys(request.body).forEach((key) => {
      if (!inputFields.includes(key)) delete request.body[key];
    });
    next();
  };
};
