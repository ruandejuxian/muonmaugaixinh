# Thư Viện Ảnh - Modern Photo Gallery

Thư Viện Ảnh là một ứng dụng web hiện đại để chia sẻ và quản lý bộ sưu tập ảnh, sử dụng Google Drive làm nơi lưu trữ và Google Sheets làm cơ sở dữ liệu.

## Tính năng chính

- **Giao diện hiện đại**: Thiết kế responsive, tương thích với mọi thiết bị
- **Phân loại ảnh**: Chia ảnh thành các danh mục (Gái Việt, Gái Âu Mỹ, Gái Châu Á, Nơi Khác)
- **Tải lên ảnh**: Kéo thả hoặc chọn ảnh để tải lên, hỗ trợ tải nhiều ảnh cùng lúc
- **Thông tin người mẫu**: Hiển thị tên và liên kết mạng xã hội của người mẫu
- **Trình xem ảnh**: Zoom, pan, tải về ảnh gốc hoặc ảnh đã resize
- **Tương tác**: Thích ảnh, thêm ghi chú, chia sẻ lên Facebook
- **Thống kê**: Đếm lượt xem, lượt thích cho mỗi ảnh
- **Tích hợp Google**: Lưu trữ ảnh trên Google Drive, metadata trên Google Sheets

## Cài đặt và Cấu hình

### Yêu cầu

- Tài khoản Google với Google Drive và Google Sheets
- Tài khoản Cloudflare (để tạo Cloudflare Worker)
- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari)

### Bước 1: Cấu hình Google Cloud Platform

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo dự án mới
3. Bật Google Drive API và Google Sheets API
4. Tạo thông tin xác thực (API key và OAuth client ID)
5. Thêm domain của bạn vào danh sách domain được phép

### Bước 2: Cấu hình Google Drive

1. Tạo thư mục chính trên Google Drive
2. Tạo các thư mục con cho từng danh mục (Gái Việt, Gái Âu Mỹ, Gái Châu Á, Nơi Khác)
3. Chia sẻ các thư mục này ở chế độ công khai hoặc giới hạn theo nhu cầu
4. Lưu ID của thư mục chính và các thư mục con

### Bước 3: Cấu hình Google Sheets

1. Tạo Google Sheet mới
2. Mở Tools > Script editor
3. Tạo một Apps Script mới với nội dung từ file `google-apps-script.js`
4. Triển khai script dưới dạng web app
5. Lưu URL của web app

### Bước 4: Cấu hình Cloudflare Worker

1. Tạo tài khoản Cloudflare (nếu chưa có)
2. Tạo Cloudflare Worker mới
3. Sao chép nội dung từ file `cloudflare-worker.js` vào worker
4. Triển khai worker và lưu URL

### Bước 5: Cấu hình ứng dụng web

1. Mở file `js/config.js`
2. Cập nhật các thông tin cấu hình:
   - API key và Client ID của Google
   - ID các thư mục Google Drive
   - URL của Cloudflare Worker
   - URL của Google Apps Script
   - ID của Google Sheet

## Triển khai

1. Tải mã nguồn lên máy chủ web của bạn
2. Đảm bảo tất cả các file CSS và JavaScript được tải đúng
3. Truy cập trang web và kiểm tra các tính năng

## Cấu trúc thư mục

```
/
├── index.html          # Trang chính
├── css/
│   ├── style.css       # Styles chính
│   └── footer.css      # Styles cho footer
├── js/
│   ├── config.js       # Cấu hình ứng dụng
│   ├── drive-api.js    # Tích hợp Google Drive API
│   ├── sheets-api.js   # Tích hợp Google Sheets API
│   ├── image-viewer.js # Trình xem ảnh
│   ├── upload.js       # Xử lý tải lên ảnh
│   ├── model-info.js   # Quản lý thông tin người mẫu
│   ├── footer.js       # Chức năng footer
│   └── main.js         # Mã chính của ứng dụng
└── images/             # Ảnh và icons
```

## Đóng góp

Nếu bạn muốn đóng góp vào dự án, vui lòng tạo pull request hoặc báo cáo lỗi qua mục Issues.

## Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem file LICENSE để biết thêm chi tiết.
