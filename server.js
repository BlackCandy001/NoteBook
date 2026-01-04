const roomIPs = {};

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const notesRoutes = require("./src/routes/notes.routes");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* =========================
   GET CLIENT IP
========================= */
function getClientIP(socket) {
  return (
    socket.handshake.headers["x-forwarded-for"]?.split(",")[0] ||
    socket.handshake.address
  );
}

/* middleware */
app.use(express.json());
app.use("/api/notes", notesRoutes);
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   SOCKET
========================= */
io.on("connection", socket => {
  const ip = getClientIP(socket);
  console.log("🟢 connect", socket.id, ip);

  socket.on("room:join", roomKey => {
    socket.join(roomKey);
    socket.roomKey = roomKey;
    socket.ip = ip;

    if (!roomIPs[roomKey]) {
      roomIPs[roomKey] = new Set();
    }

    // ⭐ chỉ tính 1 lần / IP
    roomIPs[roomKey].add(ip);

    io.to(roomKey).emit("room:count", roomIPs[roomKey].size);
  });

  socket.on("disconnect", () => {
    const roomKey = socket.roomKey;
    if (!roomKey) return;

    const sockets = Array.from(io.sockets.adapter.rooms.get(roomKey) || []);
    const stillConnected = sockets.some(
      id => io.sockets.sockets.get(id)?.ip === socket.ip
    );

    if (!stillConnected) {
      roomIPs[roomKey]?.delete(socket.ip);
    }

    io.to(roomKey).emit("room:count", roomIPs[roomKey]?.size || 0);
    console.log("🔴 disconnect", socket.id, socket.ip);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
