// Google Drive API integration
class DriveAPI {
  constructor() {
    this.apiKey = CONFIG.driveApi.apiKey;
    this.clientId = CONFIG.driveApi.clientId;
    this.discoveryDocs = CONFIG.driveApi.discoveryDocs;
    this.scopes = CONFIG.driveApi.scopes;
    this.folderIds = CONFIG.driveApi.folderIds;
    this.isInitialized = false;
    this.isAuthorized = false;
  }

  // Initialize the API client
  async init() {
    if (this.isInitialized) return;

    try {
      await gapi.client.init({
        apiKey: this.apiKey,
        clientId: this.clientId,
        discoveryDocs: this.discoveryDocs,
        scope: this.scopes
      });

      // Listen for sign-in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));

      // Handle the initial sign-in state
      this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

      this.isInitialized = true;
      console.log('Drive API initialized successfully');
    } catch (error) {
      console.error('Error initializing Drive API:', error);
      throw error;
    }
  }

  // Update sign-in status
  updateSigninStatus(isSignedIn) {
    this.isAuthorized = isSignedIn;
    console.log('Drive API auth status:', isSignedIn ? 'Signed in' : 'Signed out');
  }

  // Sign in the user
  signIn() {
    if (!this.isInitialized) {
      console.error('Drive API not initialized');
      return;
    }

    return gapi.auth2.getAuthInstance().signIn();
  }

  // Sign out the user
  signOut() {
    if (!this.isInitialized) {
      console.error('Drive API not initialized');
      return;
    }

    return gapi.auth2.getAuthInstance().signOut();
  }

  // Get files from a folder
  async getFiles(folderId, pageSize = 20, pageToken = null, sortOrder = 'newest') {
    try {
      // Ensure API is initialized
      if (!this.isInitialized) {
        await this.init();
      }

      // For demo purposes, return sample images if API fails
      if (!this.isAuthorized || window.location.hostname === 'ruandejuxian.github.io') {
        console.log('Using sample images for demo');
        return this.getSampleImages(folderId);
      }

      // Build query
      let query = `'${folderId}' in parents and mimeType contains 'image/'`;
      let orderBy = 'modifiedTime desc'; // Default to newest

      // Set sort order
      switch (sortOrder) {
        case 'oldest':
          orderBy = 'modifiedTime asc';
          break;
        case 'name_asc':
          orderBy = 'name asc';
          break;
        case 'name_desc':
          orderBy = 'name desc';
          break;
      }

      // Execute the request
      const response = await gapi.client.drive.files.list({
        q: query,
        pageSize: pageSize,
        pageToken: pageToken,
        orderBy: orderBy,
        fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webContentLink, modifiedTime)'
      });

      return response.result.files;
    } catch (error) {
      console.error('Error getting files from Drive:', error);
      // Return sample images as fallback
      return this.getSampleImages(folderId);
    }
  }

  // Get sample images for demo
  getSampleImages(folderId) {
    // Map folder ID to category
    let category = 'all';
    Object.keys(this.folderIds).forEach(key => {
      if (this.folderIds[key] === folderId) {
        category = key;
      }
    });

    // Get sample images from demo-fixes.js
    if (category === 'root' || category === 'all') {
      // Combine all categories
      let allImages = [];
      Object.keys(SAMPLE_IMAGES).forEach(cat => {
        allImages = allImages.concat(SAMPLE_IMAGES[cat]);
      });
      return allImages.map(img => this.convertSampleToFileFormat(img));
    } else if (SAMPLE_IMAGES[category]) {
      // Return specific category
      return SAMPLE_IMAGES[category].map(img => this.convertSampleToFileFormat(img));
    } else {
      // Default empty array
      return [];
    }
  }

  // Convert sample image to Drive API file format
  convertSampleToFileFormat(sampleImage) {
    return {
      id: sampleImage.id,
      name: sampleImage.title,
      mimeType: 'image/jpeg',
      thumbnailLink: sampleImage.url,
      webContentLink: sampleImage.url,
      modifiedTime: new Date().toISOString(),
      viewCount: sampleImage.views || 0,
      likeCount: sampleImage.likes || 0
    };
  }

  // Search for files
  async searchFiles(query, pageSize = 20, pageToken = null) {
    try {
      // Ensure API is initialized
      if (!this.isInitialized) {
        await this.init();
      }

      // For demo purposes, return sample images if API fails
      if (!this.isAuthorized || window.location.hostname === 'ruandejuxian.github.io') {
        console.log('Using sample images for search');
        return this.searchSampleImages(query);
      }

      // Build query
      let searchQuery = `name contains '${query}' and mimeType contains 'image/' and (`;
      
      // Add folder constraints
      const folderKeys = Object.keys(this.folderIds);
      folderKeys.forEach((key, index) => {
        if (key !== 'pending') { // Exclude pending folder
          searchQuery += `'${this.folderIds[key]}' in parents`;
          if (index < folderKeys.length - 2) { // -2 because we're excluding 'pending'
            searchQuery += ' or ';
          }
        }
      });
      
      searchQuery += ')';

      // Execute the request
      const response = await gapi.client.drive.files.list({
        q: searchQuery,
        pageSize: pageSize,
        pageToken: pageToken,
        orderBy: 'modifiedTime desc',
        fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webContentLink, modifiedTime)'
      });

      return response.result.files;
    } catch (error) {
      console.error('Error searching files in Drive:', error);
      // Return sample search results as fallback
      return this.searchSampleImages(query);
    }
  }

  // Search sample images for demo
  searchSampleImages(query) {
    query = query.toLowerCase();
    let results = [];
    
    // Search through all sample images
    Object.keys(SAMPLE_IMAGES).forEach(category => {
      SAMPLE_IMAGES[category].forEach(img => {
        if (img.title.toLowerCase().includes(query)) {
          results.push(this.convertSampleToFileFormat(img));
        }
      });
    });
    
    return results;
  }

  // Get files from a folder by URL
  async getFilesByFolderUrl(folderUrl, pageSize = 20) {
    try {
      // Extract folder ID from URL
      const folderId = this.extractFolderId(folderUrl);
      
      if (!folderId) {
        throw new Error('Invalid folder URL');
      }
      
      // Get files from the folder
      return await this.getFiles(folderId, pageSize);
    } catch (error) {
      console.error('Error getting files by folder URL:', error);
      throw error;
    }
  }

  // Extract folder ID from Google Drive URL
  extractFolderId(url) {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a folders link
      if (urlObj.pathname.includes('/folders/')) {
        const pathParts = urlObj.pathname.split('/');
        const folderIdIndex = pathParts.indexOf('folders') + 1;
        
        if (folderIdIndex < pathParts.length) {
          return pathParts[folderIdIndex];
        }
      }
      
      // Check if it's a file link with id parameter
      const fileId = urlObj.searchParams.get('id');
      if (fileId) {
        return fileId;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting folder ID:', error);
      return null;
    }
  }

  // Upload a file to Drive
  async uploadFile(file, folderId, metadata = {}) {
    try {
      // Ensure API is initialized and user is authorized
      if (!this.isInitialized) {
        await this.init();
      }

      if (!this.isAuthorized) {
        await this.signIn();
      }

      // Create file metadata
      const fileMetadata = {
        name: metadata.name || file.name,
        mimeType: file.type,
        parents: [folderId]
      };

      // Create a new multipart request
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', file);

      // Execute the upload
      const accessToken = gapi.auth.getToken().access_token;
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: form
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading file to Drive:', error);
      throw error;
    }
  }

  // Get file by ID
  async getFile(fileId) {
    try {
      // Ensure API is initialized
      if (!this.isInitialized) {
        await this.init();
      }

      // For demo purposes, return sample image if API fails
      if (!this.isAuthorized || window.location.hostname === 'ruandejuxian.github.io') {
        return this.getSampleFileById(fileId);
      }

      // Execute the request
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime'
      });

      return response.result;
    } catch (error) {
      console.error('Error getting file from Drive:', error);
      // Return sample file as fallback
      return this.getSampleFileById(fileId);
    }
  }

  // Get sample file by ID for demo
  getSampleFileById(fileId) {
    let foundImage = null;
    
    // Search through all sample images
    Object.keys(SAMPLE_IMAGES).forEach(category => {
      SAMPLE_IMAGES[category].forEach(img => {
        if (img.id === fileId) {
          foundImage = img;
        }
      });
    });
    
    if (foundImage) {
      return this.convertSampleToFileFormat(foundImage);
    }
    
    // Default fallback
    return {
      id: fileId,
      name: 'Sample Image',
      mimeType: 'image/jpeg',
      thumbnailLink: PLACEHOLDER_IMAGE,
      webContentLink: PLACEHOLDER_IMAGE,
      webViewLink: PLACEHOLDER_IMAGE,
      modifiedTime: new Date().toISOString()
    };
  }
}

// Create and export Drive API instance
const driveApi = new DriveAPI();

// Load the Google API client library
function loadGapiClient() {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', {
      callback: resolve,
      onerror: reject,
      timeout: 5000,
      ontimeout: reject
    });
  });
}

// Initialize Drive API when page loads
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Check if gapi is available
    if (typeof gapi !== 'undefined') {
      await loadGapiClient();
      await driveApi.init();
      console.log('Drive API initialized successfully');
    } else {
      console.warn('Google API client library not loaded');
    }
  } catch (error) {
    console.error('Error initializing Drive API:', error);
  }
});
