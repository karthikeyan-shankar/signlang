const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow any frontend client (useful for Chrome Extension overlays too!)
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Heartbeat route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "SignLang Backend Operational 🤟" });
});

// Socket.io room orchestration
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Client joins interview room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Transfer translated sign text to HR recruiter panel
  socket.on("sign-translation", ({ roomId, text }) => {
    socket.to(roomId).emit("receive-translation", text);
  });

  // WebRTC handshakes for standard video stream
  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SignLang Server running on port ${PORT}`);
});
