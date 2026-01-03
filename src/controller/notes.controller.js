const service = require("../services/notes.service");

exports.getAll = (req, res) => {
  const roomKey = req.query.room;
  if (!roomKey) return res.status(400).json({ error: "roomKey required" });

  res.json(service.getAll(roomKey));
};

exports.create = (req, res) => {
  const roomKey = req.query.room;
  res.json(service.create(roomKey, req.body));
};

exports.update = (req, res) => {
  const roomKey = req.query.room;
  const note = service.update(roomKey, req.params.id, req.body);
  if (!note) return res.sendStatus(404);
  res.json(note);
};

exports.remove = (req, res) => {
  const roomKey = req.query.room;
  service.remove(roomKey, req.params.id);
  res.sendStatus(204);
};
