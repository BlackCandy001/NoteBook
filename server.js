const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const notesRoutes = require("./src/routes/notes.routes");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* middleware */
app.use(express.json());
app.use("/api/notes", notesRoutes);
app.use(express.static(path.join(__dirname, "public")));

/* socket */
io.on("connection", socket => {
  console.log("🟢 user connected");

  socket.on("room:join", roomKey => {
    socket.join(roomKey);
    socket.roomKey = roomKey;
    console.log("🔑 joined room:", roomKey);
  });

  socket.on("note:update", data => {
    if (!socket.roomKey) return;
    socket.to(socket.roomKey).emit("note:sync", data);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
