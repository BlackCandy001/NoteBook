const { v4: uuid } = require("uuid");
const { getNotes } = require("../data/notes.store");

exports.getAll = roomKey => {
  return getNotes(roomKey);
};

exports.create = (roomKey, data) => {
  const notes = getNotes(roomKey);

  const note = {
    id: uuid(),
    title: data.title || "New note",
    content: data.content || "",
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  notes.push(note);
  return note;
};

exports.update = (roomKey, id, data) => {
  const notes = getNotes(roomKey);
  const note = notes.find(n => n.id === id);
  if (!note) return null;

  note.title = data.title;
  note.content = data.content;
  note.updatedAt = Date.now();
  return note;
};

exports.remove = (roomKey, id) => {
  const notes = getNotes(roomKey);
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return false;

  notes.splice(index, 1);
  return true;
};
