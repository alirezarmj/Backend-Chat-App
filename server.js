const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow your Next.js client to connect
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  // Join a room with a username
  socket.on("join_room", (data) => {
    const { room, username } = data;
    socket.join(room);
    console.log(`User ${username} (${socket.id}) joined room: ${room}`);

    // Notify the room that a new user has joined
    io.to(room).emit("receive_message", {
      message: `${username} has joined the room.`,
      sender: "System",
    });
  });

  // Send a message to a specific room
  socket.on("send_message", (data) => {
    const { room, message, username } = data;
    console.log(`Message received in room ${room} from ${username}:`, message);

    // Broadcast the message to the room
    io.to(room).emit("receive_message", { message, sender: username });
  });

  // Handle leaving a room
  socket.on("leave_room", (data) => {
    const { room, username } = data;
    socket.leave(room);
    console.log(`User ${username} (${socket.id}) left room: ${room}`);

    // Notify the room that a user has left
    io.to(room).emit("receive_message", {
      message: `${username} has left the room.`,
      sender: "System",
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
