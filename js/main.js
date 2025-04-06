// Main JavaScript file for the application
document.addEventListener('DOMContentLoaded', function() {
  // Initialize components
  initializeApp();
  
  // Load images for the current category
  loadImages('all');
  
  // Add event listeners
  addEventListeners();
});

// Initialize the application
function initializeApp() {
  // Show loading indicator
  showLoading(true);
  
  // Initialize image viewer
  initializeImageViewer();
  
  // Initialize dark mode if enabled
  if (CONFIG.features.enableDarkMode) {
    initializeDarkMode();
  }
  
  // Initialize back to top button
  initializeBackToTop();
}

// Add event listeners
function addEventListeners() {
  // Category navigation
  const categoryLinks = document.querySelectorAll('.sidebar-nav a');
  categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const category = this.getAttribute('data-category');
      
      // Update active class
      categoryLinks.forEach(l => l.parentElement.classList.remove('active'));
      this.parentElement.classList.add('active');
      
      // Update category title and description
      updateCategoryInfo(category);
      
      // Load images for the selected category
      loadImages(category);
    });
  });
  
  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      const category = document.querySelector('.sidebar-nav li.active a').getAttribute('data-category');
      loadImages(category, this.value);
    });
  }
  
  // Load more button
  const loadMoreButton = document.getElementById('load-more-button');
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', function() {
      const category = document.querySelector('.sidebar-nav li.active a').getAttribute('data-category');
      const sort = document.getElementById('sort-select').value;
      loadMoreImages(category, sort);
    });
  }
  
  // Copy button
  const copyButton = document.getElementById('copy-button');
  if (copyButton) {
    copyButton.addEventListener('click', copySelectedImages);
  }
  
  // Sheet button
  const sheetButton = document.getElementById('sheet-button');
  if (sheetButton) {
    sheetButton.addEventListener('click', sendToSheet);
  }
  
  // Search functionality
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  
  if (searchInput && searchButton) {
    searchButton.addEventListener('click', function() {
      searchImages(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchImages(this.value);
      }
    });
  }
}

// Update category title and description
function updateCategoryInfo(category) {
  const categoryTitle = document.getElementById('category-title');
  const categoryDescription = document.getElementById('category-description');
  
  if (categoryTitle && categoryDescription) {
    switch(category) {
      case 'all':
        categoryTitle.textContent = 'Tất cả ảnh';
        categoryDescription.textContent = 'Bộ sưu tập tất cả các ảnh';
        break;
      case 'viet-nam':
        categoryTitle.textContent = 'Gái Việt';
        categoryDescription.textContent = 'Bộ sưu tập ảnh người mẫu Việt Nam';
        break;
      case 'au-my':
        categoryTitle.textContent = 'Gái Âu Mỹ';
        categoryDescription.textContent = 'Bộ sưu tập ảnh người mẫu Âu Mỹ';
        break;
      case 'chau-a':
        categoryTitle.textContent = 'Gái Châu Á';
        categoryDescription.textContent = 'Bộ sưu tập ảnh người mẫu Châu Á';
        break;
      case 'khac':
        categoryTitle.textContent = 'Nơi Khác';
        categoryDescription.textContent = 'Bộ sưu tập ảnh khác';
        break;
      default:
        // For custom albums
        categoryTitle.textContent = category;
        categoryDescription.textContent = 'Album tùy chỉnh';
    }
  }
}

// Load images for the selected category
function loadImages(category, sort = 'newest') {
  // Show loading indicator
  showLoading(true);
  
  // Clear current images
  const imageGrid = document.getElementById('image-grid');
  if (imageGrid) {
    imageGrid.innerHTML = '';
  }
  
  // Get folder ID based on category
  let folderId;
  switch(category) {
    case 'all':
      folderId = CONFIG.driveApi.folderIds.root;
      break;
    case 'viet-nam':
      folderId = CONFIG.driveApi.folderIds.vietnam;
      break;
    case 'au-my':
      folderId = CONFIG.driveApi.folderIds.western;
      break;
    case 'chau-a':
      folderId = CONFIG.driveApi.folderIds.asian;
      break;
    case 'khac':
      folderId = CONFIG.driveApi.folderIds.other;
      break;
    default:
      folderId = CONFIG.driveApi.folderIds.root;
  }
  
  // Fetch images from Google Drive
  driveApi.getFiles(folderId, CONFIG.ui.imagesPerPage, 0, sort)
    .then(files => {
      // Hide loading indicator
      showLoading(false);
      
      // Display images
      displayImages(files);
      
      // Show/hide load more button based on if there are more images
      toggleLoadMoreButton(files.length >= CONFIG.ui.imagesPerPage);
    })
    .catch(error => {
      console.error('Error loading images:', error);
      showError('Không thể tải ảnh. Vui lòng thử lại sau.');
      showLoading(false);
    });
}

// Load more images
function loadMoreImages(category, sort = 'newest') {
  // Show loading indicator
  showLoading(true);
  
  // Get current image count
  const imageGrid = document.getElementById('image-grid');
  const currentCount = imageGrid ? imageGrid.children.length : 0;
  
  // Get folder ID based on category
  let folderId;
  switch(category) {
    case 'all':
      folderId = CONFIG.driveApi.folderIds.root;
      break;
    case 'viet-nam':
      folderId = CONFIG.driveApi.folderIds.vietnam;
      break;
    case 'au-my':
      folderId = CONFIG.driveApi.folderIds.western;
      break;
    case 'chau-a':
      folderId = CONFIG.driveApi.folderIds.asian;
      break;
    case 'khac':
      folderId = CONFIG.driveApi.folderIds.other;
      break;
    default:
      folderId = CONFIG.driveApi.folderIds.root;
  }
  
  // Fetch more images from Google Drive
  driveApi.getFiles(folderId, CONFIG.ui.imagesPerPage, currentCount, sort)
    .then(files => {
      // Hide loading indicator
      showLoading(false);
      
      // Display additional images
      displayImages(files, true);
      
      // Show/hide load more button based on if there are more images
      toggleLoadMoreButton(files.length >= CONFIG.ui.imagesPerPage);
    })
    .catch(error => {
      console.error('Error loading more images:', error);
      showError('Không thể tải thêm ảnh. Vui lòng thử lại sau.');
      showLoading(false);
    });
}

// Display images in the grid
function displayImages(files, append = false) {
  const imageGrid = document.getElementById('image-grid');
  if (!imageGrid) return;
  
  // Clear grid if not appending
  if (!append) {
    imageGrid.innerHTML = '';
  }
  
  // Create image cards
  files.forEach(file => {
    const imageCard = createImageCard(file);
    imageGrid.appendChild(imageCard);
  });
  
  // If no images found
  if (files.length === 0 && !append) {
    const noImages = document.createElement('div');
    noImages.className = 'no-images';
    noImages.innerHTML = '<p>Không tìm thấy ảnh nào.</p>';
    imageGrid.appendChild(noImages);
    
    // Hide load more button
    toggleLoadMoreButton(false);
  }
}

// Create an image card element
function createImageCard(file) {
  const card = document.createElement('div');
  card.className = 'image-card';
  card.setAttribute('data-id', file.id);
  
  // Get model info if available
  const modelInfo = window.modelInfo ? modelInfo.getModel(file.id) : null;
  
  // Create image URL with proxy to avoid CORS issues
  const imageUrl = `${CONFIG.cloudflare.proxyUrl}?fileId=${file.id}`;
  
  card.innerHTML = `
    <div class="image-card-inner">
      <img src="${imageUrl}" alt="${file.name}" loading="lazy">
      <div class="image-card-overlay">
        <div class="image-card-actions">
          <button class="heart-button" title="Thêm vào danh sách"><i class="fas fa-heart"></i></button>
          <button class="view-button" title="Xem ảnh"><i class="fas fa-eye"></i></button>
          <span class="view-count">${file.viewCount || 0}</span>
          <button class="like-button" title="Thích"><i class="fas fa-thumbs-up"></i></button>
          <span class="like-count">${file.likeCount || 0}</span>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners
  const heartButton = card.querySelector('.heart-button');
  const viewButton = card.querySelector('.view-button');
  const likeButton = card.querySelector('.like-button');
  
  if (heartButton) {
    heartButton.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleFavorite(file.id, this);
    });
  }
  
  if (viewButton) {
    viewButton.addEventListener('click', function(e) {
      e.stopPropagation();
      openImageViewer(file.id, imageUrl, file.name, modelInfo);
    });
  }
  
  if (likeButton) {
    likeButton.addEventListener('click', function(e) {
      e.stopPropagation();
      likeImage(file.id, this);
    });
  }
  
  // Make the whole card clickable to open image viewer
  card.addEventListener('click', function() {
    openImageViewer(file.id, imageUrl, file.name, modelInfo);
  });
  
  return card;
}

// Toggle favorite status
function toggleFavorite(imageId, button) {
  button.classList.toggle('active');
  
  // Get current favorites from localStorage
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  // Check if already favorited
  const index = favorites.findIndex(fav => fav.id === imageId);
  
  if (index === -1) {
    // Add to favorites
    const imageCard = button.closest('.image-card');
    const imageUrl = imageCard.querySelector('img').src;
    const imageName = imageCard.querySelector('img').alt;
    
    favorites.push({
      id: imageId,
      url: imageUrl,
      name: imageName,
      note: '',
      addedAt: new Date().toISOString()
    });
    
    // Show success message
    showToast('Đã thêm vào danh sách yêu thích');
  } else {
    // Remove from favorites
    favorites.splice(index, 1);
    
    // Show message
    showToast('Đã xóa khỏi danh sách yêu thích');
  }
  
  // Save updated favorites
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Like an image
function likeImage(imageId, button) {
  // Get current likes from localStorage
  const likes = JSON.parse(localStorage.getItem('likes') || '[]');
  
  // Check if already liked
  if (!likes.includes(imageId)) {
    // Add to likes
    likes.push(imageId);
    
    // Update UI
    const likeCount = button.nextElementSibling;
    likeCount.textContent = parseInt(likeCount.textContent || '0') + 1;
    
    // Add active class
    button.classList.add('active');
    
    // Show success message
    showToast('Đã thích ảnh này');
  } else {
    // Already liked, show message
    showToast('Bạn đã thích ảnh này rồi');
  }
  
  // Save updated likes
  localStorage.setItem('likes', JSON.stringify(likes));
}

// Search images
function searchImages(query) {
  if (!query || query.trim() === '') {
    // If empty query, show all images
    const category = document.querySelector('.sidebar-nav li.active a').getAttribute('data-category');
    loadImages(category);
    return;
  }
  
  // Show loading indicator
  showLoading(true);
  
  // Search in Google Drive
  driveApi.searchFiles(query, CONFIG.ui.imagesPerPage)
    .then(files => {
      // Hide loading indicator
      showLoading(false);
      
      // Update category info
      document.getElementById('category-title').textContent = `Kết quả tìm kiếm: ${query}`;
      document.getElementById('category-description').textContent = `Tìm thấy ${files.length} kết quả`;
      
      // Display search results
      displayImages(files);
      
      // Show/hide load more button based on if there are more results
      toggleLoadMoreButton(files.length >= CONFIG.ui.imagesPerPage);
    })
    .catch(error => {
      console.error('Error searching images:', error);
      showError('Không thể tìm kiếm. Vui lòng thử lại sau.');
      showLoading(false);
    });
}

// Copy selected images to clipboard
function copySelectedImages() {
  // Get favorites from localStorage
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  if (favorites.length === 0) {
    showToast('Chưa có ảnh nào được chọn');
    return;
  }
  
  // Format text to copy
  let copyText = 'Danh sách ảnh đã chọn:\n\n';
  
  favorites.forEach((fav, index) => {
    copyText += `${index + 1}. ${fav.name}\n`;
    copyText += `   URL: ${fav.url}\n`;
    if (fav.note) {
      copyText += `   Ghi chú: ${fav.note}\n`;
    }
    copyText += '\n';
  });
  
  // Copy to clipboard
  navigator.clipboard.writeText(copyText)
    .then(() => {
      showToast('Đã sao chép danh sách ảnh vào clipboard');
    })
    .catch(err => {
      console.error('Error copying text: ', err);
      showError('Không thể sao chép. Vui lòng thử lại.');
    });
}

// Send selected images to Google Sheet
function sendToSheet() {
  // Get favorites from localStorage
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  if (favorites.length === 0) {
    showToast('Chưa có ảnh nào được chọn');
    return;
  }
  
  // Show loading
  showLoading(true);
  
  // Send to Google Sheet
  sheetsApi.sendToSheet(favorites)
    .then(result => {
      showLoading(false);
      showToast('Đã gửi danh sách ảnh đến Google Sheet');
    })
    .catch(error => {
      console.error('Error sending to sheet:', error);
      showLoading(false);
      showError('Không thể gửi đến Google Sheet. Vui lòng thử lại sau.');
    });
}

// Show/hide loading indicator
function showLoading(isLoading) {
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    if (isLoading) {
      loadingIndicator.classList.add('show');
    } else {
      loadingIndicator.classList.remove('show');
    }
  }
}

// Show error message
function showError(message) {
  const errorContainer = document.getElementById('error-container');
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
      errorContainer.classList.remove('show');
    }, 5000);
  }
}

// Show toast message
function showToast(message) {
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

// Toggle load more button
function toggleLoadMoreButton(show) {
  const loadMoreButton = document.getElementById('load-more-button');
  if (loadMoreButton) {
    loadMoreButton.style.display = show ? 'block' : 'none';
  }
}

// Initialize image viewer
function initializeImageViewer() {
  // Create image viewer if it doesn't exist
  let imageViewer = document.getElementById('image-viewer');
  if (!imageViewer) {
    imageViewer = document.createElement('div');
    imageViewer.id = 'image-viewer';
    imageViewer.className = 'image-viewer';
    
    imageViewer.innerHTML = `
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
          <span class="image-viewer-note"></span>
        </div>
        <div class="image-viewer-actions">
          <button class="image-viewer-download"><i class="fas fa-download"></i> Tải xuống</button>
          <button class="image-viewer-heart"><i class="fas fa-heart"></i> Thêm vào danh sách</button>
          <button class="image-viewer-share"><i class="fas fa-share-alt"></i> Chia sẻ</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(imageViewer);
    
    // Add event listeners
    const closeButton = imageViewer.querySelector('.image-viewer-close');
    const prevButton = imageViewer.querySelector('.image-viewer-prev');
    const nextButton = imageViewer.querySelector('.image-viewer-next');
    const downloadButton = imageViewer.querySelector('.image-viewer-download');
    const heartButton = imageViewer.querySelector('.image-viewer-heart');
    const shareButton = imageViewer.querySelector('.image-viewer-share');
    
    if (closeButton) {
      closeButton.addEventListener('click', closeImageViewer);
    }
    
    if (prevButton) {
      prevButton.addEventListener('click', showPreviousImage);
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', showNextImage);
    }
    
    if (downloadButton) {
      downloadButton.addEventListener('click', downloadCurrentImage);
    }
    
    if (heartButton) {
      heartButton.addEventListener('click', favoriteCurrentImage);
    }
    
    if (shareButton) {
      shareButton.addEventListener('click', shareCurrentImage);
    }
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeImageViewer();
      } else if (e.key === 'ArrowLeft') {
        showPreviousImage();
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      }
    });
  }
}

// Current image in viewer
let currentImageIndex = 0;
let currentImages = [];

// Open image viewer
function openImageViewer(imageId, imageUrl, imageName, modelInfo) {
  const imageViewer = document.getElementById('image-viewer');
  if (!imageViewer) return;
  
  // Get all current images
  const imageCards = document.querySelectorAll('.image-card');
  currentImages = Array.from(imageCards).map(card => ({
    id: card.getAttribute('data-id'),
    url: card.querySelector('img').src,
    name: card.querySelector('img').alt
  }));
  
  // Find index of current image
  currentImageIndex = currentImages.findIndex(img => img.id === imageId);
  
  // Set image
  const viewerImg = imageViewer.querySelector('.image-viewer-img');
  const viewerTitle = imageViewer.querySelector('.image-viewer-title');
  const viewerModel = imageViewer.querySelector('.image-viewer-model');
  
  if (viewerImg) {
    viewerImg.src = imageUrl;
    viewerImg.alt = imageName;
  }
  
  if (viewerTitle) {
    viewerTitle.textContent = imageName;
  }
  
  if (viewerModel && modelInfo) {
    viewerModel.textContent = `Người mẫu: ${modelInfo.name || 'Không có thông tin'}`;
  } else if (viewerModel) {
    viewerModel.textContent = '';
  }
  
  // Show viewer
  imageViewer.classList.add('show');
  
  // Disable body scroll
  document.body.style.overflow = 'hidden';
  
  // Increment view count
  incrementViewCount(imageId);
}

// Close image viewer
function closeImageViewer() {
  const imageViewer = document.getElementById('image-viewer');
  if (!imageViewer) return;
  
  // Hide viewer
  imageViewer.classList.remove('show');
  
  // Enable body scroll
  document.body.style.overflow = '';
}

// Show previous image
function showPreviousImage() {
  if (currentImages.length === 0) return;
  
  // Update index
  currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
  
  // Get image data
  const image = currentImages[currentImageIndex];
  
  // Update viewer
  const imageViewer = document.getElementById('image-viewer');
  if (!imageViewer) return;
  
  const viewerImg = imageViewer.querySelector('.image-viewer-img');
  const viewerTitle = imageViewer.querySelector('.image-viewer-title');
  
  if (viewerImg) {
    viewerImg.src = image.url;
    viewerImg.alt = image.name;
  }
  
  if (viewerTitle) {
    viewerTitle.textContent = image.name;
  }
  
  // Get model info if available
  const modelInfo = window.modelInfo ? modelInfo.getModel(image.id) : null;
  const viewerModel = imageViewer.querySelector('.image-viewer-model');
  
  if (viewerModel && modelInfo) {
    viewerModel.textContent = `Người mẫu: ${modelInfo.name || 'Không có thông tin'}`;
  } else if (viewerModel) {
    viewerModel.textContent = '';
  }
  
  // Increment view count
  incrementViewCount(image.id);
}

// Show next image
function showNextImage() {
  if (currentImages.length === 0) return;
  
  // Update index
  currentImageIndex = (currentImageIndex + 1) % currentImages.length;
  
  // Get image data
  const image = currentImages[currentImageIndex];
  
  // Update viewer
  const imageViewer = document.getElementById('image-viewer');
  if (!imageViewer) return;
  
  const viewerImg = imageViewer.querySelector('.image-viewer-img');
  const viewerTitle = imageViewer.querySelector('.image-viewer-title');
  
  if (viewerImg) {
    viewerImg.src = image.url;
    viewerImg.alt = image.name;
  }
  
  if (viewerTitle) {
    viewerTitle.textContent = image.name;
  }
  
  // Get model info if available
  const modelInfo = window.modelInfo ? modelInfo.getModel(image.id) : null;
  const viewerModel = imageViewer.querySelector('.image-viewer-model');
  
  if (viewerModel && modelInfo) {
    viewerModel.textContent = `Người mẫu: ${modelInfo.name || 'Không có thông tin'}`;
  } else if (viewerModel) {
    viewerModel.textContent = '';
  }
  
  // Increment view count
  incrementViewCount(image.id);
}

// Download current image
function downloadCurrentImage() {
  if (currentImages.length === 0 || currentImageIndex < 0 || currentImageIndex >= currentImages.length) return;
  
  const image = currentImages[currentImageIndex];
  
  // Create a temporary link
  const a = document.createElement('a');
  a.href = image.url;
  a.download = image.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Show success message
  showToast('Đang tải xuống ảnh...');
}

// Favorite current image
function favoriteCurrentImage() {
  if (currentImages.length === 0 || currentImageIndex < 0 || currentImageIndex >= currentImages.length) return;
  
  const image = currentImages[currentImageIndex];
  
  // Get current favorites from localStorage
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  // Check if already favorited
  const index = favorites.findIndex(fav => fav.id === image.id);
  
  if (index === -1) {
    // Add to favorites
    favorites.push({
      id: image.id,
      url: image.url,
      name: image.name,
      note: '',
      addedAt: new Date().toISOString()
    });
    
    // Show success message
    showToast('Đã thêm vào danh sách yêu thích');
  } else {
    // Remove from favorites
    favorites.splice(index, 1);
    
    // Show message
    showToast('Đã xóa khỏi danh sách yêu thích');
  }
  
  // Save updated favorites
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  // Update heart button in grid
  const imageCard = document.querySelector(`.image-card[data-id="${image.id}"]`);
  if (imageCard) {
    const heartButton = imageCard.querySelector('.heart-button');
    if (heartButton) {
      if (index === -1) {
        heartButton.classList.add('active');
      } else {
        heartButton.classList.remove('active');
      }
    }
  }
}

// Share current image
function shareCurrentImage() {
  if (currentImages.length === 0 || currentImageIndex < 0 || currentImageIndex >= currentImages.length) return;
  
  const image = currentImages[currentImageIndex];
  
  // Check if Web Share API is supported
  if (navigator.share) {
    navigator.share({
      title: image.name,
      url: image.url
    })
    .then(() => {
      showToast('Đã chia sẻ thành công');
    })
    .catch(error => {
      console.error('Error sharing:', error);
      showToast('Không thể chia sẻ. Vui lòng thử lại.');
    });
  } else {
    // Fallback to copy link
    navigator.clipboard.writeText(image.url)
      .then(() => {
        showToast('Đã sao chép đường dẫn ảnh vào clipboard');
      })
      .catch(err => {
        console.error('Error copying text: ', err);
        showError('Không thể sao chép. Vui lòng thử lại.');
      });
  }
}

// Increment view count
function incrementViewCount(imageId) {
  // Get current views from localStorage
  const views = JSON.parse(localStorage.getItem('views') || '{}');
  
  // Increment view count
  views[imageId] = (views[imageId] || 0) + 1;
  
  // Save updated views
  localStorage.setItem('views', JSON.stringify(views));
  
  // Update UI
  const imageCard = document.querySelector(`.image-card[data-id="${imageId}"]`);
  if (imageCard) {
    const viewCount = imageCard.querySelector('.view-count');
    if (viewCount) {
      viewCount.textContent = views[imageId];
    }
  }
}

// Initialize dark mode
function initializeDarkMode() {
  // Create dark mode toggle if it doesn't exist
  let darkModeToggle = document.querySelector('.dark-mode-toggle');
  if (!darkModeToggle) {
    darkModeToggle = document.createElement('div');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(darkModeToggle);
    
    // Add event listener
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }
  
  // Check if dark mode is enabled
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// Toggle dark mode
function toggleDarkMode() {
  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  const isDarkMode = document.body.classList.toggle('dark-mode');
  
  // Update icon
  if (darkModeToggle) {
    darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
  
  // Save preference
  localStorage.setItem('darkMode', isDarkMode);
}

// Initialize back to top button
function initializeBackToTop() {
  // Create back to top button if it doesn't exist
  let backToTopButton = document.querySelector('.back-to-top');
  if (!backToTopButton) {
    backToTopButton = document.createElement('div');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTopButton);
    
    // Add event listener
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    });
  }
}
