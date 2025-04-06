// Placeholder image for when Google Drive images fail to load
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik04NSA2NUgxMTVWMTM1SDg1Vjk1SDY1VjEzNUgzNVY2NUg2NVY4NUg4NVY2NVoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHBhdGggZD0iTTEzNSA2NUgxNjVWMTM1SDEzNVY2NVoiIGZpbGw9IiNDQ0NDQ0MiLz4KPC9zdmc+Cg==';

// Sample data for demo images - using direct image URLs for better compatibility
const SAMPLE_IMAGES = {
  'western': [
    {
      id: 'western_1',
      url: 'https://i.imgur.com/JlVKy9L.jpg',
      title: 'Western Model 1',
      views: 150,
      likes: 67
    },
    {
      id: 'western_2',
      url: 'https://i.imgur.com/pWrZKvE.jpg',
      title: 'Western Model 2',
      views: 180,
      likes: 92
    },
    {
      id: 'western_3',
      url: 'https://i.imgur.com/8UcuLGQ.jpg',
      title: 'Western Model 3',
      views: 120,
      likes: 45
    },
    {
      id: 'western_4',
      url: 'https://i.imgur.com/QT9vQTz.jpg',
      title: 'Western Model 4',
      views: 200,
      likes: 78
    }
  ],
  'asian': [
    {
      id: 'asian_1',
      url: 'https://i.imgur.com/LWHYlBh.jpg',
      title: 'Asian Model 1',
      views: 165,
      likes: 72
    },
    {
      id: 'asian_2',
      url: 'https://i.imgur.com/vwaTljb.jpg',
      title: 'Asian Model 2',
      views: 190,
      likes: 85
    }
  ],
  'vietnam': [
    {
      id: 'vietnam_1',
      url: 'https://i.imgur.com/rnDCWzN.jpg',
      title: 'Vietnam Model 1',
      views: 210,
      likes: 95
    },
    {
      id: 'vietnam_2',
      url: 'https://i.imgur.com/xhiZGIb.jpg',
      title: 'Vietnam Model 2',
      views: 175,
      likes: 82
    }
  ],
  'other': [
    {
      id: 'other_1',
      url: 'https://i.imgur.com/JR8ilLc.jpg',
      title: 'Other Model 1',
      views: 130,
      likes: 55
    }
  ]
};

// Function to load sample images
function loadSampleImages() {
  console.log('Loading sample images for demo...');
  
  // Get the image grid element
  const imageGrid = document.getElementById('image-grid');
  if (!imageGrid) return;
  
  // Clear loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  // Get current category from URL or default to 'all'
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category') || 'all';
  
  // Determine which images to show
  let imagesToShow = [];
  if (category === 'all') {
    // Show some images from each category
    Object.keys(SAMPLE_IMAGES).forEach(cat => {
      imagesToShow = imagesToShow.concat(SAMPLE_IMAGES[cat].slice(0, 2));
    });
  } else if (SAMPLE_IMAGES[category]) {
    // Show all images from the selected category
    imagesToShow = SAMPLE_IMAGES[category];
  }
  
  // Create image cards
  imagesToShow.forEach(image => {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.dataset.id = image.id;
    
    card.innerHTML = `
      <div class="image-card-inner">
        <img src="${image.url}" alt="${image.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
        <div class="image-card-overlay">
          <div class="image-card-actions">
            <button class="heart-button" title="Thêm vào danh sách"><i class="fas fa-heart"></i></button>
            <button class="view-button" title="Xem ảnh"><i class="fas fa-eye"></i></button>
            <span class="view-count">${image.views}</span>
            <button class="like-button" title="Thích"><i class="fas fa-thumbs-up"></i></button>
            <span class="like-count">${image.likes}</span>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const heartButton = card.querySelector('.heart-button');
    if (heartButton) {
      heartButton.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
      });
    }
    
    const viewButton = card.querySelector('.view-button');
    if (viewButton) {
      viewButton.addEventListener('click', function(e) {
        e.stopPropagation();
        // Open image viewer
        if (window.imageViewer) {
          window.imageViewer.open(image.url, image.title);
        }
      });
    }
    
    // Add card to grid
    imageGrid.appendChild(card);
  });
  
  // If no images were added, show a message
  if (imagesToShow.length === 0) {
    const noImages = document.createElement('div');
    noImages.className = 'no-images';
    noImages.innerHTML = '<i class="fas fa-image"></i><p>Không có ảnh nào trong danh mục này.</p>';
    imageGrid.appendChild(noImages);
  }
}

// Add dark mode toggle functionality
function setupDarkModeToggle() {
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'dark-mode-toggle';
  darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  darkModeToggle.title = 'Chuyển đổi chế độ tối/sáng';
  
  // Check if dark mode is enabled in localStorage
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  
  // Add event listener
  darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isNowDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isNowDark);
    
    // Update icon
    if (isNowDark) {
      this.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      this.innerHTML = '<i class="fas fa-moon"></i>';
    }
  });
  
  // Add to document
  document.body.appendChild(darkModeToggle);
}

// Add CORS explanation for localhost
function addCorsExplanation() {
  // Only add if we're on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const corsNotice = document.createElement('div');
    corsNotice.className = 'cors-notice';
    corsNotice.innerHTML = `
      <div class="cors-notice-inner">
        <h3><i class="fas fa-exclamation-triangle"></i> Lưu ý khi chạy trên localhost</h3>
        <p>Khi chạy ứng dụng trên localhost, bạn có thể gặp lỗi CORS khi tải ảnh lên hoặc tương tác với Google API.</p>
        <p>Đây là giới hạn bảo mật của trình duyệt và Google API, không phải lỗi của ứng dụng.</p>
        <p>Để khắc phục, bạn cần triển khai ứng dụng lên một domain thực (theo hướng dẫn triển khai).</p>
        <button class="cors-notice-close"><i class="fas fa-times"></i></button>
      </div>
    `;
    
    // Add close button functionality
    const closeButton = corsNotice.querySelector('.cors-notice-close');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        corsNotice.style.display = 'none';
        localStorage.setItem('corsNoticeHidden', 'true');
      });
    }
    
    // Only show if not previously hidden
    if (localStorage.getItem('corsNoticeHidden') !== 'true') {
      document.body.appendChild(corsNotice);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Setup dark mode toggle
  setupDarkModeToggle();
  
  // Add CORS explanation
  addCorsExplanation();
  
  // Load sample images
  loadSampleImages();
});
