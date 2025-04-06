// Configuration settings
const CONFIG = {
  // Google Drive API settings
  driveApi: {
    apiKey: 'AIzaSyABU4L5P1QLdCIzQFQzbjfGx66wON0Oqog',
    clientId: '479654744127-tqmjvu3psn21dnlt8coj086de7h8qfrr.apps.googleusercontent.com',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    scopes: 'https://www.googleapis.com/auth/drive.readonly',
    // Folder IDs for different categories
    folderIds: {
      root: '1HJjnENuLswyPnkbC-cpFjW6Bv3iBd4a5',
      western: '1fsjYePp_avI7EGoeBVEQ7tKsCg1WWDqZ',
      asian: '1sGVEi3z8oDTy9N6O7dVlk_7lOvwJ4FEb',
      vietnam: '1efsTyxerBHL20i1aJbO91VdLeqLgoSUS',
      other: '1-MMMq6jFys80naTISlDWUe5ufqacMMoc',
      pending: '1TU4drTMMontDw_xpoujcPKMxlsbamZPg' // For pending approval images
    }
  },
  
  // Cloudflare Worker settings
  cloudflare: {
    proxyUrl: 'https://muonmaugaixinh.karrythaonguyen0.workers.dev/'
  },
  
  // Google Sheets API settings
  sheetsApi: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbxSbCbX4Jl4sHNITok_DXECGLQ6Urn1QasLK0rSMT9dLVGxf4NbQObgAKT0IQ2Hibdp/exec',
    sheetId: '1yU_sBq7OiupRiXK_AqbhUERlN-V79JKeDCxbf2qvAFU',
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
