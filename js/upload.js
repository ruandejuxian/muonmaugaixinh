// Upload functionality
class UploadHandler {
  constructor() {
    this.modal = null;
    this.dropArea = null;
    this.fileInput = null;
    this.selectedFiles = [];
    this.maxUploadSingleImage = CONFIG.ui.maxUploadSingleImage;
    this.maxUploadAlbumImages = CONFIG.ui.maxUploadAlbumImages;
    
    this.init();
  }
  
  init() {
    // Create upload modal
    this.createModal();
    
    // Add event listeners
    this.addEventListeners();
  }
  
  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'upload-modal';
    this.modal.id = 'upload-modal';
    
    this.modal.innerHTML = `
      <div class="upload-modal-content">
        <div class="upload-modal-header">
          <h2>Gửi ảnh</h2>
          <button class="upload-modal-close">&times;</button>
        </div>
        <div class="upload-modal-tabs">
          <button class="upload-tab-button active" data-tab="single">Ảnh đơn</button>
          <button class="upload-tab-button" data-tab="album">Album</button>
        </div>
        <div class="upload-modal-body">
          <div class="upload-tab-content active" id="single-upload-tab">
            <div class="upload-form">
              <div class="upload-drop-area" id="single-drop-area">
                <p>Kéo và thả ảnh vào đây hoặc</p>
                <button class="btn btn-primary">Chọn ảnh</button>
                <input type="file" id="single-file-input" accept="image/*" hidden>
              </div>
              <div class="selected-files" id="single-selected-files"></div>
              <div class="upload-form-fields">
                <div class="form-group">
                  <label for="single-model-name">Tên người mẫu (nếu có)</label>
                  <input type="text" id="single-model-name" placeholder="Nhập tên người mẫu">
                </div>
                <div class="form-group">
                  <label for="single-sender-name">Tên người gửi</label>
                  <input type="text" id="single-sender-name" placeholder="Nhập tên của bạn" required>
                </div>
              </div>
              <div class="upload-actions">
                <button class="btn btn-primary" id="single-upload-button">Gửi ảnh</button>
              </div>
            </div>
          </div>
          <div class="upload-tab-content" id="album-upload-tab">
            <div class="upload-form">
              <div class="form-group">
                <label for="album-name">Tên album (nếu có)</label>
                <input type="text" id="album-name" placeholder="Nhập tên album">
              </div>
              <div class="form-group">
                <label for="album-model-name">Tên người mẫu (nếu có)</label>
                <input type="text" id="album-model-name" placeholder="Nhập tên người mẫu">
              </div>
              <div class="form-group">
                <label for="album-sender-name">Tên người gửi</label>
                <input type="text" id="album-sender-name" placeholder="Nhập tên của bạn" required>
              </div>
              <div class="form-group">
                <label for="album-drive-link">Link album Google Drive</label>
                <input type="text" id="album-drive-link" placeholder="https://drive.google.com/drive/folders/...">
              </div>
              <div class="upload-drop-area" id="album-drop-area">
                <p>Kéo và thả ảnh vào đây hoặc</p>
                <button class="btn btn-primary">Chọn ảnh</button>
                <input type="file" id="album-file-input" accept="image/*" multiple hidden>
              </div>
              <div class="selected-files" id="album-selected-files"></div>
              <div class="upload-actions">
                <button class="btn btn-primary" id="album-upload-button">Gửi album</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.modal);
    
    // Get elements
    this.singleDropArea = document.getElementById('single-drop-area');
    this.singleFileInput = document.getElementById('single-file-input');
    this.albumDropArea = document.getElementById('album-drop-area');
    this.albumFileInput = document.getElementById('album-file-input');
  }
  
  addEventListeners() {
    // Upload button
    const uploadButton = document.getElementById('upload-button');
    if (uploadButton) {
      uploadButton.addEventListener('click', () => this.showModal());
    }
    
    // Close button
    const closeButton = this.modal.querySelector('.upload-modal-close');
    closeButton.addEventListener('click', () => this.hideModal());
    
    // Tab buttons
    const tabButtons = this.modal.querySelectorAll('.upload-tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        const tabContents = this.modal.querySelectorAll('.upload-tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        const tabContent = document.getElementById(`${tabId}-upload-tab`);
        if (tabContent) {
          tabContent.classList.add('active');
        }
      });
    });
    
    // Single file drop area
    if (this.singleDropArea) {
      this.singleDropArea.addEventListener('click', () => {
        this.singleFileInput.click();
      });
      
      this.singleDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.singleDropArea.classList.add('dragover');
      });
      
      this.singleDropArea.addEventListener('dragleave', () => {
        this.singleDropArea.classList.remove('dragover');
      });
      
      this.singleDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        this.singleDropArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
          this.handleSingleFileSelect(e.dataTransfer.files);
        }
      });
    }
    
    // Single file input
    if (this.singleFileInput) {
      this.singleFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleSingleFileSelect(e.target.files);
        }
      });
    }
    
    // Album file drop area
    if (this.albumDropArea) {
      this.albumDropArea.addEventListener('click', () => {
        this.albumFileInput.click();
      });
      
      this.albumDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.albumDropArea.classList.add('dragover');
      });
      
      this.albumDropArea.addEventListener('dragleave', () => {
        this.albumDropArea.classList.remove('dragover');
      });
      
      this.albumDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        this.albumDropArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
          this.handleAlbumFileSelect(e.dataTransfer.files);
        }
      });
    }
    
    // Album file input
    if (this.albumFileInput) {
      this.albumFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleAlbumFileSelect(e.target.files);
        }
      });
    }
    
    // Upload buttons
    const singleUploadButton = document.getElementById('single-upload-button');
    if (singleUploadButton) {
      singleUploadButton.addEventListener('click', () => this.submitSingleUpload());
    }
    
    const albumUploadButton = document.getElementById('album-upload-button');
    if (albumUploadButton) {
      albumUploadButton.addEventListener('click', () => this.submitAlbumUpload());
    }
    
    // Close modal when clicking outside
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });
  }
  
  showModal() {
    this.modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  
  hideModal() {
    this.modal.classList.remove('show');
    document.body.style.overflow = '';
    this.resetForms();
  }
  
  resetForms() {
    // Reset single upload form
    const singleModelName = document.getElementById('single-model-name');
    const singleSenderName = document.getElementById('single-sender-name');
    const singleSelectedFiles = document.getElementById('single-selected-files');
    
    if (singleModelName) singleModelName.value = '';
    if (singleSenderName) singleSenderName.value = '';
    if (singleSelectedFiles) singleSelectedFiles.innerHTML = '';
    
    // Reset album upload form
    const albumName = document.getElementById('album-name');
    const albumModelName = document.getElementById('album-model-name');
    const albumSenderName = document.getElementById('album-sender-name');
    const albumDriveLink = document.getElementById('album-drive-link');
    const albumSelectedFiles = document.getElementById('album-selected-files');
    
    if (albumName) albumName.value = '';
    if (albumModelName) albumModelName.value = '';
    if (albumSenderName) albumSenderName.value = '';
    if (albumDriveLink) albumDriveLink.value = '';
    if (albumSelectedFiles) albumSelectedFiles.innerHTML = '';
    
    // Reset selected files
    this.selectedFiles = [];
  }
  
  handleSingleFileSelect(files) {
    // Limit to one file for single upload
    if (files.length > this.maxUploadSingleImage) {
      showToast(`Chỉ có thể tải lên ${this.maxUploadSingleImage} ảnh cho mỗi lần tải đơn.`, 'error');
      return;
    }
    
    // Store selected file
    this.selectedFiles = Array.from(files);
    
    // Display selected file
    const selectedFilesContainer = document.getElementById('single-selected-files');
    if (selectedFilesContainer) {
      selectedFilesContainer.innerHTML = '';
      
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const filePreview = document.createElement('div');
          filePreview.className = 'file-preview';
          
          filePreview.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}">
            <div class="file-info">
              <div class="file-name">${file.name}</div>
              <div class="file-size">${this.formatFileSize(file.size)}</div>
            </div>
            <button class="file-remove" data-name="${file.name}">&times;</button>
          `;
          
          selectedFilesContainer.appendChild(filePreview);
          
          // Add remove button event listener
          const removeButton = filePreview.querySelector('.file-remove');
          removeButton.addEventListener('click', () => {
            this.removeFile(file.name);
            filePreview.remove();
          });
        }.bind(this);
        
        reader.readAsDataURL(file);
      });
    }
  }
  
  handleAlbumFileSelect(files) {
    // Limit to max files for album upload
    if (files.length > this.maxUploadAlbumImages) {
      showToast(`Chỉ có thể tải lên ${this.maxUploadAlbumImages} ảnh cho mỗi album.`, 'error');
      return;
    }
    
    // Store selected files
    this.selectedFiles = Array.from(files);
    
    // Display selected files
    const selectedFilesContainer = document.getElementById('album-selected-files');
    if (selectedFilesContainer) {
      selectedFilesContainer.innerHTML = '';
      
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const filePreview = document.createElement('div');
          filePreview.className = 'file-preview';
          
          filePreview.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}">
            <div class="file-info">
              <div class="file-name">${file.name}</div>
              <div class="file-size">${this.formatFileSize(file.size)}</div>
            </div>
            <button class="file-remove" data-name="${file.name}">&times;</button>
          `;
          
          selectedFilesContainer.appendChild(filePreview);
          
          // Add remove button event listener
          const removeButton = filePreview.querySelector('.file-remove');
          removeButton.addEventListener('click', () => {
            this.removeFile(file.name);
            filePreview.remove();
          });
        }.bind(this);
        
        reader.readAsDataURL(file);
      });
    }
  }
  
  removeFile(fileName) {
    this.selectedFiles = this.selectedFiles.filter(file => file.name !== fileName);
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  async submitSingleUpload() {
    // Validate form
    const modelName = document.getElementById('single-model-name').value;
    const senderName = document.getElementById('single-sender-name').value;
    
    if (!senderName) {
      showToast('Vui lòng nhập tên người gửi', 'error');
      return;
    }
    
    if (this.selectedFiles.length === 0) {
      showToast('Vui lòng chọn ít nhất một ảnh', 'error');
      return;
    }
    
    // Show loading
    showLoading(true);
    
    try {
      // Upload file to Google Drive
      const file = this.selectedFiles[0];
      const folderId = CONFIG.driveApi.folderIds.pending;
      
      // For demo, we'll just simulate the upload
      console.log('Uploading file:', file.name);
      console.log('Model name:', modelName);
      console.log('Sender name:', senderName);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      showToast('Ảnh đã được tải lên thành công!');
      
      // Hide modal
      this.hideModal();
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Có lỗi xảy ra khi tải ảnh. Vui lòng thử lại sau.', 'error');
    } finally {
      // Hide loading
      showLoading(false);
    }
  }
  
  async submitAlbumUpload() {
    // This method will be overridden by album-upload.js
    console.log('Submit album upload');
  }
}

// Create upload handler instance
const uploadHandler = new UploadHandler();
window.uploadHandler = uploadHandler;
