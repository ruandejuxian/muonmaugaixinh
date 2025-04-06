// Function to load default images from the specified Google Drive folder
async function loadDefaultImagesFromDrive() {
  try {
    // Show loading indicator
    showLoading(true);
    
    // Get the root folder ID from config
    const folderId = CONFIG.driveApi.folderIds.root;
    
    // Fetch images from Google Drive
    const files = await driveApi.getFiles(folderId, 12, 0, 'newest');
    
    // Hide loading indicator
    showLoading(false);
    
    // Display images
    displayImages(files);
    
    // Show/hide load more button based on if there are more images
    toggleLoadMoreButton(files.length >= CONFIG.ui.imagesPerPage);
    
    return files;
  } catch (error) {
    console.error('Error loading default images:', error);
    showError('Không thể tải ảnh mặc định. Vui lòng thử lại sau.');
    showLoading(false);
    return [];
  }
}

// Function to render images from a Google Drive folder URL
async function renderImagesFromDriveUrl(driveUrl) {
  try {
    // Show loading indicator
    showLoading(true);
    
    // Extract folder ID from URL
    const folderId = driveApi.extractFolderId(driveUrl);
    
    if (!folderId) {
      throw new Error('Invalid folder URL');
    }
    
    // Fetch images from Google Drive
    const files = await driveApi.getFiles(folderId, CONFIG.ui.imagesPerPage, 0, 'newest');
    
    // Hide loading indicator
    showLoading(false);
    
    // Display images
    displayImages(files);
    
    // Show/hide load more button based on if there are more images
    toggleLoadMoreButton(files.length >= CONFIG.ui.imagesPerPage);
    
    // Update category title and description
    updateCategoryInfo(`Album từ Drive`);
    document.getElementById('category-description').textContent = `Ảnh từ thư mục Google Drive: ${driveUrl}`;
    
    return files;
  } catch (error) {
    console.error('Error rendering images from Drive URL:', error);
    showError('Không thể tải ảnh từ thư mục Google Drive. Vui lòng kiểm tra lại đường dẫn.');
    showLoading(false);
    return [];
  }
}

// Initialize the application with default images
document.addEventListener('DOMContentLoaded', function() {
  // Load default images from the specified Google Drive folder
  loadDefaultImagesFromDrive();
  
  // Add event listener for the album drive link input in the upload form
  const albumDriveLink = document.getElementById('album-drive-link');
  if (albumDriveLink) {
    albumDriveLink.addEventListener('change', async function() {
      const driveUrl = this.value.trim();
      if (driveUrl && driveUrl.includes('drive.google.com')) {
        try {
          // Show loading indicator
          const loadingIndicator = document.getElementById('loading-indicator');
          if (loadingIndicator) loadingIndicator.classList.add('show');
          
          // Get files from the folder
          const folderId = driveApi.extractFolderId(driveUrl);
          if (!folderId) {
            throw new Error('Invalid folder URL');
          }
          
          const files = await driveApi.getFiles(folderId);
          
          // Hide loading indicator
          if (loadingIndicator) loadingIndicator.classList.remove('show');
          
          // Display preview of images
          const previewContainer = document.getElementById('album-selected-files');
          if (previewContainer) {
            previewContainer.innerHTML = '';
            
            if (files.length === 0) {
              previewContainer.innerHTML = '<p class="no-files">Không tìm thấy ảnh nào trong thư mục này.</p>';
              return;
            }
            
            const previewGrid = document.createElement('div');
            previewGrid.className = 'preview-grid';
            
            files.forEach(file => {
              const previewItem = document.createElement('div');
              previewItem.className = 'preview-item';
              
              // Create image URL with proxy to avoid CORS issues
              const imageUrl = file.thumbnailLink || `${CONFIG.cloudflare.proxyUrl}?fileId=${file.id}`;
              
              previewItem.innerHTML = `
                <img src="${imageUrl}" alt="${file.name}" loading="lazy">
                <div class="preview-item-name">${file.name}</div>
              `;
              
              previewGrid.appendChild(previewItem);
            });
            
            previewContainer.appendChild(previewGrid);
            
            const fileCount = document.createElement('div');
            fileCount.className = 'file-count';
            fileCount.textContent = `Tìm thấy ${files.length} ảnh`;
            previewContainer.appendChild(fileCount);
          }
        } catch (error) {
          console.error('Error handling drive link change:', error);
          showToast('Không thể tải ảnh từ thư mục Google Drive. Vui lòng kiểm tra lại đường dẫn.', 'error');
        }
      }
    });
  }
});

// Export functions
window.loadDefaultImagesFromDrive = loadDefaultImagesFromDrive;
window.renderImagesFromDriveUrl = renderImagesFromDriveUrl;
