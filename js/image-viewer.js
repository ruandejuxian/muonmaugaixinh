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
  
  downloadImage(quality = 'original') {
    if (!this.currentImage) return;
    
    let downloadUrl = this.currentImage.url;
    
    // Modify URL based on quality if needed
    if (quality !== 'original' && downloadUrl.includes('fileId=')) {
      const fileId = new URL(downloadUrl).searchParams.get('fileId');
      
      switch (quality) {
        case 'high':
          downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          break;
        case 'medium':
          // For medium quality, we could use a different approach or just use high quality
          downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          break;
        case 'low':
          // For low quality, we could use the thumbnail
          downloadUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
          break;
      }
    }
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = this.currentImage.title || 'image';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        name: this.currentImage.title,
        note: '',
        addedAt: new Date().toISOString()
      });
      
      // Show success message
      this.showToast('Đã thêm vào danh sách yêu thích');
    } else {
      // Remove from favorites
      favorites.splice(index, 1);
      
      // Show message
      this.showToast('Đã xóa khỏi danh sách yêu thích');
    }
    
    // Save updated favorites
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Update heart button in grid if exists
    const imageCard = document.querySelector(`.image-card[data-id="${this.currentImage.id}"]`);
    if (imageCard) {
      const gridHeartButton = imageCard.querySelector('.heart-button');
      if (gridHeartButton) {
        if (index === -1) {
          gridHeartButton.classList.add('active');
        } else {
          gridHeartButton.classList.remove('active');
        }
      }
    }
  }
  
  shareImage() {
    if (!this.currentImage) return;
    
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator.share({
        title: this.currentImage.title,
        url: this.currentImage.url
      })
      .then(() => {
        this.showToast('Đã chia sẻ thành công');
      })
      .catch(error => {
        console.error('Error sharing:', error);
        this.showToast('Không thể chia sẻ. Vui lòng thử lại.');
      });
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(this.currentImage.url)
        .then(() => {
          this.showToast('Đã sao chép đường dẫn ảnh vào clipboard');
        })
        .catch(err => {
          console.error('Error copying text: ', err);
          this.showToast('Không thể sao chép. Vui lòng thử lại.');
        });
    }
  }
  
  saveNote(note) {
    if (!this.currentImage) return;
    
    // Get current favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // Find the favorite
    const index = favorites.findIndex(fav => fav.id === this.currentImage.id);
    
    if (index !== -1) {
      // Update note
      favorites[index].note = note;
      
      // Save updated favorites
      localStorage.setItem('favorites', JSON.stringify(favorites));
      
      // Show success message
      this.showToast('Đã lưu ghi chú');
    } else {
      // Not in favorites, add it first
      this.toggleFavorite();
      
      // Then save note
      this.saveNote(note);
    }
  }
  
  zoom(factor, clientX, clientY) {
    const img = this.viewer.querySelector('.image-viewer-img');
    const rect = img.getBoundingClientRect();
    
    // Calculate cursor position relative to image
    const x = clientX ? (clientX - rect.left) / rect.width : 0.5;
    const y = clientY ? (clientY - rect.top) / rect.height : 0.5;
    
    // Update zoom level
    this.zoomLevel *= factor;
    
    // Limit zoom level
    this.zoomLevel = Math.max(1, Math.min(5, this.zoomLevel));
    
    // Apply zoom
    if (this.zoomLevel > 1) {
      this.isZoomed = true;
      
      // Apply transform
      img.style.transform = `scale(${this.zoomLevel}) translate(${this.dragOffset.x}px, ${this.dragOffset.y}px)`;
      
      // Update drag offset to maintain cursor position
      if (factor !== 1) {
        const offsetX = (rect.width * (factor - 1)) * (x - 0.5);
        const offsetY = (rect.height * (factor - 1)) * (y - 0.5);
        
        this.dragOffset.x -= offsetX / this.zoomLevel;
        this.dragOffset.y -= offsetY / this.zoomLevel;
        
        img.style.transform = `scale(${this.zoomLevel}) translate(${this.dragOffset.x}px, ${this.dragOffset.y}px)`;
      }
    } else {
      this.resetZoom();
    }
  }
  
  resetZoom() {
    const img = this.viewer.querySelector('.image-viewer-img');
    
    this.zoomLevel = 1;
    this.isZoomed = false;
    this.dragOffset = { x: 0, y: 0 };
    
    img.style.transform = '';
  }
  
  startDrag(x, y) {
    this.isDragging = true;
    this.dragStart = { x, y };
  }
  
  drag(x, y) {
    if (!this.isDragging) return;
    
    const deltaX = (x - this.dragStart.x) / this.zoomLevel;
    const deltaY = (y - this.dragStart.y) / this.zoomLevel;
    
    this.dragOffset.x += deltaX;
    this.dragOffset.y += deltaY;
    
    const img = this.viewer.querySelector('.image-viewer-img');
    img.style.transform = `scale(${this.zoomLevel}) translate(${this.dragOffset.x}px, ${this.dragOffset.y}px)`;
    
    this.dragStart = { x, y };
  }
  
  endDrag() {
    this.isDragging = false;
  }
  
  incrementViewCount(imageId) {
    // Get current views from localStorage
    const views = JSON.parse(localStorage.getItem('views') || '{}');
    
    // Increment view count
    views[imageId] = (views[imageId] || 0) + 1;
    
    // Save updated views
    localStorage.setItem('views', JSON.stringify(views));
    
    // Update UI if image card exists
    const imageCard = document.querySelector(`.image-card[data-id="${imageId}"]`);
    if (imageCard) {
      const viewCount = imageCard.querySelector('.view-count');
      if (viewCount) {
        viewCount.textContent = views[imageId];
      }
    }
  }
  
  showToast(message) {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    
    // Set message and show
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Create and export image viewer instance
const imageViewer = new ImageViewer();

// Function to open image viewer from outside
function openImageViewer(imageId, imageUrl, title, modelInfo = null) {
  // Get all current images
  const imageCards = document.querySelectorAll('.image-card');
  const images = Array.from(imageCards).map(card => ({
    id: card.getAttribute('data-id'),
    url: card.querySelector('img').src,
    title: card.querySelector('img').alt,
    modelInfo: window.modelInfo ? modelInfo.getModel(card.getAttribute('data-id')) : null
  }));
  
  // Find index of current image
  const index = images.findIndex(img => img.id === imageId);
  
  // Set images and current index
  imageViewer.setImages(images);
  imageViewer.setCurrentIndex(index);
  
  // Open viewer
  imageViewer.open(imageId, imageUrl, title, modelInfo);
}
