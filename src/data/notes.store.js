const notesStore = {};

function getNotes(roomKey) {
  if (!notesStore[roomKey]) notesStore[roomKey] = [];
  return notesStore[roomKey];
}

function setNotes(roomKey, notes) {
  notesStore[roomKey] = notes;
}

module.exports = {
  getNotes,
  setNotes
};
