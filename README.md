# Notebook Web Application

Ứng dụng web ghi chú đầy đủ tính năng với bảo vệ bằng mã, có thể deploy lên mọi server hỗ trợ Node.js.

## Tính năng chính

- 🔐 **Bảo vệ bằng mã** - Yêu cầu nhập mã để truy cập ứng dụng
- 📝 **Tạo, chỉnh sửa, xóa ghi chú** với editor WYSIWYG
- 🏷️ **Thêm thẻ (tags)** để phân loại ghi chú
- 🔍 **Tìm kiếm ghi chú** theo tiêu đề, nội dung và thẻ
- 🌓 **Chế độ sáng/tối** tùy chọn
- 🔒 **Mã hóa nội dung** - Nội dung được mã hóa khi lưu trữ
- 💾 **Lưu trữ cục bộ** (LocalStorage) hoặc trên server
- 📤 **Xuất ghi chú** ra file TXT (cả đơn lẻ và toàn bộ)
- 📱 **Responsive design** hoạt động trên mọi thiết bị

## Cấu trúc dự án

```

notebook-web-app/
├── public/ # Frontend files
│ ├── css/
│ │ └── style.css # Stylesheet chính
│ ├── js/
│ │ └── app.js # JavaScript application với bảo mật
│ ├── images/ # Thư mục hình ảnh
│ └── index.html # Trang chính với bảo vệ mã
├── server.js # Backend Node.js/Express
├── package.json # Dependencies và scripts
└── README.md # Tài liệu này

```

## Cài đặt và chạy local

### Yêu cầu
- Node.js (version 14.0.0 trở lên)
- npm hoặc yarn

### Các bước

1. **Clone/Sao chép dự án**
 ```bash
 git clone <repository-url>
 cd notebook-web-app
```

1. **Cài đặt dependencies**bash
```
npm install
```

2. **Chạy ứng dụng**bash
```
npm start
```

Hoặc chạy với nodemon để tự động reload:bash
```
npm run dev
```

3. **Truy cập ứng dụng**
Mở trình duyệt và truy cập: `http://localhost:3000`
## Hướng dẫn sử dụng

### Đăng nhập lần đầu

- Mã mặc định: `123456`
- Bạn có thể thay đổi mã sau khi đăng nhập (chức năng nâng cao)
### Tạo ghi chú mới

1. Nhấn nút "Tạo mới" ở thanh bên trái
2. Nhập tiêu đề và nội dung
3. Sử dụng thanh công cụ để định dạng văn bản
4. Nhấn "Lưu" để lưu ghi chú
### Quản lý ghi chú

- **Tìm kiếm**: Nhập từ khóa vào ô tìm kiếm
- **Thêm thẻ**: Nhập thẻ vào ô "Thêm thẻ..." và nhấn Enter
- **Xuất ghi chú**: Nhấn nút "Xuất" để tải về file TXT
- **Xóa ghi chú**: Chọn ghi chú và nhấn "Xóa"
### Bảo mật

- Nội dung ghi chú được mã hóa bằng Base64 trước khi lưu
- Mã truy cập được lưu trong localStorage
- Để đăng xuất, xóa localStorage hoặc đóng trình duyệt
## Deploy lên server

### 1. Deploy lên Heroku

bash
```
# Đăng nhập Heroku
heroku login

# Tạo ứng dụng Heroku
heroku create notebook-web-app

# Deploy code
git push heroku main

# Mở ứng dụng
heroku open
```

### 2. Deploy lên Vercel

bash
```
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy production
vercel --prod
```

### 3. Deploy lên server riêng (VPS)

bash
```
# 
code lên server
scp -r . user@your-server:/var/www/notebook

# SSH vào server
ssh user@your-server

# Cài đặt Node.js và dependencies
cd /var/www/notebook
npm install --production

# Chạy với PM2 (recommended)
npm install -g pm2
pm2 start server.js --name notebook-app
pm2 save
pm2 startup

# Cấu hình Nginx làm reverse proxy (tùy chọn)
```

### 4. Deploy lên GitHub Pages (chỉ frontend)

1. Build static files
2. Push lên branch `gh-pages`
3. Kích hoạt GitHub Pages trong repository settings
## Cấu hình môi trường

### Biến môi trường

Tạo file `.env` trong thư mục gốc:

```
PORT=3000
NODE_ENV=production
SECRET_KEY=your-secret-key-here
```

### Đổi cổng mặc định

Sửa file `server.js`:

javascript
```
const PORT = process.env.PORT || 3000; // Thay đổi 3000 thành cổng bạn muốn
```

## API Endpoints (Backend)

- `GET /` - Phục vụ frontend
- `GET /api/notes` - Lấy tất cả ghi chú
- `POST /api/notes` - Lưu ghi chú mới/cập nhật
- `DELETE /api/notes/:id` - Xóa ghi chú
- `GET /api/export` - Xuất tất cả ghi chú (JSON)
## Xử lý sự cố

### Lỗi "Cannot find module"

bash
```
npm install
```

### Lỗi cổng đã được sử dụng

Thay đổi cổng trong file `server.js` hoặc biến môi trường `PORT`

### Quên mật khẩu

Xóa localStorage của trình duyệt hoặc truy cập DevTools:

javascript
```
localStorage.removeItem('notebook-password');
localStorage.removeItem('notebook-authenticated');
```

## Bảo mật nâng cao

Để tăng cường bảo mật:

1. Thay đổi mã mặc định ngay sau lần đăng nhập đầu tiên
2. Sử dụng HTTPS khi deploy production
3. Thêm xác thực người dùng (username/password)
4. Mã hóa nội dung với thuật toán mạnh hơn (AES)
## Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request
## Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## Liên hệ

Tạo issue trên GitHub repository nếu bạn có câu hỏi hoặc gặp vấn đề.

```

## Chúc mừng!

Bạn đã cài đặt thành công Notebook Web App. Ứng dụng này hoàn toàn có thể deploy lên server và sẵn sàng sử dụng.