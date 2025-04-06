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
      case 'vietnam':
        categoryTitle.textContent = 'Gái Việt';
        categoryDescription.textContent = 'Bộ sưu tập ảnh người mẫu Việt Nam';
        break;
      case 'western':
        categoryTitle.textContent = 'Gái Âu Mỹ';
        categoryDescription.textContent = 'Bộ sưu tập ảnh người mẫu Âu Mỹ';
        break;
      case 'asian':
        categoryTitle.textContent = 'Gái Châu Á';
        categoryDescription.textContent = 'Bộ sưu tập ảnh người mẫu Châu Á';
        break;
      case 'other':
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
    case 'vietnam':
      folderId = CONFIG.driveApi.folderIds.vietnam;
      break;
    case 'western':
      folderId = CONFIG.driveApi.folderIds.western;
      break;
    case 'asian':
      folderId = CONFIG.driveApi.folderIds.asian;
      break;
    case 'other':
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
    case 'vietnam':
      folderId = CONFIG.driveApi.folderIds.vietnam;
      break;
    case 'western':
      folderId = CONFIG.driveApi.folderIds.western;
      break;
    case 'asian':
      folderId = CONFIG.driveApi.folderIds.asian;
      break;
    case 'other':
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
  const modelInfo = window.modelInfo ? window.modelInfo.getModel(file.id) : null;
  
  // Create image URL with proxy to avoid CORS issues
  const imageUrl = `${CONFIG.cloudflare.proxyUrl}?fileId=${file.id}`;
  
  // Create card HTML with model info for hover
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
        <div class="image-card-model-info">
          <div class="image-card-model-name">${modelInfo ? modelInfo.name : file.name}</div>
          <div class="image-card-title">${file.name}</div>
          <div class="image-card-social">
            ${modelInfo && modelInfo.instagram ? `<a href="${modelInfo.instagram}" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
            ${modelInfo && modelInfo.facebook ? `<a href="${modelInfo.facebook}" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a>` : ''}
            ${modelInfo && modelInfo.twitter ? `<a href="${modelInfo.twitter}" target="_blank" title="Twitter"><i class="fab fa-twitter"></i></a>` : ''}
          </div>
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
    
    // Show success message
    showToast('Đã xóa khỏi danh sách yêu thích');
  }
  
  // Save to localStorage
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  // Update UI to reflect changes
  updateFavoriteUI();
}

// Update favorite UI
function updateFavoriteUI() {
  // Get current favorites from localStorage
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  // Update heart buttons in image grid
  const imageCards = document.querySelectorAll('.image-card');
  
  imageCards.forEach(card => {
    const id = card.getAttribute('data-id');
    const heartButton = card.querySelector('.heart-button');
    
    if (heartButton) {
      const isFavorite = favorites.some(fav => fav.id === id);
      heartButton.classList.toggle('active', isFavorite);
    }
  });
}

// Like an image
function likeImage(imageId, button) {
  button.classList.toggle('active');
  
  // Get like counts from localStorage
  const likeCounts = JSON.parse(localStorage.getItem('likeCounts') || '{}');
  
  // Check if already liked
  if (button.classList.contains('active')) {
    // Increment like count
    likeCounts[imageId] = (likeCounts[imageId] || 0) + 1;
    
    // Show success message
    showToast('Đã thích ảnh');
  } else {
    // Decrement like count
    likeCounts[imageId] = Math.max(0, (likeCounts[imageId] || 0) - 1);
  }
  
  // Save to localStorage
  localStorage.setItem('likeCounts', JSON.stringify(likeCounts));
  
  // Update UI
  const likeCountElements = document.querySelectorAll(`.image-card[data-id="${imageId}"] .like-count`);
  likeCountElements.forEach(element => {
    element.textContent = likeCounts[imageId] || 0;
  });
}

// Copy selected images to clipboard
function copySelectedImages() {
  // Get favorites from localStorage
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  if (favorites.length === 0) {
    showToast('Chưa có ảnh nào được chọn', 'error');
    return;
  }
  
  // Create text to copy
  let text = 'Danh sách ảnh đã chọn:\n\n';
  
  favorites.forEach((fav, index) => {
    text += `${index + 1}. ${fav.name}\n`;
    if (fav.note) {
      text += `   Ghi chú: ${fav.note}\n`;
    }
    text += `   Link: ${fav.url}\n\n`;
  });
  
  // Copy to clipboard
  navigator.clipboard.writeText(text)
    .then(() => {
      showToast('Đã sao chép danh sách ảnh vào clipboard');
    })
    .catch(err => {
      console.error('Could not copy text: ', err);
      showToast('Không thể sao chép danh sách', 'error');
    });
}

// Send selected images to Google Sheet
function sendToSheet() {
  // Get favorites from localStorage
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  if (favorites.length === 0) {
    showToast('Chưa có ảnh nào được chọn', 'error');
    return;
  }
  
  // Show sheet form
  showSheetForm(favorites);
}

// Show Google Sheet form
function showSheetForm(favorites) {
  // Check if form already exists
  let form = document.getElementById('sheet-form');
  if (!form) {
    // Create form
    form = document.createElement('div');
    form.id = 'sheet-form';
    form.className = 'image-detail-form';
    
    form.innerHTML = `
      <div class="form-header">
        <h3>Gửi đến Google Sheet</h3>
        <button class="form-close">&times;</button>
      </div>
      <div class="form-content">
        <div class="form-group">
          <label for="sheet-email">Email của bạn</label>
          <input type="email" id="sheet-email" placeholder="Nhập email của bạn">
        </div>
        <div class="form-group">
          <label for="sheet-name">Tên của bạn</label>
          <input type="text" id="sheet-name" placeholder="Nhập tên của bạn">
        </div>
        <div class="form-group">
          <label>Danh sách ảnh đã chọn (${favorites.length})</label>
          <div class="selected-images-preview">
            ${favorites.map(fav => `
              <div class="selected-image-item">
                <img src="${fav.url}" alt="${fav.name}">
                <div class="selected-image-name">${fav.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary send-button">Gửi</button>
          <button class="btn btn-outline cancel-button">Hủy</button>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(form);
    
    // Add event listeners
    const closeButton = form.querySelector('.form-close');
    const cancelButton = form.querySelector('.cancel-button');
    const sendButton = form.querySelector('.send-button');
    
    closeButton.addEventListener('click', () => {
      form.classList.remove('show');
    });
    
    cancelButton.addEventListener('click', () => {
      form.classList.remove('show');
    });
    
    sendButton.addEventListener('click', () => {
      const email = document.getElementById('sheet-email').value;
      const name = document.getElementById('sheet-name').value;
      
      if (!email) {
        showToast('Vui lòng nhập email của bạn', 'error');
        return;
      }
      
      // Send to Google Sheet
      sendToGoogleSheet(favorites, email, name);
      
      // Hide form
      form.classList.remove('show');
    });
  } else {
    // Update favorites list
    const previewContainer = form.querySelector('.selected-images-preview');
    if (previewContainer) {
      previewContainer.innerHTML = favorites.map(fav => `
        <div class="selected-image-item">
          <img src="${fav.url}" alt="${fav.name}">
          <div class="selected-image-name">${fav.name}</div>
        </div>
      `).join('');
    }
    
    // Update count
    const label = form.querySelector('.form-group label');
    if (label) {
      label.textContent = `Danh sách ảnh đã chọn (${favorites.length})`;
    }
  }
  
  // Show form
  form.classList.add('show');
}

// Send to Google Sheet
async function sendToGoogleSheet(favorites, email, name) {
  // Show loading
  showLoading(true);
  
  try {
    // Prepare data
    const data = {
      email: email,
      name: name,
      images: favorites.map(fav => ({
        id: fav.id,
        name: fav.name,
        note: fav.note || '',
        url: fav.url
      })),
      timestamp: new Date().toISOString()
    };
    
    // Send to Google Sheet
    await sheetsApi.sendToSheet(data);
    
    // Show success message
    showToast('Đã gửi danh sách ảnh đến Google Sheet');
  } catch (error) {
    console.error('Error sending to Google Sheet:', error);
    showToast('Không thể gửi đến Google Sheet. Vui lòng thử lại sau.', 'error');
  } finally {
    // Hide loading
    showLoading(false);
  }
}

// Search images
function searchImages(query) {
  if (!query) return;
  
  // Show loading indicator
  showLoading(true);
  
  // Update category title and description
  const categoryTitle = document.getElementById('category-title');
  const categoryDescription = document.getElementById('category-description');
  
  if (categoryTitle) {
    categoryTitle.textContent = `Kết quả tìm kiếm: ${query}`;
  }
  
  if (categoryDescription) {
    categoryDescription.textContent = 'Các ảnh phù hợp với từ khóa tìm kiếm';
  }
  
  // Clear current images
  const imageGrid = document.getElementById('image-grid');
  if (imageGrid) {
    imageGrid.innerHTML = '';
  }
  
  // Search images
  driveApi.searchFiles(query)
    .then(files => {
      // Hide loading indicator
      showLoading(false);
      
      // Display images
      displayImages(files);
      
      // Hide load more button for search results
      toggleLoadMoreButton(false);
    })
    .catch(error => {
      console.error('Error searching images:', error);
      showError('Không thể tìm kiếm ảnh. Vui lòng thử lại sau.');
      showLoading(false);
    });
}

// Show/hide loading indicator
function showLoading(isShow) {
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    if (isShow) {
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
    errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
    errorContainer.style.display = 'block';
  }
}

// Show toast message
function showToast(message, type = 'success') {
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

// Toggle load more button
function toggleLoadMoreButton(show) {
  const loadMoreButton = document.getElementById('load-more-button');
  if (loadMoreButton) {
    loadMoreButton.style.display = show ? 'block' : 'none';
  }
}

// Initialize dark mode
function initializeDarkMode() {
  // Check if dark mode is enabled in localStorage
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }
}

// Initialize back to top button
function initializeBackToTop() {
  const backToTopButton = document.querySelector('.back-to-top');
  if (backToTopButton) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}
