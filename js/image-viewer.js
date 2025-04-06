// Image viewer functionality
class ImageViewer {
  constructor() {
    this.viewer = null;
    this.currentImage = null;
    this.currentIndex = 0;
    this.images = [];
    this.isZoomed = false;
    this.zoomLevel = 1;
    this.dragStart = { x: 0, y: 0 };
    this.dragOffset = { x: 0, y: 0 };
    this.isDragging = false;
    
    this.init();
  }
  
  init() {
    // Create image viewer if it doesn't exist
    this.createViewer();
    
    // Add event listeners
    this.addEventListeners();
  }
  
  createViewer() {
    this.viewer = document.createElement('div');
    this.viewer.className = 'image-viewer';
    this.viewer.id = 'image-viewer';
    
    this.viewer.innerHTML = `
      <div class="image-viewer-header">
        <h3 class="image-viewer-title"></h3>
        <button class="image-viewer-close">&times;</button>
      </div>
      <div class="image-viewer-content">
        <img class="image-viewer-img" src="" alt="">
        <div class="image-viewer-nav">
          <button class="image-viewer-prev"><i class="fas fa-chevron-left"></i></button>
          <button class="image-viewer-next"><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
      <div class="image-viewer-footer">
        <div class="image-viewer-info">
          <span class="image-viewer-model"></span>
          <div class="image-viewer-note-container">
            <input type="text" class="image-viewer-note-input" placeholder="Thêm ghi chú...">
            <button class="image-viewer-note-save">Lưu</button>
          </div>
        </div>
        <div class="image-viewer-actions">
          <div class="image-viewer-download-options">
            <button class="image-viewer-download"><i class="fas fa-download"></i> Tải xuống</button>
            <div class="download-options-dropdown">
              <button class="download-option" data-quality="original">Kích thước gốc</button>
              <button class="download-option" data-quality="high">Chất lượng cao</button>
              <button class="download-option" data-quality="medium">Chất lượng trung bình</button>
              <button class="download-option" data-quality="low">Chất lượng thấp</button>
            </div>
          </div>
          <button class="image-viewer-heart"><i class="fas fa-heart"></i> Thêm vào danh sách</button>
          <button class="image-viewer-share"><i class="fas fa-share-alt"></i> Chia sẻ</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.viewer);
  }
  
  addEventListeners() {
    // Close button
    const closeButton = this.viewer.querySelector('.image-viewer-close');
    closeButton.addEventListener('click', () => this.close());
    
    // Navigation buttons
    const prevButton = this.viewer.querySelector('.image-viewer-prev');
    const nextButton = this.viewer.querySelector('.image-viewer-next');
    
    prevButton.addEventListener('click', () => this.showPrevious());
    nextButton.addEventListener('click', () => this.showNext());
    
    // Download button and options
    const downloadButton = this.viewer.querySelector('.image-viewer-download');
    const downloadOptions = this.viewer.querySelectorAll('.download-option');
    
    downloadButton.addEventListener('click', () => {
      const dropdown = this.viewer.querySelector('.download-options-dropdown');
      dropdown.classList.toggle('show');
    });
    
    downloadOptions.forEach(option => {
      option.addEventListener('click', () => {
        const quality = option.getAttribute('data-quality');
        this.downloadImage(quality);
        this.viewer.querySelector('.download-options-dropdown').classList.remove('show');
      });
    });
    
    // Heart button
    const heartButton = this.viewer.querySelector('.image-viewer-heart');
    heartButton.addEventListener('click', () => this.toggleFavorite());
    
    // Share button
    const shareButton = this.viewer.querySelector('.image-viewer-share');
    shareButton.addEventListener('click', () => this.shareImage());
    
    // Note input and save button
    const noteInput = this.viewer.querySelector('.image-viewer-note-input');
    const noteSaveButton = this.viewer.querySelector('.image-viewer-note-save');
    
    noteSaveButton.addEventListener('click', () => {
      this.saveNote(noteInput.value);
    });
    
    noteInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveNote(noteInput.value);
      }
    });
    
    // Image zoom and pan
    const image = this.viewer.querySelector('.image-viewer-img');
    
    image.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom(e.deltaY < 0 ? 1.1 : 0.9, e.clientX, e.clientY);
    });
    
    image.addEventListener('mousedown', (e) => {
      if (this.isZoomed) {
        this.startDrag(e.clientX, e.clientY);
      }
    });
    
    image.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.isZoomed) {
        this.drag(e.clientX, e.clientY);
      }
    });
    
    image.addEventListener('mouseup', () => {
      this.endDrag();
    });
    
    image.addEventListener('mouseleave', () => {
      this.endDrag();
    });
    
    image.addEventListener('dblclick', (e) => {
      if (this.isZoomed) {
        this.resetZoom();
      } else {
        this.zoom(2, e.clientX, e.clientY);
      }
    });
    
    // Touch events for mobile
    image.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    });
    
    image.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        this.drag(e.touches[0].clientX, e.touches[0].clientY);
      }
    });
    
    image.addEventListener('touchend', () => {
      this.endDrag();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.viewer.classList.contains('show')) return;
      
      switch (e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          this.showPrevious();
          break;
        case 'ArrowRight':
          this.showNext();
          break;
        case '+':
        case '=':
          this.zoom(1.1);
          break;
        case '-':
          this.zoom(0.9);
          break;
        case '0':
          this.resetZoom();
          break;
      }
    });
    
    // Close when clicking outside the image
    this.viewer.addEventListener('click', (e) => {
      if (e.target === this.viewer) {
        this.close();
      }
    });
  }
  
  open(imageId, imageUrl, title, modelInfo = null) {
    // Set current image
    this.currentImage = {
      id: imageId,
      url: imageUrl,
      title: title,
      modelInfo: modelInfo
    };
    
    // Update viewer content
    const img = this.viewer.querySelector('.image-viewer-img');
    const titleElement = this.viewer.querySelector('.image-viewer-title');
    const modelElement = this.viewer.querySelector('.image-viewer-model');
    const noteInput = this.viewer.querySelector('.image-viewer-note-input');
    
    img.src = imageUrl;
    img.alt = title;
    titleElement.textContent = title;
    
    if (modelInfo && modelInfo.name) {
      modelElement.textContent = `Người mẫu: ${modelInfo.name}`;
      modelElement.style.display = 'block';
    } else {
      modelElement.style.display = 'none';
    }
    
    // Check if image is in favorites and update heart button
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFavorite = favorites.some(fav => fav.id === imageId);
    const heartButton = this.viewer.querySelector('.image-viewer-heart');
    
    if (isFavorite) {
      heartButton.classList.add('active');
      
      // Get note if exists
      const favorite = favorites.find(fav => fav.id === imageId);
      if (favorite && favorite.note) {
        noteInput.value = favorite.note;
      } else {
        noteInput.value = '';
      }
    } else {
      heartButton.classList.remove('active');
      noteInput.value = '';
    }
    
    // Reset zoom
    this.resetZoom();
    
    // Show viewer
    this.viewer.classList.add('show');
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    
    // Increment view count
    this.incrementViewCount(imageId);
    
    // Show form for image details
    this.showImageForm(imageId, title, modelInfo);
  }
  
  showImageForm(imageId, title, modelInfo) {
    // Check if form already exists
    let form = document.getElementById('image-detail-form');
    if (!form) {
      // Create form
      form = document.createElement('div');
      form.id = 'image-detail-form';
      form.className = 'image-detail-form';
      
      form.innerHTML = `
        <div class="form-header">
          <h3>Chi tiết ảnh</h3>
          <button class="form-close">&times;</button>
        </div>
        <div class="form-content">
          <div class="form-group">
            <label for="model-name">Tên người mẫu (nếu có)</label>
            <input type="text" id="model-name" placeholder="Nhập tên người mẫu">
          </div>
          <div class="form-group">
            <label for="sender-name">Tên người gửi</label>
            <input type="text" id="sender-name" placeholder="Nhập tên của bạn">
          </div>
          <div class="form-group">
            <label for="image-note">Ghi chú</label>
            <textarea id="image-note" placeholder="Nhập ghi chú cho ảnh này"></textarea>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary save-button">Lưu</button>
            <button class="btn btn-outline cancel-button">Hủy</button>
          </div>
        </div>
      `;
      
      // Add to document
      document.body.appendChild(form);
      
      // Add event listeners
      const closeButton = form.querySelector('.form-close');
      const cancelButton = form.querySelector('.cancel-button');
      const saveButton = form.querySelector('.save-button');
      
      closeButton.addEventListener('click', () => {
        form.classList.remove('show');
      });
      
      cancelButton.addEventListener('click', () => {
        form.classList.remove('show');
      });
      
      saveButton.addEventListener('click', () => {
        const modelName = document.getElementById('model-name').value;
        const senderName = document.getElementById('sender-name').value;
        const note = document.getElementById('image-note').value;
        
        // Save to favorites with note
        this.saveImageDetails(imageId, title, modelName, senderName, note);
        
        // Hide form
        form.classList.remove('show');
      });
    }
    
    // Fill form with existing data if available
    const modelNameInput = document.getElementById('model-name');
    const noteInput = document.getElementById('image-note');
    
    if (modelInfo && modelInfo.name) {
      modelNameInput.value = modelInfo.name;
    } else {
      modelNameInput.value = '';
    }
    
    // Check if image is in favorites
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favorite = favorites.find(fav => fav.id === imageId);
    
    if (favorite && favorite.note) {
      noteInput.value = favorite.note;
    } else {
      noteInput.value = '';
    }
    
    // Show form
    form.classList.add('show');
  }
  
  saveImageDetails(imageId, title, modelName, senderName, note) {
    // Get current favorites
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // Check if already in favorites
    const index = favorites.findIndex(fav => fav.id === imageId);
    
    if (index !== -1) {
      // Update existing
      favorites[index].modelName = modelName;
      favorites[index].senderName = senderName;
      favorites[index].note = note;
    } else {
      // Add new
      favorites.push({
        id: imageId,
        title: title,
        modelName: modelName,
        senderName: senderName,
        note: note,
        addedAt: new Date().toISOString()
      });
    }
    
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Show success message
    this.showToast('Đã lưu thông tin ảnh');
  }
  
  close() {
    // Hide viewer
    this.viewer.classList.remove('show');
    
    // Enable body scroll
    document.body.style.overflow = '';
    
    // Reset current image
    this.currentImage = null;
  }
  
  setImages(images) {
    this.images = images;
  }
  
  setCurrentIndex(index) {
    this.currentIndex = index;
  }
  
  showPrevious() {
    if (this.images.length === 0) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    const image = this.images[this.currentIndex];
    
    this.open(image.id, image.url, image.title, image.modelInfo);
  }
  
  showNext() {
    if (this.images.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    const image = this.images[this.currentIndex];
    
    this.open(image.id, image.url, image.title, image.modelInfo);
  }
  
  toggleFavorite() {
    if (!this.currentImage) return;
    
    const heartButton = this.viewer.querySelector('.image-viewer-heart');
    heartButton.classList.toggle('active');
    
    // Get current favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // Check if already favorited
    const index = favorites.findIndex(fav => fav.id === this.currentImage.id);
    
    if (index === -1) {
      // Add to favorites
      favorites.push({
        id: this.currentImage.id,
        url: this.currentImage.url,
        title: this.currentImage.title,
        note: this.viewer.querySelector('.image-viewer-note-input').value,
        addedAt: new Date().toISOString()
      });
      
      // Show success message
      this.showToast('Đã thêm vào danh sách yêu thích');
    } else {
      // Remove from favorites
      favorites.splice(index, 1);
      
      // Show success message
      this.showToast('Đã xóa khỏi danh sách yêu thích');
    }
    
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Update UI
    this.updateFavoriteUI();
  }
  
  updateFavoriteUI() {
    // Update heart buttons in image grid
    const imageCards = document.querySelectorAll('.image-card');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    imageCards.forEach(card => {
      const id = card.getAttribute('data-id');
      const heartButton = card.querySelector('.heart-button');
      
      if (heartButton) {
        const isFavorite = favorites.some(fav => fav.id === id);
        heartButton.classList.toggle('active', isFavorite);
      }
    });
  }
  
  saveNote(note) {
    if (!this.currentImage) return;
    
    // Get current favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // Check if already favorited
    const index = favorites.findIndex(fav => fav.id === this.currentImage.id);
    
    if (index !== -1) {
      // Update note
      favorites[index].note = note;
      
      // Save to localStorage
      localStorage.setItem('favorites', JSON.stringify(favorites));
      
      // Show success message
      this.showToast('Đã lưu ghi chú');
    } else {
      // Add to favorites with note
      this.toggleFavorite();
    }
  }
  
  downloadImage(quality = 'original') {
    if (!this.currentImage) return;
    
    // Get image URL based on quality
    let imageUrl = this.currentImage.url;
    
    // For Google Drive images, modify URL to get desired quality
    if (imageUrl.includes('drive.google.com') || imageUrl.includes(CONFIG.cloudflare.proxyUrl)) {
      switch (quality) {
        case 'high':
          imageUrl = `${CONFIG.cloudflare.proxyUrl}?fileId=${this.currentImage.id}&size=1920`;
          break;
        case 'medium':
          imageUrl = `${CONFIG.cloudflare.proxyUrl}?fileId=${this.currentImage.id}&size=1280`;
          break;
        case 'low':
          imageUrl = `${CONFIG.cloudflare.proxyUrl}?fileId=${this.currentImage.id}&size=800`;
          break;
        default:
          imageUrl = `${CONFIG.cloudflare.proxyUrl}?fileId=${this.currentImage.id}&original=true`;
      }
    }
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = this.currentImage.title || 'image';
    link.target = '_blank';
    link.click();
    
    // Show success message
    this.showToast('Đang tải ảnh xuống...');
  }
  
  shareImage() {
    if (!this.currentImage) return;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: this.currentImage.title,
        text: 'Xem ảnh này trên VNGirls',
        url: window.location.href
      })
      .then(() => console.log('Shared successfully'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback to copying URL to clipboard
      const url = window.location.href;
      
      navigator.clipboard.writeText(url)
        .then(() => {
          this.showToast('Đã sao chép đường dẫn vào clipboard');
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
          this.showToast('Không thể sao chép đường dẫn', 'error');
        });
    }
  }
  
  incrementViewCount(imageId) {
    // Get view counts from localStorage
    const viewCounts = JSON.parse(localStorage.getItem('viewCounts') || '{}');
    
    // Increment count
    viewCounts[imageId] = (viewCounts[imageId] || 0) + 1;
    
    // Save to localStorage
    localStorage.setItem('viewCounts', JSON.stringify(viewCounts));
    
    // Update UI
    const viewCountElements = document.querySelectorAll(`.image-card[data-id="${imageId}"] .view-count`);
    viewCountElements.forEach(element => {
      element.textContent = viewCounts[imageId];
    });
  }
  
  zoom(factor, x, y) {
    const image = this.viewer.querySelector('.image-viewer-img');
    const rect = image.getBoundingClientRect();
    
    // Calculate cursor position relative to image
    const cursorX = x ? (x - rect.left) / rect.width : 0.5;
    const cursorY = y ? (y - rect.top) / rect.height : 0.5;
    
    // Update zoom level
    this.zoomLevel *= factor;
    
    // Limit zoom level
    this.zoomLevel = Math.max(1, Math.min(5, this.zoomLevel));
    
    // Apply zoom
    image.style.transform = `scale(${this.zoomLevel})`;
    
    // Set zoom flag
    this.isZoomed = this.zoomLevel > 1;
    
    // Reset drag offset
    this.dragOffset = { x: 0, y: 0 };
    
    // Apply transform origin based on cursor position
    image.style.transformOrigin = `${cursorX * 100}% ${cursorY * 100}%`;
  }
  
  resetZoom() {
    const image = this.viewer.querySelector('.image-viewer-img');
    
    // Reset zoom level
    this.zoomLevel = 1;
    
    // Reset transform
    image.style.transform = '';
    image.style.transformOrigin = '';
    
    // Reset zoom flag
    this.isZoomed = false;
    
    // Reset drag offset
    this.dragOffset = { x: 0, y: 0 };
  }
  
  startDrag(x, y) {
    this.isDragging = true;
    this.dragStart = { x, y };
  }
  
  drag(x, y) {
    if (!this.isDragging) return;
    
    const image = this.viewer.querySelector('.image-viewer-img');
    
    // Calculate drag distance
    const deltaX = x - this.dragStart.x;
    const deltaY = y - this.dragStart.y;
    
    // Update drag offset
    this.dragOffset.x += deltaX;
    this.dragOffset.y += deltaY;
    
    // Apply transform
    image.style.transform = `scale(${this.zoomLevel}) translate(${this.dragOffset.x}px, ${this.dragOffset.y}px)`;
    
    // Update drag start position
    this.dragStart = { x, y };
  }
  
  endDrag() {
    this.isDragging = false;
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

// Initialize image viewer
let imageViewer;

function initializeImageViewer() {
  imageViewer = new ImageViewer();
  window.imageViewer = imageViewer;
}

// Open image viewer
function openImageViewer(imageId, imageUrl, title, modelInfo) {
  if (!imageViewer) {
    initializeImageViewer();
  }
  
  imageViewer.open(imageId, imageUrl, title, modelInfo);
}

// Export functions
window.initializeImageViewer = initializeImageViewer;
window.openImageViewer = openImageViewer;
