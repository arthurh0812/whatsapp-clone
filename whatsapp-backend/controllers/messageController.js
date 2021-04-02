// MODULES
const { catchHandler } = require("./errorController");

// MODELS
const Message = require("../models/messageModel");

// HANDLER FUNCTIONS

// GET /messages
exports.getMessagesSync = catchHandler(async (request, response, next) => {
  const messages = await Message.find();

  response.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages: messages,
    },
    requestTime: request.requestTime,
  });
});

// POST /messages
exports.createMessage = catchHandler(async (request, response, next) => {
  const message = await Message.create(request.body);

  response.status(201).json({
    status: "success",
    data: {
      message: message,
    },
    requestTime: request.requestTime,
  });
});

// DELETE /messages/:messageId
exports.deleteMessage = catchHandler(async (request, response, next) => {
  await Message.findByIdAndUpdate(request.params.messageId, {
    deleted: true,
  });

  response.status(204).json({
    status: "success",
    data: null,
    requestTime: request.requestTime,
  });
});

// PATCH /messages/:messageId
exports.editMessage = catchHandler(async (request, response, next) => {
  const message = await Message.findByIdAndUpdate(request.params.messageId, {
    message: request.body.message,
  });

  response.status(200).json({
    status: "success",
    data: {
      message: message,
    },
    requestTime: request.requestTime,
  });
});
