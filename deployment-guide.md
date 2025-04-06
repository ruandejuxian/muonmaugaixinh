# Hướng dẫn triển khai dự án VNGirls

Tài liệu này hướng dẫn chi tiết cách triển khai dự án VNGirls - website chia sẻ và lưu trữ ảnh.

## Yêu cầu hệ thống

- Máy chủ web (có thể là hosting, VPS, hoặc dịch vụ lưu trữ tĩnh như GitHub Pages, Netlify, Vercel)
- Tài khoản Google để sử dụng Google Drive và Google Sheets
- Tài khoản Cloudflare để triển khai Cloudflare Workers

## Bước 1: Chuẩn bị Google Drive

1. Tạo một thư mục gốc trên Google Drive để lưu trữ ảnh
2. Tạo các thư mục con cho từng danh mục:
   - Gái Âu Mỹ
   - Gái Châu Á
   - Gái Việt
   - Nơi Khác
   - Chưa duyệt (cho ảnh chờ phê duyệt)
3. Chia sẻ các thư mục này với quyền "Bất kỳ ai có đường link đều có thể xem"
4. Lưu lại ID của các thư mục (phần cuối của URL khi mở thư mục)

## Bước 2: Chuẩn bị Google Sheets

1. Tạo một Google Sheet mới
2. Tạo các sheet sau:
   - "Danh sách ảnh" với các cột: Thời gian, URL ảnh, Ghi chú, Ghi chú admin
   - "Chưa duyệt" với các cột: Thời gian, Danh mục, Tên người mẫu, Liên kết mạng xã hội, Tên người gửi, Tên file, Trạng thái
3. Lưu lại ID của Google Sheet (phần trong URL giữa /d/ và /edit)

## Bước 3: Cài đặt Google Apps Script

1. Mở Google Sheet đã tạo
2. Chọn Extensions > Apps Script
3. Xóa mã mẫu và dán nội dung từ file `js/google-apps-script.js`
4. Lưu và đặt tên cho dự án (ví dụ: "VNGirls Sheet Handler")
5. Triển khai ứng dụng:
   - Nhấn nút "Deploy" > "New deployment"
   - Chọn loại là "Web app"
   - Đặt mô tả (ví dụ: "VNGirls API v1")
   - Trong phần "Execute as", chọn "Me"
   - Trong phần "Who has access", chọn "Anyone"
   - Nhấn "Deploy"
6. Sao chép URL web app được cung cấp sau khi triển khai

## Bước 4: Cài đặt Cloudflare Worker

1. Đăng nhập vào tài khoản Cloudflare
2. Chọn "Workers & Pages" từ menu bên trái
3. Nhấn "Create application" > "Create Worker"
4. Đặt tên cho worker (ví dụ: "vngirls-proxy")
5. Xóa mã mẫu và dán nội dung từ file `js/cloudflare-worker.js`
6. Nhấn "Save and deploy"
7. Sao chép URL của worker (sẽ có dạng https://vngirls-proxy.your-subdomain.workers.dev)

## Bước 5: Cấu hình dự án

1. Mở file `js/config.js`
2. Cập nhật các thông tin sau:
   - `apiKey`: API key của Google (tạo tại https://console.cloud.google.com)
   - `clientId`: Client ID của Google (tạo tại https://console.cloud.google.com)
   - `folderIds`: ID của các thư mục Google Drive đã tạo
   - `proxyUrl`: URL của Cloudflare Worker đã triển khai
   - `scriptUrl`: URL của Google Apps Script đã triển khai
   - `sheetId`: ID của Google Sheet đã tạo

## Bước 6: Triển khai website

### Phương án 1: Sử dụng GitHub Pages

1. Tạo repository mới trên GitHub
2. Đẩy toàn bộ mã nguồn lên repository
3. Vào Settings > Pages
4. Trong phần "Source", chọn branch chính (thường là "main")
5. Nhấn "Save"
6. GitHub sẽ cung cấp URL của website (thường có dạng https://username.github.io/repository-name)

### Phương án 2: Sử dụng Netlify

1. Đăng nhập vào Netlify
2. Nhấn "New site from Git"
3. Chọn GitHub và repository chứa mã nguồn
4. Cấu hình triển khai:
   - Build command: để trống
   - Publish directory: .
5. Nhấn "Deploy site"
6. Netlify sẽ cung cấp URL của website (có thể tùy chỉnh trong phần "Site settings")

### Phương án 3: Sử dụng hosting thông thường

1. Tải toàn bộ mã nguồn lên máy chủ web thông qua FTP hoặc SSH
2. Đảm bảo tất cả các file đều được tải lên đúng cấu trúc thư mục
3. Truy cập website thông qua tên miền đã cấu hình

## Bước 7: Kiểm tra và sử dụng

1. Truy cập website đã triển khai
2. Kiểm tra các tính năng:
   - Xem danh sách ảnh
   - Tìm kiếm ảnh
   - Tải ảnh lên
   - Tải album lên
   - Xem và tương tác với ảnh

## Xử lý sự cố

### Vấn đề CORS

Nếu gặp lỗi CORS khi truy cập Google Drive:
1. Kiểm tra Cloudflare Worker đã được cấu hình đúng
2. Đảm bảo URL của worker đã được cập nhật trong `config.js`
3. Kiểm tra quyền truy cập của thư mục Google Drive

### Lỗi xác thực Google API

Nếu gặp lỗi xác thực:
1. Kiểm tra API key và Client ID đã được cấu hình đúng
2. Đảm bảo đã bật các API cần thiết trong Google Cloud Console:
   - Google Drive API
   - Google Sheets API
3. Kiểm tra domain của website đã được thêm vào danh sách được phép trong cài đặt OAuth

### Lỗi Google Apps Script

Nếu không gửi được dữ liệu đến Google Sheet:
1. Kiểm tra URL của Apps Script đã được cấu hình đúng
2. Đảm bảo đã cấp quyền "Execute as Me" khi triển khai
3. Kiểm tra cấu trúc của Google Sheet có khớp với mã trong Apps Script

## Bảo trì và cập nhật

1. Định kỳ kiểm tra Google Sheet để duyệt ảnh mới
2. Cập nhật mã nguồn khi cần thiết
3. Theo dõi sử dụng API để đảm bảo không vượt quá giới hạn miễn phí

## Liên hệ hỗ trợ

Nếu cần hỗ trợ thêm, vui lòng liên hệ qua email hoặc mạng xã hội được cung cấp trong phần footer của website.
