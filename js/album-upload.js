// Album upload functionality
class AlbumUploadHandler extends UploadHandler {
  constructor() {
    super();
    this.init();
  }
  
  init() {
    // Add render album button to album upload tab
    const albumUploadActions = document.querySelector('#album-upload-tab .upload-actions');
    if (albumUploadActions) {
      const renderButton = document.createElement('button');
      renderButton.className = 'btn btn-outline';
      renderButton.id = 'render-album-button';
      renderButton.textContent = 'Hiển thị album';
      albumUploadActions.insertBefore(renderButton, albumUploadActions.firstChild);
    }
  }
  
  async submitAlbumUpload() {
    // Validate form
    const albumName = document.getElementById('album-name').value;
    const modelName = document.getElementById('album-model-name').value;
    const senderName = document.getElementById('album-sender-name').value;
    const driveLink = document.getElementById('album-drive-link').value;
    const category = document.getElementById('album-category').value;
    
    if (!senderName) {
      showToast('Vui lòng nhập tên người gửi', 'error');
      return;
    }
    
    if (this.selectedFiles.length === 0 && !driveLink) {
      showToast('Vui lòng chọn ít nhất một ảnh hoặc nhập link Google Drive', 'error');
      return;
    }
    
    // Show loading
    showLoading(true);
    
    try {
      // Prepare data for Google Sheet
      const data = {
        albumName: albumName || 'Album không tên',
        modelName: modelName || 'Không có',
        senderName: senderName,
        category: category || 'Chưa phân loại',
        driveLink: driveLink || 'Không có',
        fileCount: this.selectedFiles.length,
        timestamp: new Date().toISOString()
      };
      
      // Send to Google Sheet
      await sheetsApi.sendToPendingSheet(data);
      
      // Show success message
      showToast('Album đã được gửi thành công!');
      
      // Hide modal
      this.hideModal();
    } catch (error) {
      console.error('Error uploading album:', error);
      showToast('Có lỗi xảy ra khi gửi album. Vui lòng thử lại sau.', 'error');
    } finally {
      // Hide loading
      showLoading(false);
    }
  }
}

// Create album upload handler instance
const albumUploadHandler = new AlbumUploadHandler();
window.albumUploadHandler = albumUploadHandler;
