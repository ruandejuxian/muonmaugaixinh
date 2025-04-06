// Album upload functionality
class AlbumUploadHandler {
  constructor() {
    this.uploadHandler = window.uploadHandler; // Reference to main upload handler
    this.maxAlbumImagesUpload = CONFIG.ui.maxUploadAlbumImages;
    this.defaultAlbumName = CONFIG.ui.defaultAlbumName;
    
    this.init();
  }
  
  init() {
    // Add event listeners for album-specific functionality
    this.addEventListeners();
  }
  
  addEventListeners() {
    // Album drive link input
    const albumDriveLink = document.getElementById('album-drive-link');
    if (albumDriveLink) {
      albumDriveLink.addEventListener('input', this.validateDriveLink.bind(this));
    }
    
    // Album tab button
    const albumTabButton = document.querySelector('.upload-tab-button[data-tab="album"]');
    if (albumTabButton) {
      albumTabButton.addEventListener('click', () => {
        this.resetAlbumForm();
      });
    }
  }
  
  validateDriveLink(e) {
    const link = e.target.value.trim();
    
    // Simple validation for Google Drive link
    if (link && !link.includes('drive.google.com')) {
      e.target.setCustomValidity('Vui lòng nhập đường dẫn Google Drive hợp lệ');
    } else {
      e.target.setCustomValidity('');
    }
  }
  
  resetAlbumForm() {
    // Reset album form fields
    const albumName = document.getElementById('album-name');
    const albumModelName = document.getElementById('album-model-name');
    const albumSenderName = document.getElementById('album-sender-name');
    const albumDriveLink = document.getElementById('album-drive-link');
    
    if (albumName) albumName.value = '';
    if (albumModelName) albumModelName.value = '';
    if (albumSenderName) albumSenderName.value = '';
    if (albumDriveLink) albumDriveLink.value = '';
    
    // Clear selected files
    const albumSelectedFiles = document.getElementById('album-selected-files');
    if (albumSelectedFiles) {
      albumSelectedFiles.innerHTML = '';
    }
  }
  
  async processAlbumUpload(data, files) {
    try {
      // Show loading
      this.showLoading(true);
      
      // Process Google Drive link if provided
      if (data.driveLink && data.driveLink !== 'Không có') {
        await this.processGoogleDriveAlbum(data);
      }
      
      // Process uploaded files if any
      if (files && files.length > 0) {
        await this.processUploadedFiles(data, files);
      }
      
      // Send data to Google Sheet
      await this.sendToSheet(data);
      
      // Display success message
      this.showToast('Album đã được tải lên thành công!');
      
      // Display album in UI
      this.displayAlbum(data, files);
      
      return true;
    } catch (error) {
      console.error('Error processing album upload:', error);
      this.showToast('Có lỗi xảy ra khi tải album. Vui lòng thử lại sau.', 'error');
      return false;
    } finally {
      this.showLoading(false);
    }
  }
  
  async processGoogleDriveAlbum(data) {
    // Extract folder ID from Google Drive link
    const folderId = this.extractFolderId(data.driveLink);
    
    if (!folderId) {
      throw new Error('Không thể xác định ID thư mục từ đường dẫn Google Drive');
    }
    
    // Get files from the folder
    try {
      // This would typically use the Drive API
      // For now, we'll just log the folder ID
      console.log('Processing Google Drive folder:', folderId);
      
      // Update data with folder ID
      data.folderId = folderId;
      
      return true;
    } catch (error) {
      console.error('Error processing Google Drive folder:', error);
      throw error;
    }
  }
  
  extractFolderId(driveLink) {
    // Extract folder ID from Google Drive link
    // Example: https://drive.google.com/drive/folders/1HJjnENuLswyPnkbC-cpFjW6Bv3iBd4a5
    
    try {
      const url = new URL(driveLink);
      
      // Check if it's a folders link
      if (url.pathname.includes('/folders/')) {
        const pathParts = url.pathname.split('/');
        const folderIdIndex = pathParts.indexOf('folders') + 1;
        
        if (folderIdIndex < pathParts.length) {
          return pathParts[folderIdIndex];
        }
      }
      
      // Check if it's a file link with id parameter
      const fileId = url.searchParams.get('id');
      if (fileId) {
        return fileId;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting folder ID:', error);
      return null;
    }
  }
  
  async processUploadedFiles(data, files) {
    // Process uploaded files
    // This would typically upload files to Google Drive
    // For now, we'll just log the files
    console.log('Processing uploaded files:', files.length);
    
    // Update data with file count
    data.fileCount = files.length;
    
    return true;
  }
  
  async sendToSheet(data) {
    // Send album data to Google Sheet
    try {
      // Prepare data for Google Sheet
      const sheetData = {
        albumName: data.albumName,
        modelName: data.modelName,
        senderName: data.senderName,
        driveLink: data.driveLink,
        folderId: data.folderId || '',
        fileCount: data.fileCount,
        timestamp: new Date().toISOString(),
        status: 'Chưa duyệt'
      };
      
      // Send to Google Sheet
      await sheetsApi.sendToPendingSheet(sheetData);
      
      return true;
    } catch (error) {
      console.error('Error sending album data to Google Sheet:', error);
      throw error;
    }
  }
  
  displayAlbum(data, files) {
    // Create a container for the album display
    const albumContainer = document.createElement('div');
    albumContainer.className = 'album-container';
    
    // Create album header
    const albumHeader = document.createElement('div');
    albumHeader.className = 'album-header';
    
    const albumTitle = document.createElement('h2');
    albumTitle.textContent = data.albumName || this.defaultAlbumName;
    
    const albumInfo = document.createElement('div');
    albumInfo.className = 'album-info';
    
    const modelName = document.createElement('p');
    modelName.className = 'model-name';
    modelName.textContent = `Người mẫu: ${data.modelName || 'Không có thông tin'}`;
    
    const senderName = document.createElement('p');
    senderName.className = 'sender-name';
    senderName.textContent = `Người gửi: ${data.senderName}`;
    
    albumInfo.appendChild(modelName);
    albumInfo.appendChild(senderName);
    
    albumHeader.appendChild(albumTitle);
    albumHeader.appendChild(albumInfo);
    
    // Create image grid
    const imageGrid = document.createElement('div');
    imageGrid.className = 'image-grid';
    
    // Add files to grid if available
    if (files && files.length > 0) {
      files.forEach(file => {
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
    } else {
      // If no files, show a message
      const noImages = document.createElement('p');
      noImages.className = 'no-images';
      noImages.textContent = 'Ảnh sẽ được hiển thị sau khi được duyệt.';
      imageGrid.appendChild(noImages);
    }
    
    // Assemble album container
    albumContainer.appendChild(albumHeader);
    albumContainer.appendChild(imageGrid);
    
    // Replace main content with album display
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = '';
      mainContent.appendChild(albumContainer);
    }
    
    // Update category title and description
    const categoryTitle = document.getElementById('category-title');
    const categoryDescription = document.getElementById('category-description');
    
    if (categoryTitle) {
      categoryTitle.textContent = data.albumName || this.defaultAlbumName;
    }
    
    if (categoryDescription) {
      categoryDescription.textContent = `Album của ${data.modelName || 'người mẫu'} được gửi bởi ${data.senderName}`;
    }
    
    // Disable sidebar navigation
    this.disableSidebarNavigation();
  }
  
  disableSidebarNavigation() {
    // Temporarily disable sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    
    sidebarLinks.forEach(link => {
      const originalClick = link.onclick;
      
      link.onclick = function(e) {
        e.preventDefault();
        
        // Show confirmation dialog
        if (confirm('Bạn có muốn rời khỏi album hiện tại không?')) {
          // Restore original click handler
          link.onclick = originalClick;
          
          // Trigger the click
          link.click();
        }
      };
    });
  }
  
  showLoading(isShow) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.classList.toggle('show', isShow);
    }
  }
  
  showToast(message, type = 'success') {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    
    // Add type class
    toast.className = `toast ${type}`;
    
    // Set message and show
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Create album upload handler instance
const albumUploadHandler = new AlbumUploadHandler();

// Extend the main upload handler to handle album uploads
document.addEventListener('DOMContentLoaded', function() {
  // Override the submitAlbumUpload method in the main upload handler
  if (window.uploadHandler) {
    const originalSubmitAlbumUpload = uploadHandler.submitAlbumUpload;
    
    uploadHandler.submitAlbumUpload = async function() {
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
      
      // Process album upload
      const success = await albumUploadHandler.processAlbumUpload(data, this.selectedFiles);
      
      if (success) {
        // Hide modal
        this.hideModal();
      }
    };
  }
});
