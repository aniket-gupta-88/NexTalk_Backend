const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const SocketServer = require("./socketServer");
const { PeerServer } = require("peer");
const { MONGODB_URL } = require("./config/keys");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//Socket
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const users = [];
io.on("connection", (socket) => {
  SocketServer(socket);
});

// Create peer server
PeerServer({ port: 3001, path: "/" });

//Routes
app.use("/api", require("./routes/authRouter"));
app.use("/api", require("./routes/userRouter"));
app.use("/api", require("./routes/postRouter"));
app.use("/api", require("./routes/commentRouter"));
app.use("/api", require("./routes/notifyRouter"));
app.use("/api", require("./routes/messageRouter"));

const URI = MONGODB_URL;

mongoose
  .connect(URI)
   .then(() => {
     console.log("Connected to MongoDB successfully.");
   })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

if (process.env.NODE_ENV == "production") {
  const path = require("path");
  app.get("/", (req, res) => {
    app.use(express.static(path.resolve(__dirname, "client", "build")));
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000;
http.listen(port, () => {
  console.log("Server is running on port", port);
});
