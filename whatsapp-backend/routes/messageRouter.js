// MODULES
const express = require("express");

// CONTROLLERS
const securityController = require("../controllers/securityController");
const messageController = require("../controllers/messageController");

const Router = express.Router();

securityController.filterRequestBody("message");

Router.route("/")
  .get(messageController.getMessagesSync)
  .post(messageController.createMessage);

Router.route("/:messageId")
  .patch(messageController.editMessage)
  .delete(messageController.deleteMessage);
module.exports = Router;
