const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    message: String,
    name: {
      $type: String,
      default: "Sonny",
    },
    timestamp: {
      $type: String,
      default: Date.now(),
    },
    received: Boolean,
    deleted: {
      $type: Boolean,
      default: false,
    },
  },
  { typeKey: "$type", collection: "messages" }
);

const Message = mongoose.model("message", messageSchema);

module.exports = Message;
