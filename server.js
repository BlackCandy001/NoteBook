const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// API endpoint để lấy/save notes (nếu muốn lưu trên server thay vì localStorage)
const DATA_FILE = 'notes-data.json';

// Đọc dữ liệu từ file
function readNotesData() {
 try {
 if (fs.existsSync(DATA_FILE)) {
 const data = fs.readFileSync(DATA_FILE, 'utf8');
 return JSON.parse(data);
 }
 } catch (error) {
 console.error('Error reading data file:', error);
 }
 return { notes: [], users: {} };
}

// Ghi dữ liệu vào file
function writeNotesData(data) {
 try {
 fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
 return true;
 } catch (error) {
 console.error('Error writing data file:', error);
 return false;
 }
}

// Routes
app.get('/', (req, res) => {
 res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Lấy tất cả notes
app.get('/api/notes', (req, res) => {
 const data = readNotesData();
 res.json(data.notes || []);
});

// API: Lưu note mới hoặc cập nhật
app.post('/api/notes', (req, res) => {
 const { id, title, content, tags } = req.body;
 const data = readNotesData();
 
 if (!data.notes) data.notes = [];
 
 const existingIndex = data.notes.findIndex(note => note.id === id);
 const noteData = {
 id: id || Date.now().toString(),
 title: title || 'Untitled',
 content: content || '',
 tags: tags || [],
 createdAt: existingIndex >= 0 ? data.notes[existingIndex].createdAt : new Date().toISOString(),
 updatedAt: new Date().toISOString()
 };
 
 if (existingIndex >= 0) {
 data.notes[existingIndex] = noteData;
 } else {
 data.notes.unshift(noteData);
 }
 
 if (writeNotesData(data)) {
 res.json({ success: true, note: noteData });
 } else {
 res.status(500).json({ success: false, error: 'Failed to save note' });
 }
});

// API: Xóa note
app.delete('/api/notes/:id', (req, res) => {
 const { id } = req.params;
 const data = readNotesData();
 
 if (data.notes) {
 data.notes = data.notes.filter(note => note.id !== id);
 
 if (writeNotesData(data)) {
 res.json({ success: true });
 } else {
 res.status(500).json({ success: false, error: 'Failed to delete note' });
 }
 } else {
 res.json({ success: true });
 }
});

// API: Xuất tất cả notes (JSON)
app.get('/api/export', (req, res) => {
 const data = readNotesData();
 res.json(data.notes || []);
});

// Route cho các trang khác (phục vụ SPA)
app.get('*', (req, res) => {
 res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
 console.log(`Notebook Server đang chạy tại http://localhost:${PORT}`);
 console.log(`Môi trường: ${process.env.NODE_ENV || 'development'}`);
 console.log(`Thư mục public: ${path.join(__dirname, 'public')}`);
});