// Footer functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize footer components
  initFooter();
});

function initFooter() {
  // Add event listeners for footer buttons
  const copyButton = document.getElementById('copy-button');
  const sheetButton = document.getElementById('sheet-button');
  
  if (copyButton) {
    copyButton.addEventListener('click', copySelectedImages);
  }
  
  if (sheetButton) {
    sheetButton.addEventListener('click', sendToSheet);
  }
}

// Copy selected images to clipboard
function copySelectedImages() {
  const selectedImages = getSelectedImages();
  
  if (selectedImages.length === 0) {
    showNotification('Vui lòng chọn ít nhất một ảnh');
    return;
  }
  
  let copyText = '';
  selectedImages.forEach(img => {
    copyText += img.url + '\n';
    if (img.note) {
      copyText += 'Ghi chú: ' + img.note + '\n';
    }
    copyText += '\n';
  });
  
  // Copy to clipboard
  navigator.clipboard.writeText(copyText)
    .then(() => {
      showNotification(`Đã sao chép ${selectedImages.length} ảnh vào clipboard`);
    })
    .catch(err => {
      console.error('Không thể sao chép: ', err);
      showNotification('Không thể sao chép vào clipboard');
    });
}

// Send selected images to Google Sheet
function sendToSheet() {
  const selectedImages = getSelectedImages();
  
  if (selectedImages.length === 0) {
    showNotification('Vui lòng chọn ít nhất một ảnh');
    return;
  }
  
  // Show loading indicator
  showNotification('Đang gửi ảnh đến Google Sheet...');
  
  // Call the Google Apps Script function
  sheetsApi.sendToSheet(selectedImages)
    .then(response => {
      showNotification(`Đã gửi ${selectedImages.length} ảnh đến Google Sheet`);
    })
    .catch(error => {
      console.error('Lỗi khi gửi đến Sheet: ', error);
      showNotification('Không thể gửi đến Google Sheet');
    });
}

// Helper function to get selected images
function getSelectedImages() {
  const selectedElements = document.querySelectorAll('.image-card.selected');
  const selectedImages = [];
  
  selectedElements.forEach(el => {
    const imageId = el.dataset.id;
    const imageUrl = el.dataset.url;
    const noteEl = el.querySelector('.image-note');
    const note = noteEl ? noteEl.value : '';
    
    selectedImages.push({
      id: imageId,
      url: imageUrl,
      note: note
    });
  });
  
  return selectedImages;
}

// Show notification
function showNotification(message, duration = 3000) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Hide and remove notification
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, duration);
}
