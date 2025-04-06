// Google Drive API integration
class DriveAPI {
  constructor() {
    this.apiKey = CONFIG.driveApi.apiKey;
    this.clientId = CONFIG.driveApi.clientId;
    this.discoveryDocs = CONFIG.driveApi.discoveryDocs;
    this.scopes = CONFIG.driveApi.scopes;
    this.folderIds = CONFIG.driveApi.folderIds;
    this.isAuthenticated = false;
    this.isInitialized = false;
    
    // Initialize the API
    this.init();
  }
  
  // Initialize the API
  async init() {
    try {
      // Load the Google API client library
      await this.loadGapiClient();
      
      // Initialize the client
      await this.initClient();
      
      // Set initialization flag
      this.isInitialized = true;
      
      // Check if user is signed in
      this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      
      // Listen for sign-in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));
      
      console.log('Google Drive API initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Drive API:', error);
      // Use demo data if API initialization fails
      this.useDemoData();
    }
  }
  
  // Load the Google API client library
  loadGapiClient() {
    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', {
        callback: resolve,
        onerror: reject,
        timeout: 5000,
        ontimeout: reject
      });
    });
  }
  
  // Initialize the client
  async initClient() {
    try {
      await gapi.client.init({
        apiKey: this.apiKey,
        clientId: this.clientId,
        discoveryDocs: this.discoveryDocs,
        scope: this.scopes
      });
    } catch (error) {
      console.error('Error initializing client:', error);
      throw error;
    }
  }
  
  // Update sign-in status
  updateSigninStatus(isSignedIn) {
    this.isAuthenticated = isSignedIn;
    console.log('User is signed in:', isSignedIn);
    
    // Update UI based on sign-in status
    const authButton = document.getElementById('auth-button');
    if (authButton) {
      if (isSignedIn) {
        authButton.textContent = 'Đăng xuất';
      } else {
        authButton.textContent = 'Đăng nhập với Google';
      }
    }
  }
  
  // Sign in the user
  signIn() {
    if (!this.isInitialized) {
      console.error('API not initialized');
      return Promise.reject('API not initialized');
    }
    
    return gapi.auth2.getAuthInstance().signIn();
  }
  
  // Sign out the user
  signOut() {
    if (!this.isInitialized) {
      console.error('API not initialized');
      return Promise.reject('API not initialized');
    }
    
    return gapi.auth2.getAuthInstance().signOut();
  }
  
  // Get files from a folder
  async getFiles(folderId, limit = 50, offset = 0, sortBy = 'name') {
    try {
      if (!this.isInitialized) {
        console.warn('API not initialized, using demo data');
        return this.getDemoFiles(folderId, limit, offset, sortBy);
      }
      
      // Build query
      let query = `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`;
      
      // Build sort order
      let orderBy = '';
      switch (sortBy) {
        case 'newest':
          orderBy = 'modifiedTime desc';
          break;
        case 'oldest':
          orderBy = 'modifiedTime asc';
          break;
        case 'name':
          orderBy = 'name asc';
          break;
        case 'name_desc':
          orderBy = 'name desc';
          break;
        default:
          orderBy = 'modifiedTime desc';
      }
      
      // Execute the request
      const response = await gapi.client.drive.files.list({
        q: query,
        pageSize: limit,
        pageToken: offset > 0 ? this.getPageToken(offset) : null,
        fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, createdTime, modifiedTime)',
        orderBy: orderBy
      });
      
      // Process the response
      const files = response.result.files;
      
      if (files && files.length > 0) {
        return files.map(file => ({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          thumbnailLink: file.thumbnailLink,
          webContentLink: file.webContentLink,
          webViewLink: file.webViewLink,
          createdTime: file.createdTime,
          modifiedTime: file.modifiedTime,
          viewCount: Math.floor(Math.random() * 1000),
          likeCount: Math.floor(Math.random() * 100)
        }));
      } else {
        console.log('No files found in folder:', folderId);
        return [];
      }
    } catch (error) {
      console.error('Error getting files:', error);
      return this.getDemoFiles(folderId, limit, offset, sortBy);
    }
  }
  
  // Get page token for pagination
  getPageToken(offset) {
    // This is a simplified implementation
    // In a real implementation, you would need to store and manage page tokens
    return null;
  }
  
  // Search files
  async searchFiles(query, limit = 50) {
    try {
      if (!this.isInitialized) {
        console.warn('API not initialized, using demo data');
        return this.getDemoFiles(null, limit, 0, 'name', query);
      }
      
      // Build query
      let searchQuery = `mimeType contains 'image/' and trashed = false and name contains '${query}'`;
      
      // Execute the request
      const response = await gapi.client.drive.files.list({
        q: searchQuery,
        pageSize: limit,
        fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, createdTime, modifiedTime)',
        orderBy: 'modifiedTime desc'
      });
      
      // Process the response
      const files = response.result.files;
      
      if (files && files.length > 0) {
        return files.map(file => ({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          thumbnailLink: file.thumbnailLink,
          webContentLink: file.webContentLink,
          webViewLink: file.webViewLink,
          createdTime: file.createdTime,
          modifiedTime: file.modifiedTime,
          viewCount: Math.floor(Math.random() * 1000),
          likeCount: Math.floor(Math.random() * 100)
        }));
      } else {
        console.log('No files found for query:', query);
        return [];
      }
    } catch (error) {
      console.error('Error searching files:', error);
      return this.getDemoFiles(null, limit, 0, 'name', query);
    }
  }
  
  // Get file details
  async getFileDetails(fileId) {
    try {
      if (!this.isInitialized) {
        console.warn('API not initialized, using demo data');
        return this.getDemoFileDetails(fileId);
      }
      
      // Execute the request
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, thumbnailLink, webContentLink, webViewLink, createdTime, modifiedTime'
      });
      
      // Process the response
      const file = response.result;
      
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        thumbnailLink: file.thumbnailLink,
        webContentLink: file.webContentLink,
        webViewLink: file.webViewLink,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        viewCount: Math.floor(Math.random() * 1000),
        likeCount: Math.floor(Math.random() * 100)
      };
    } catch (error) {
      console.error('Error getting file details:', error);
      return this.getDemoFileDetails(fileId);
    }
  }
  
  // Extract folder ID from URL
  extractFolderId(url) {
    try {
      // Handle different URL formats
      if (url.includes('folders/')) {
        const match = url.match(/folders\/([^/?]+)/);
        return match ? match[1] : null;
      } else if (url.includes('id=')) {
        const match = url.match(/id=([^&]+)/);
        return match ? match[1] : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting folder ID:', error);
      return null;
    }
  }
  
  // Use demo data if API fails
  useDemoData() {
    console.log('Using demo data');
    this.isInitialized = true;
    this.isAuthenticated = true;
  }
  
  // Get demo files
  getDemoFiles(folderId, limit = 50, offset = 0, sortBy = 'name', searchQuery = null) {
    // Create demo files based on folder ID or search query
    const demoFiles = [];
    
    // Determine which demo files to return based on folder ID
    let category = 'all';
    if (folderId === this.folderIds.western) {
      category = 'western';
    } else if (folderId === this.folderIds.asian) {
      category = 'asian';
    } else if (folderId === this.folderIds.vietnam) {
      category = 'vietnam';
    } else if (folderId === this.folderIds.other) {
      category = 'other';
    }
    
    // Generate demo files
    for (let i = 1; i <= limit; i++) {
      const index = offset + i;
      let name = `${category}_${index}.jpg`;
      
      // Filter by search query if provided
      if (searchQuery && !name.includes(searchQuery)) {
        continue;
      }
      
      demoFiles.push({
        id: `${category}_${index}`,
        name: name,
        mimeType: 'image/jpeg',
        thumbnailLink: `https://via.placeholder.com/150?text=${name}`,
        webContentLink: `https://via.placeholder.com/800x600?text=${name}`,
        webViewLink: `https://via.placeholder.com/800x600?text=${name}`,
        createdTime: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        modifiedTime: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
        viewCount: Math.floor(Math.random() * 1000),
        likeCount: Math.floor(Math.random() * 100)
      });
    }
    
    // Sort the files
    switch (sortBy) {
      case 'newest':
        demoFiles.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
        break;
      case 'oldest':
        demoFiles.sort((a, b) => new Date(a.modifiedTime) - new Date(b.modifiedTime));
        break;
      case 'name':
        demoFiles.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        demoFiles.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    
    return demoFiles;
  }
  
  // Get demo file details
  getDemoFileDetails(fileId) {
    // Extract category and index from file ID
    const parts = fileId.split('_');
    const category = parts[0];
    const index = parts[1];
    
    return {
      id: fileId,
      name: `${category}_${index}.jpg`,
      mimeType: 'image/jpeg',
      thumbnailLink: `https://via.placeholder.com/150?text=${category}_${index}`,
      webContentLink: `https://via.placeholder.com/800x600?text=${category}_${index}`,
      webViewLink: `https://via.placeholder.com/800x600?text=${category}_${index}`,
      createdTime: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      modifiedTime: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      viewCount: Math.floor(Math.random() * 1000),
      likeCount: Math.floor(Math.random() * 100)
    };
  }
}

// Create and export Drive API instance
const driveApi = new DriveAPI();
window.driveApi = driveApi;
