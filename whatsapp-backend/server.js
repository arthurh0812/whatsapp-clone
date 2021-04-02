const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

// MODULES
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Pusher = require("pusher");
const messageRouter = require("./routes/messageRouter");
const { backendErrorHandler } = require("./controllers/errorController");

// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1068823",
  key: "f29e824469db4dcea89a",
  secret: "fa68977883984a6d1408",
  cluster: "eu",
  useTLS: true,
});

// middleware
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// DB config
let connectionString = process.env.DATABASE_CONNECTION;
connectionString = connectionString.replace(
  "<name>",
  process.env.DATABASE_NAME
);
connectionString = connectionString.replace(
  "<dbname>",
  process.env.DATABASE_DB
);
connectionString = connectionString.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(connectionString, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB connection succesful!");

  const msgCollection = db.collection("messages");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else if (change.operationType === "delete") {
      const messageKey = change.documentKey;
      pusher.trigger("messages", "deleted", {
        messageId: messageKey._id,
      });
    }
  });
});

// ROUTES
app.get("/", (request, response) => {
  response.status(200).send("hello world");
});

app.use("/api/messages", messageRouter);
app.use(backendErrorHandler);

// listen
app.listen(port, () => {
  console.log(`Listening to requests on localhost:${port}...`);
});
