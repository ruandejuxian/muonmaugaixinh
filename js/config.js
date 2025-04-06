// Configuration settings
const CONFIG = {
  // Google Drive API settings
  driveApi: {
    apiKey: 'YOUR_API_KEY',
    clientId: 'YOUR_CLIENT_ID',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    scopes: 'https://www.googleapis.com/auth/drive.readonly',
    // Folder IDs for different categories
    folderIds: {
      root: '1HJjnENuLswyPnkbC-cpFjW6Bv3iBd4a5',
      western: 'WESTERN_FOLDER_ID',
      asian: 'ASIAN_FOLDER_ID',
      vietnam: 'VIETNAM_FOLDER_ID',
      other: 'OTHER_FOLDER_ID',
      pending: 'PENDING_FOLDER_ID' // For pending approval images
    }
  },
  
  // Cloudflare Worker settings
  cloudflare: {
    proxyUrl: 'https://your-worker.your-subdomain.workers.dev'
  },
  
  // Google Sheets API settings
  sheetsApi: {
    scriptUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    sheetId: 'YOUR_SHEET_ID',
    pendingSheetName: 'Chưa duyệt'
  },
  
  // UI settings
  ui: {
    imagesPerPage: 20,
    maxUploadSingleImage: 1,
    maxUploadAlbumImages: 20,
    defaultAlbumName: 'Album',
    imageQualityOptions: [
      { label: 'Gốc', value: 'original' },
      { label: 'Cao (1920px)', value: 'high' },
      { label: 'Trung bình (1280px)', value: 'medium' },
      { label: 'Thấp (800px)', value: 'low' }
    ]
  },
  
  // Feature flags
  features: {
    enableDarkMode: true,
    enableImageNotes: true,
    enableSocialSharing: true,
    enableViewCount: true,
    enableLikeCount: true
  }
};

// Export configuration
window.CONFIG = CONFIG;
