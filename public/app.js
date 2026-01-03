/* =========================
   SOCKET
========================= */
const socket = io();
const clientId = Math.random().toString(36).slice(2);

/* =========================
   STATE
========================= */
let roomKey = null;
let notes = [];
let currentId = null;

/* =========================
   DOM
========================= */
const roomInput = document.getElementById("roomInput");
const titleInput = document.getElementById("titleInput");
const contentInput = document.getElementById("contentInput");
const list = document.getElementById("list");

/* =========================
   JOIN ROOM
========================= */
function joinRoom() {
  roomKey = roomInput.value.trim();
  if (!roomKey) {
    alert("⚠️ Nhập mật mã phòng!");
    return;
  }

  socket.emit("room:join", roomKey);
  alert("✅ Đã kết nối phòng: " + roomKey);

  fetchNotes();
}

/* =========================
   API
========================= */
async function fetchNotes() {
  if (!roomKey) return;

  const res = await fetch(`/api/notes?room=${roomKey}`);
  notes = await res.json();
  render();
}

async function createNote(data) {
  const res = await fetch(`/api/notes?room=${roomKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function updateNote(id, data) {
  const res = await fetch(`/api/notes/${id}?room=${roomKey}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function deleteNote(id) {
  await fetch(`/api/notes/${id}?room=${roomKey}`, {
    method: "DELETE",
  });
}

/* =========================
   UI
========================= */
function render() {
  list.innerHTML = "";

  notes.forEach((note) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${note.title}</strong>
      <button onclick="selectNote('${note.id}')">✏️</button>
      <button onclick="removeNote('${note.id}')">🗑</button>
    `;

    list.appendChild(li);
  });
}

function selectNote(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  currentId = id;
  titleInput.value = note.title;
  contentInput.value = note.content;
}

/* =========================
   SOCKET SYNC
========================= */
function emitSync(note) {
  socket.emit("note:update", {
    clientId,
    note,
  });
}

socket.on("note:sync", (data) => {
  if (data.clientId === clientId) return;

  if (data.note.deleted) {
    notes = notes.filter((n) => n.id !== data.note.id);
  } else {
    const i = notes.findIndex((n) => n.id === data.note.id);
    if (i === -1) notes.push(data.note);
    else notes[i] = data.note;
  }

  render();
});

/* =========================
   ACTIONS
========================= */
async function addNote() {
  if (!roomKey) {
    alert("⚠️ Chưa kết nối phòng!");
    return;
  }

  const note = await createNote({
    title: titleInput.value || "New note",
    content: contentInput.value || "",
  });

  notes.push(note);
  emitSync(note);
  render();

  titleInput.value = "";
  contentInput.value = "";
}

async function saveCurrent() {
  if (!currentId || !roomKey) return;

  const updated = await updateNote(currentId, {
    title: titleInput.value,
    content: contentInput.value,
  });

  const i = notes.findIndex((n) => n.id === currentId);
  if (i !== -1) notes[i] = updated;

  emitSync(updated);
  render();
}

async function removeNote(id) {
  await deleteNote(id);
  notes = notes.filter((n) => n.id !== id);

  emitSync({ id, deleted: true });

  if (currentId === id) {
    currentId = null;
    titleInput.value = "";
    contentInput.value = "";
  }

  render();
}

/* =========================
   EVENTS
========================= */
titleInput.addEventListener("input", saveCurrent);
contentInput.addEventListener("input", saveCurrent);
