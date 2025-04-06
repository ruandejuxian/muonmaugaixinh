// Upload functionality
class UploadHandler {
  constructor() {
    this.uploadModal = null;
    this.dropArea = null;
    this.fileInput = null;
    this.selectedFiles = [];
    this.maxSingleImageUpload = CONFIG.ui.maxUploadSingleImage;
    this.maxAlbumImagesUpload = CONFIG.ui.maxUploadAlbumImages;
    this.uploadType = 'image'; // 'image' or 'album'
    
    this.init();
  }
  
  init() {
    // Create upload modal
    this.createUploadModal();
    
    // Add event listeners
    this.addEventListeners();
  }
  
  createUploadModal() {
    this.uploadModal = document.createElement('div');
    this.uploadModal.className = 'upload-modal';
    this.uploadModal.innerHTML = `
      <div class="upload-modal-content">
        <div class="upload-modal-header">
          <h2>Tải ảnh lên</h2>
          <button class="upload-modal-close">&times;</button>
        </div>
        <div class="upload-modal-tabs">
          <button class="upload-tab-button active" data-tab="image">Tải ảnh</button>
          <button class="upload-tab-button" data-tab="album">Tải album</button>
        </div>
        <div class="upload-modal-body">
          <div class="upload-tab-content active" id="image-upload-tab">
            <div class="form-group">
              <label for="image-category">Danh mục</label>
              <select id="image-category" required>
                <option value="">-- Chọn danh mục --</option>
                <option value="western">Gái Âu Mỹ</option>
                <option value="asian">Gái Châu Á</option>
                <option value="vietnam">Gái Việt</option>
                <option value="other">Nơi Khác</option>
              </select>
            </div>
            <div class="form-group">
              <label for="image-model-name">Tên người mẫu (nếu có)</label>
              <input type="text" id="image-model-name" placeholder="Nhập tên người mẫu">
            </div>
            <div class="form-group">
              <label for="image-social-link">Liên kết mạng xã hội (nếu có)</label>
              <input type="text" id="image-social-link" placeholder="Nhập liên kết mạng xã hội">
            </div>
            <div class="form-group">
              <label for="image-sender-name">Tên người gửi</label>
              <input type="text" id="image-sender-name" placeholder="Nhập tên của bạn" required>
            </div>
            <div class="upload-area" id="image-drop-area">
              <p>Kéo và thả ảnh vào đây hoặc</p>
              <button class="upload-button">Chọn ảnh</button>
              <input type="file" id="image-file-input" accept="image/*" hidden>
              <p class="upload-limit">Tối đa 1 ảnh</p>
            </div>
            <div class="selected-files" id="image-selected-files"></div>
          </div>
          
          <div class="upload-tab-content" id="album-upload-tab">
            <div class="form-group">
              <label for="album-name">Tên Album (nếu có)</label>
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
            <div class="upload-area" id="album-drop-area">
              <p>Kéo và thả ảnh vào đây hoặc</p>
              <button class="upload-button">Chọn ảnh</button>
              <input type="file" id="album-file-input" accept="image/*" multiple hidden>
              <p class="upload-limit">Tối đa 20 ảnh</p>
            </div>
            <div class="selected-files" id="album-selected-files"></div>
          </div>
        </div>
        <div class="upload-modal-footer">
          <button class="upload-submit-button">Gửi</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.uploadModal);
    
    // Get elements
    this.imageDropArea = document.getElementById('image-drop-area');
    this.imageFileInput = document.getElementById('image-file-input');
    this.imageSelectedFiles = document.getElementById('image-selected-files');
    
    this.albumDropArea = document.getElementById('album-drop-area');
    this.albumFileInput = document.getElementById('album-file-input');
    this.albumSelectedFiles = document.getElementById('album-selected-files');
  }
  
  addEventListeners() {
    // Close modal
    const closeButton = this.uploadModal.querySelector('.upload-modal-close');
    closeButton.addEventListener('click', this.hideModal.bind(this));
    
    // Tab switching
    const tabButtons = this.uploadModal.querySelectorAll('.upload-tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.switchTab(button.dataset.tab);
      });
    });
    
    // Image upload
    this.imageDropArea.addEventListener('click', () => {
      this.imageFileInput.click();
    });
    
    this.imageFileInput.addEventListener('change', () => {
      this.handleImageFiles(this.imageFileInput.files);
    });
    
    this.imageDropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.imageDropArea.classList.add('active');
    });
    
    this.imageDropArea.addEventListener('dragleave', () => {
      this.imageDropArea.classList.remove('active');
    });
    
    this.imageDropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.imageDropArea.classList.remove('active');
      this.handleImageFiles(e.dataTransfer.files);
    });
    
    // Album upload
    this.albumDropArea.addEventListener('click', () => {
      this.albumFileInput.click();
    });
    
    this.albumFileInput.addEventListener('change', () => {
      this.handleAlbumFiles(this.albumFileInput.files);
    });
    
    this.albumDropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.albumDropArea.classList.add('active');
    });
    
    this.albumDropArea.addEventListener('dragleave', () => {
      this.albumDropArea.classList.remove('active');
    });
    
    this.albumDropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.albumDropArea.classList.remove('active');
      this.handleAlbumFiles(e.dataTransfer.files);
    });
    
    // Submit button
    const submitButton = this.uploadModal.querySelector('.upload-submit-button');
    submitButton.addEventListener('click', this.handleSubmit.bind(this));
  }
  
  showModal() {
    this.uploadModal.classList.add('show');
    // Reset form
    this.resetForm();
  }
  
  hideModal() {
    this.uploadModal.classList.remove('show');
  }
  
  switchTab(tab) {
    this.uploadType = tab;
    
    // Update active tab button
    const tabButtons = this.uploadModal.querySelectorAll('.upload-tab-button');
    tabButtons.forEach(button => {
      if (button.dataset.tab === tab) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Update active tab content
    const tabContents = this.uploadModal.querySelectorAll('.upload-tab-content');
    tabContents.forEach(content => {
      if (content.id === `${tab}-upload-tab`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
    
    // Reset selected files
    this.selectedFiles = [];
    this.imageSelectedFiles.innerHTML = '';
    this.albumSelectedFiles.innerHTML = '';
  }
  
  handleImageFiles(files) {
    if (files.length === 0) return;
    
    // Limit to max files
    const maxFiles = this.maxSingleImageUpload;
    if (this.selectedFiles.length + files.length > maxFiles) {
      alert(`Bạn chỉ có thể tải lên tối đa ${maxFiles} ảnh.`);
      return;
    }
    
    // Process files
    for (let i = 0; i < files.length && this.selectedFiles.length < maxFiles; i++) {
      const file = files[i];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chỉ tải lên file ảnh.');
        continue;
      }
      
      // Add to selected files
      this.selectedFiles.push(file);
      
      // Create preview
      this.createFilePreview(file, this.imageSelectedFiles);
    }
  }
  
  handleAlbumFiles(files) {
    if (files.length === 0) return;
    
    // Limit to max files
    const maxFiles = this.maxAlbumImagesUpload;
    if (this.selectedFiles.length + files.length > maxFiles) {
      alert(`Bạn chỉ có thể tải lên tối đa ${maxFiles} ảnh.`);
      return;
    }
    
    // Process files
    for (let i = 0; i < files.length && this.selectedFiles.length < maxFiles; i++) {
      const file = files[i];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chỉ tải lên file ảnh.');
        continue;
      }
      
      // Add to selected files
      this.selectedFiles.push(file);
      
      // Create preview
      this.createFilePreview(file, this.albumSelectedFiles);
    }
  }
  
  createFilePreview(file, container) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const preview = document.createElement('div');
      preview.className = 'file-preview';
      preview.innerHTML = `
        <img src="${e.target.result}" alt="${file.name}">
        <div class="file-info">
          <span class="file-name">${file.name}</span>
          <span class="file-size">${this.formatFileSize(file.size)}</span>
        </div>
        <button class="remove-file" data-name="${file.name}">&times;</button>
      `;
      
      // Add remove button event
      const removeButton = preview.querySelector('.remove-file');
      removeButton.addEventListener('click', () => {
        this.removeFile(file.name);
        container.removeChild(preview);
      });
      
      container.appendChild(preview);
    }.bind(this);
    
    reader.readAsDataURL(file);
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
  
  resetForm() {
    // Reset selected files
    this.selectedFiles = [];
    this.imageSelectedFiles.innerHTML = '';
    this.albumSelectedFiles.innerHTML = '';
    
    // Reset form inputs
    const inputs = this.uploadModal.querySelectorAll('input');
    inputs.forEach(input => {
      input.value = '';
    });
    
    // Reset select
    const selects = this.uploadModal.querySelectorAll('select');
    selects.forEach(select => {
      select.selectedIndex = 0;
    });
    
    // Reset to image tab
    this.switchTab('image');
  }
  
  validateForm() {
    if (this.uploadType === 'image') {
      const category = document.getElementById('image-category').value;
      const senderName = document.getElementById('image-sender-name').value;
      
      if (!category) {
        alert('Vui lòng chọn danh mục.');
        return false;
      }
      
      if (!senderName) {
        alert('Vui lòng nhập tên người gửi.');
        return false;
      }
      
      if (this.selectedFiles.length === 0) {
        alert('Vui lòng chọn ít nhất một ảnh.');
        return false;
      }
      
      return true;
    } else if (this.uploadType === 'album') {
      const senderName = document.getElementById('album-sender-name').value;
      const driveLink = document.getElementById('album-drive-link').value;
      
      if (!senderName) {
        alert('Vui lòng nhập tên người gửi.');
        return false;
      }
      
      if (!driveLink && this.selectedFiles.length === 0) {
        alert('Vui lòng nhập link album Google Drive hoặc tải lên ít nhất một ảnh.');
        return false;
      }
      
      return true;
    }
    
    return false;
  }
  
  async handleSubmit() {
    if (!this.validateForm()) {
      return;
    }
    
    // Show loading
    this.showLoading(true);
    
    try {
      if (this.uploadType === 'image') {
        await this.submitImageUpload();
      } else if (this.uploadType === 'album') {
        await this.submitAlbumUpload();
      }
      
      // Hide modal
      this.hideModal();
      
      // Show success message
      alert('Tải lên thành công! Ảnh của bạn sẽ được duyệt trước khi hiển thị.');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Có lỗi xảy ra khi tải lên. Vui lòng thử lại sau.');
    } finally {
      this.showLoading(false);
    }
  }
  
  async submitImageUpload() {
    const category = document.getElementById('image-category').value;
    const modelName = document.getElementById('image-model-name').value;
    const socialLink = document.getElementById('image-social-link').value;
    const senderName = document.getElementById('image-sender-name').value;
    
    // Prepare data for Google Sheet
    const data = {
      category: modelInfo.getCategoryName(category),
      modelName: modelName || 'Không có',
      socialLink: socialLink || 'Không có',
      senderName: senderName,
      timestamp: new Date().toISOString(),
      fileNames: this.selectedFiles.map(file => file.name).join(', '),
      fileCount: this.selectedFiles.length
    };
    
    // Send to Google Sheet
    await sheetsApi.sendToPendingSheet(data);
    
    // TODO: Upload files to Google Drive
    // This would require server-side implementation
    console.log('Files to upload:', this.selectedFiles);
  }
  
  async submitAlbumUpload() {
    const albumName = document.getElementById('album-name').value;
    const modelName = document.getElementById('album-model-name').value;
    const senderName = document.getElementById('album-sender-name').value;
    const driveLink = document.getElementById('album-drive-link').value;
    
    // Prepare data
    const data = {
      albumName: albumName || CONFIG.ui.defaultAlbumName,
      modelName: modelName || 'Không có',
      senderName: senderName,
      driveLink: driveLink || 'Không có',
      timestamp: new Date().toISOString(),
      fileCount: this.selectedFiles.length
    };
    
    // If drive link is provided, process it
    if (driveLink) {
      // TODO: Process Google Drive link
      console.log('Processing Drive link:', driveLink);
    }
    
    // If files are selected, upload them
    if (this.selectedFiles.length > 0) {
      // TODO: Upload files to Google Drive
      console.log('Files to upload:', this.selectedFiles);
    }
    
    // Display uploaded album
    this.displayUploadedAlbum(data);
  }
  
  displayUploadedAlbum(data) {
    // Create a temporary display of the uploaded album
    const albumContainer = document.createElement('div');
    albumContainer.className = 'uploaded-album-container';
    
    const albumTitle = document.createElement('h2');
    albumTitle.textContent = data.albumName;
    
    const modelInfo = document.createElement('p');
    modelInfo.textContent = `Người mẫu: ${data.modelName}`;
    
    const imageGrid = document.createElement('div');
    imageGrid.className = 'image-grid';
    
    // Add selected files to grid
    this.selectedFiles.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const card = document.createElement('div');
        card.className = 'image-card';
        
        card.innerHTML = `
          <div class="image-card-inner">
            <img src="${e.target.result}" alt="${file.name}">
            <div class="image-card-overlay">
              <div class="image-card-actions">
                <button class="heart-button" title="Thêm vào danh sách"><i class="fas fa-heart"></i></button>
                <button class="view-button" title="Xem ảnh"><i class="fas fa-eye"></i></button>
                <span class="view-count">0</span>
                <button class="like-button" title="Thích"><i class="fas fa-thumbs-up"></i></button>
                <span class="like-count">0</span>
              </div>
            </div>
          </div>
        `;
        
        imageGrid.appendChild(card);
      };
      
      reader.readAsDataURL(file);
    });
    
    // Append elements
    albumContainer.appendChild(albumTitle);
    albumContainer.appendChild(modelInfo);
    albumContainer.appendChild(imageGrid);
    
    // Replace main content with album display
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = '';
      mainContent.appendChild(albumContainer);
    }
  }
  
  showLoading(isShow) {
    const submitButton = this.uploadModal.querySelector('.upload-submit-button');
    
    if (isShow) {
      submitButton.textContent = 'Đang xử lý...';
      submitButton.disabled = true;
    } else {
      submitButton.textContent = 'Gửi';
      submitButton.disabled = false;
    }
  }
}

// Create and export upload handler instance
const uploadHandler = new UploadHandler();

// Show upload modal when upload button is clicked
document.addEventListener('DOMContentLoaded', function() {
  const uploadButton = document.getElementById('upload-button');
  if (uploadButton) {
    uploadButton.addEventListener('click', function() {
      uploadHandler.showModal();
    });
  }
});
