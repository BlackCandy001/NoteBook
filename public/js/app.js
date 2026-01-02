// Notebook Web Application - JavaScript
class NotebookApp {
    constructor() {
        this.notes = [];
        this.currentNoteId = null;
        this.isDarkTheme = false;
        this.isAuthenticated = false;
        this.defaultPassword = '123456';
        this.init();
    }

    init() {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        this.checkAuthentication();
        
        if (this.isAuthenticated) {
            this.loadNotes();
            this.setupEventListeners();
            this.updateUI();
            this.setCurrentDate();
            this.showMainApp();
        } else {
            this.setupPasswordListeners();
        }
    }

    // Kiểm tra xác thực
    checkAuthentication() {
        const savedPassword = localStorage.getItem('notebook-password');
        const isAuthenticated = localStorage.getItem('notebook-authenticated');
        
        // Nếu chưa có mật khẩu, tạo mật khẩu mặc định
        if (!savedPassword) {
            localStorage.setItem('notebook-password', this.defaultPassword);
        }
        
        // Nếu đã đăng nhập trước đó (trong phiên này)
        if (isAuthenticated === 'true') {
            this.isAuthenticated = true;
        }
    }

    // Thiết lập sự kiện cho modal mật khẩu
    setupPasswordListeners() {
        document.getElementById('submit-password').addEventListener('click', () => this.verifyPassword());
        document.getElementById('password-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.verifyPassword();
        });
        
        // Sự kiện tạo mã ngẫu nhiên
        document.getElementById('generate-password').addEventListener('click', () => this.generateRandomPassword());
        
        // Sự kiện sao chép mã
        document.getElementById('copy-password').addEventListener('click', () => this.copyGeneratedPassword());
        
        // Focus vào ô nhập mật khẩu
        setTimeout(() => {
            document.getElementById('password-input').focus();
        }, 100);
    }

    // Tạo mã ngẫu nhiên
    generateRandomPassword() {
        // Tạo mã 6 số ngẫu nhiên
        const randomPassword = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hiển thị mã mới
        document.getElementById('new-password-display').textContent = randomPassword;
        document.getElementById('generated-password').style.display = 'flex';
        
        // Tự động điền vào ô nhập
        document.getElementById('password-input').value = randomPassword;
        
        // Lưu mã mới vào localStorage
        localStorage.setItem('notebook-password', randomPassword);
        
        // Hiển thị thông báo
        this.showTempMessage('Mã mới đã được tạo và lưu!', 'success');
    }

    // Sao chép mã đã tạo
    copyGeneratedPassword() {
        const passwordDisplay = document.getElementById('new-password-display').textContent;
        navigator.clipboard.writeText(passwordDisplay).then(() => {
            this.showTempMessage('Đã sao chép mã vào clipboard!', 'success');
        }).catch(err => {
            console.error('Lỗi sao chép:', err);
            this.showTempMessage('Không thể sao chép mã', 'error');
        });
    }

    // Hiển thị thông báo tạm thời
    showTempMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `temp-message ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            background-color: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
            color: white;
            border-radius: var(--border-radius);
            z-index: 10000;
            box-shadow: var(--box-shadow);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 300);
        }, 3000);
    }

    // Xác minh mật khẩu
    verifyPassword() {
        const input = document.getElementById('password-input');
        const password = input.value.trim();
        const savedPassword = localStorage.getItem('notebook-password') || this.defaultPassword;
        const errorElement = document.getElementById('password-error');
        
        if (password === savedPassword) {
            this.isAuthenticated = true;
            localStorage.setItem('notebook-authenticated', 'true');
            this.showMainApp();
            this.loadNotes();
            this.setupEventListeners();
            this.updateUI();
            this.setCurrentDate();
        } else {
            // Hiển thị lỗi
            errorElement.style.display = 'flex';
            input.style.borderColor = 'var(--danger-color)';
            input.value = '';
            input.focus();
            
            // Hiệu ứng rung
            input.style.animation = 'shake 0.5s';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        }
    }

    // Hiển thị ứng dụng chính
    showMainApp() {
        document.getElementById('password-modal').classList.remove('active');
        document.getElementById('main-container').style.display = 'flex';
        
        // Thêm hiệu ứng fade in
        document.getElementById('main-container').style.opacity = '0';
        document.getElementById('main-container').style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.getElementById('main-container').style.opacity = '1';
        }, 10);
    }

    // Đổi mật khẩu (chức năng nâng cao)
    changePassword(oldPassword, newPassword) {
        const savedPassword = localStorage.getItem('notebook-password') || this.defaultPassword;
        
        if (oldPassword === savedPassword) {
            localStorage.setItem('notebook-password', newPassword);
            return true;
        }
        return false;
    }

    // Mã hóa nội dung (đơn giản với Base64)
    encryptContent(content) {
        if (!content) return '';
        return btoa(unescape(encodeURIComponent(content)));
    }

    // Giải mã nội dung
    decryptContent(encryptedContent) {
        if (!encryptedContent) return '';
        try {
            return decodeURIComponent(escape(atob(encryptedContent)));
        } catch (e) {
            console.error('Giải mã lỗi:', e);
            return encryptedContent; // Trả về nguyên bản nếu lỗi
        }
    }

    // Tải ghi chú từ localStorage và giải mã
    loadNotes() {
        const savedNotes = localStorage.getItem('notebook-notes');
        if (savedNotes) {
            const parsedNotes = JSON.parse(savedNotes);
            // Giải mã nội dung của mỗi ghi chú
            this.notes = parsedNotes.map(note => ({
                ...note,
                content: this.decryptContent(note.content),
                title: this.decryptContent(note.title)
            }));
        } else {
            // Tạo dữ liệu mẫu nếu chưa có
            this.notes = [
                {
                    id: this.generateId(),
                    title: "Chào mừng đến với Notebook!",
                    content: "<p>Đây là ghi chú đầu tiên của bạn. Bạn có thể:</p><ul><li>Chỉnh sửa tiêu đề và nội dung</li><li>Lưu ghi chú bằng nút <strong>Lưu</strong></li><li>Tạo ghi chú mới bằng nút <strong>Tạo mới</strong></li><li>Tìm kiếm ghi chú ở thanh bên trái</li></ul><p>Chúc bạn có trải nghiệm tốt với ứng dụng!</p>",
                    tags: ["hướng dẫn", "mới"],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    title: "Danh sách việc cần làm",
                    content: "<h3>Công việc tuần này:</h3><ul><li><input type='checkbox'> Hoàn thành dự án notebook</li><li><input type='checkbox'> Viết tài liệu hướng dẫn</li><li><input type='checkbox'> Kiểm thử ứng dụng</li><li><input type='checkbox'> Deploy lên server</li></ul>",
                    tags: ["công việc", "quan trọng"],
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.saveNotes();
        }
    }

    // Lưu ghi chú vào localStorage với mã hóa
    saveNotes() {
        // Mã hóa nội dung trước khi lưu
        const notesToSave = this.notes.map(note => ({
            ...note,
            content: this.encryptContent(note.content),
            title: this.encryptContent(note.title)
        }));
        
        localStorage.setItem('notebook-notes', JSON.stringify(notesToSave));
        this.updateStats();
    }

    // Tạo ID ngẫu nhiên
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Thiết lập sự kiện chính
    setupEventListeners() {
        // Nút tạo ghi chú mới
        document.getElementById('new-note-btn').addEventListener('click', () => this.createNewNote());
        
        // Nút lưu ghi chú
        document.getElementById('save-note-btn').addEventListener('click', () => this.saveCurrentNote());
        
        // Nút xóa ghi chú
        document.getElementById('delete-note-btn').addEventListener('click', () => this.deleteCurrentNote());
        
        // Nút xuất ghi chú
        document.getElementById('export-note-btn').addEventListener('click', () => this.exportCurrentNote());
        
        // Tìm kiếm ghi chú
        document.getElementById('search-notes').addEventListener('input', (e) => this.filterNotes(e.target.value));
        
        // Thay đổi tiêu đề
        document.getElementById('note-title-input').addEventListener('input', () => this.enableSaveButton());
        
        // Thay đổi nội dung editor
        document.getElementById('note-editor').addEventListener('input', () => {
            this.enableSaveButton();
            this.updateCharCount();
        });
        
        // Toggle theme
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        
        // Các nút trên thanh công cụ
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = e.target.closest('button').dataset.command;
                this.execEditorCommand(command);
            });
        });
        
        // Thêm thẻ
        document.getElementById('add-tag-btn').addEventListener('click', () => this.addTagToCurrentNote());
        document.getElementById('tag-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTagToCurrentNote();
        });
        
        // Modal
        document.getElementById('help-btn').addEventListener('click', () => this.showHelpModal());
        document.querySelector('.close-modal').addEventListener('click', () => this.hideHelpModal());
        document.getElementById('help-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.hideHelpModal();
        });
        
        // Xuất tất cả
        document.getElementById('export-all-btn').addEventListener('click', () => this.exportAllNotes());
        
        // Import (demo)
        document.getElementById('import-btn').addEventListener('click', () => this.showImportDemo());
    }

    // Cập nhật giao diện
    updateUI() {
        this.renderNotesList();
        this.updateStats();
        this.updateThemeIcon();
        
        // Hiển thị ghi chú đầu tiên nếu có
        if (this.notes.length > 0 && !this.currentNoteId) {
            this.selectNote(this.notes[0].id);
        }
    }

    // Hiển thị danh sách ghi chú
    renderNotesList(filter = '') {
        const notesList = document.getElementById('notes-list');
        const filteredNotes = this.notes.filter(note => 
            note.title.toLowerCase().includes(filter.toLowerCase()) ||
            note.content.toLowerCase().includes(filter.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
        );
        
        if (filteredNotes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-notes">
                    <i class="far fa-clipboard"></i>
                    <p>Không tìm thấy ghi chú phù hợp</p>
                    <p>Thử tìm kiếm với từ khóa khác</p>
                </div>
            `;
            return;
        }
        
        notesList.innerHTML = filteredNotes.map(note => `
            <div class="note-item ${this.currentNoteId === note.id ? 'active' : ''}" data-id="${note.id}">
                <div class="note-title">${this.escapeHtml(note.title) || 'Không có tiêu đề'}</div>
                <div class="note-preview">${this.stripHtml(note.content).substring(0, 60)}...</div>
                <div class="note-date">${this.formatDate(note.updatedAt)}</div>
                ${note.tags.length > 0 ? `<div class="note-tags">${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
            </div>
        `).join('');
        
        // Thêm sự kiện click cho từng ghi chú
        notesList.querySelectorAll('.note-item').forEach(item => {
            item.addEventListener('click', () => {
                const noteId = item.dataset.id;
                this.selectNote(noteId);
            });
        });
    }

    // Chọn ghi chú để chỉnh sửa
    selectNote(noteId) {
        this.currentNoteId = noteId;
        const note = this.notes.find(n => n.id === noteId);
        
        if (note) {
            document.getElementById('note-title-input').value = note.title;
            document.getElementById('note-editor').innerHTML = note.content;
            
            // Cập nhật tags
            this.updateTagsDisplay(note.tags);
            
            // Cập nhật nút
            document.getElementById('save-note-btn').disabled = true;
            document.getElementById('delete-note-btn').disabled = false;
            
            // Cập nhật thời gian lưu
            document.getElementById('last-saved').textContent = `Đã lưu: ${this.formatDate(note.updatedAt, true)}`;
        }
        
        this.updateCharCount();
        this.renderNotesList(document.getElementById('search-notes').value);
    }

    // Tạo ghi chú mới
    createNewNote() {
        const newNote = {
            id: this.generateId(),
            title: "Ghi chú mới",
            content: "<p>Nội dung ghi chú của bạn...</p>",
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.notes.unshift(newNote);
        this.saveNotes();
        this.selectNote(newNote.id);
        
        // Focus vào tiêu đề
        document.getElementById('note-title-input').focus();
        document.getElementById('note-title-input').select();
    }

    // Lưu ghi chú hiện tại
    saveCurrentNote() {
        if (!this.currentNoteId) return;
        
        const noteIndex = this.notes.findIndex(n => n.id === this.currentNoteId);
        if (noteIndex === -1) return;
        
        this.notes[noteIndex].title = document.getElementById('note-title-input').value;
        this.notes[noteIndex].content = document.getElementById('note-editor').innerHTML;
        this.notes[noteIndex].updatedAt = new Date().toISOString();
        
        this.saveNotes();
        this.renderNotesList(document.getElementById('search-notes').value);
        
        // Cập nhật UI
        document.getElementById('save-note-btn').disabled = true;
        document.getElementById('last-saved').textContent = `Đã lưu: ${this.formatDate(new Date(), true)}`;
        
        // Hiệu ứng visual
        const saveBtn = document.getElementById('save-note-btn');
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Đã lưu!';
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu';
        }, 1500);
    }

    // Xóa ghi chú hiện tại
    deleteCurrentNote() {
        if (!this.currentNoteId) return;
        
        if (confirm('Bạn có chắc chắn muốn xóa ghi chú này không?')) {
            const noteIndex = this.notes.findIndex(n => n.id === this.currentNoteId);
            if (noteIndex !== -1) {
                this.notes.splice(noteIndex, 1);
                this.saveNotes();
                
                // Chọn ghi chú khác nếu có
                if (this.notes.length > 0) {
                    this.selectNote(this.notes[0].id);
                } else {
                    // Xóa editor nếu không còn ghi chú
                    this.currentNoteId = null;
                    document.getElementById('note-title-input').value = '';
                    document.getElementById('note-editor').innerHTML = '';
                    document.getElementById('save-note-btn').disabled = true;
                    document.getElementById('delete-note-btn').disabled = true;
                    document.getElementById('last-saved').textContent = 'Chưa lưu';
                    this.updateTagsDisplay([]);
                }
                
                this.renderNotesList(document.getElementById('search-notes').value);
            }
        }
    }

    // Lọc ghi chú
    filterNotes(query) {
        this.renderNotesList(query);
    }

    // Bật nút lưu khi có thay đổi
    enableSaveButton() {
        if (this.currentNoteId) {
            document.getElementById('save-note-btn').disabled = false;
        }
    }

    // Đếm ký tự
    updateCharCount() {
        const editor = document.getElementById('note-editor');
        const text = this.stripHtml(editor.innerHTML);
        document.getElementById('char-count').textContent = `${text.length} ký tự`;
    }

    // Cập nhật thống kê
    updateStats() {
        document.getElementById('total-notes').textContent = this.notes.length;
        
        // Tính dung lượng lưu trữ (ước tính)
        const dataSize = JSON.stringify(this.notes).length;
        const sizeInKB = Math.round(dataSize / 1024 * 10) / 10;
        document.getElementById('storage-used').textContent = `${sizeInKB} KB`;
    }

    // Định dạng ngày tháng
    formatDate(dateString, showTime = false) {
        const date = new Date(dateString);
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        };
        
        if (showTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return date.toLocaleDateString('vi-VN', options);
    }

    // Thiết lập ngày hiện tại
    setCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
        };
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('vi-VN', options);
    }

    // Chuyển đổi theme
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
        localStorage.setItem('notebook-theme', this.isDarkTheme ? 'dark' : 'light');
        this.updateThemeIcon();
    }

    // Cập nhật biểu tượng theme
    updateThemeIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle.querySelector('i');
        
        if (this.isDarkTheme) {
            icon.className = 'fas fa-sun';
            themeToggle.title = 'Chuyển sang chế độ sáng';
        } else {
            icon.className = 'fas fa-moon';
            themeToggle.title = 'Chuyển sang chế độ tối';
        }
    }

    // Thực thi lệnh editor
    execEditorCommand(command) {
        document.execCommand(command, false, null);
        this.enableSaveButton();
    }

    // Thêm thẻ vào ghi chú hiện tại
    addTagToCurrentNote() {
        if (!this.currentNoteId) return;
        
        const tagInput = document.getElementById('tag-input');
        const tag = tagInput.value.trim();
        
        if (tag) {
            const noteIndex = this.notes.findIndex(n => n.id === this.currentNoteId);
            if (noteIndex !== -1) {
                if (!this.notes[noteIndex].tags.includes(tag)) {
                    this.notes[noteIndex].tags.push(tag);
                    this.saveNotes();
                    this.updateTagsDisplay(this.notes[noteIndex].tags);
                    this.enableSaveButton();
                }
                tagInput.value = '';
            }
        }
    }

    // Cập nhật hiển thị thẻ
    updateTagsDisplay(tags) {
        const tagsContainer = document.querySelector('.note-tags');
        if (!tagsContainer) return;
        
        // Xóa các thẻ cũ
        const existingTags = tagsContainer.querySelectorAll('.tag');
        existingTags.forEach(tag => tag.remove());
        
        // Thêm thẻ mới vào trước input
        const tagInput = document.getElementById('tag-input');
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${tag}
                <span class="tag-remove" data-tag="${tag}">×</span>
            `;
            tagsContainer.insertBefore(tagElement, tagInput);
            
            // Sự kiện xóa thẻ
            tagElement.querySelector('.tag-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeTagFromCurrentNote(tag);
            });
        });
    }

    // Xóa thẻ khỏi ghi chú hiện tại
    removeTagFromCurrentNote(tagToRemove) {
        if (!this.currentNoteId) return;
        
        const noteIndex = this.notes.findIndex(n => n.id === this.currentNoteId);
        if (noteIndex !== -1) {
            this.notes[noteIndex].tags = this.notes[noteIndex].tags.filter(tag => tag !== tagToRemove);
            this.saveNotes();
            this.updateTagsDisplay(this.notes[noteIndex].tags);
            this.enableSaveButton();
        }
    }

    // Xuất ghi chú hiện tại
    exportCurrentNote() {
        if (!this.currentNoteId) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note) return;
        
        const content = `Tiêu đề: ${note.title}\n\n${this.stripHtml(note.content)}\n\nThẻ: ${note.tags.join(', ')}\nNgày tạo: ${this.formatDate(note.createdAt, true)}\nNgày sửa: ${this.formatDate(note.updatedAt, true)}`;
        
        this.downloadFile(`${note.title.replace(/[^a-z0-9]/gi, '_')}.txt`, content);
    }

    // Xuất tất cả ghi chú
    exportAllNotes() {
        let content = `NOTEBOOK EXPORT - ${new Date().toLocaleDateString('vi-VN')}\n\n`;
        content += `Tổng số ghi chú: ${this.notes.length}\n\n`;
        
        this.notes.forEach((note, index) => {
            content += `=== GHI CHÚ ${index + 1} ===\n`;
            content += `Tiêu đề: ${note.title}\n`;
            content += `Nội dung:\n${this.stripHtml(note.content)}\n`;
            content += `Thẻ: ${note.tags.join(', ')}\n`;
            content += `Ngày tạo: ${this.formatDate(note.createdAt, true)}\n`;
            content += `Ngày sửa: ${this.formatDate(note.updatedAt, true)}\n\n`;
        });
        
        this.downloadFile(`notebook_export_${new Date().toISOString().slice(0, 10)}.txt`, content);
    }

    // Tải file xuống
    downloadFile(filename, content) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // Hiển thị modal trợ giúp
    showHelpModal() {
        document.getElementById('help-modal').classList.add('active');
    }

    // Ẩn modal trợ giúp
    hideHelpModal() {
        document.getElementById('help-modal').classList.remove('active');
    }

    // Demo import (chức năng đơn giản)
    showImportDemo() {
        alert('Chức năng import đang được phát triển. Hiện tại bạn có thể:\n1. Tạo ghi chú mới\n2. Sao chép nội dung vào editor\n3. Xuất ghi chú ra file TXT');
    }

    // Tiện ích: Loại bỏ HTML
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    // Tiện ích: Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Khởi tạo ứng dụng khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra theme đã lưu
    const savedTheme = localStorage.getItem('notebook-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Khởi tạo app
    window.notebookApp = new NotebookApp();
    
    // Thêm hiệu ứng khởi động
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});