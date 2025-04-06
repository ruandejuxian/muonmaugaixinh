// Model information management
class ModelInfo {
  constructor() {
    this.models = {};
    this.loadModels();
  }
  
  // Load models from localStorage or initialize with defaults
  loadModels() {
    const storedModels = localStorage.getItem('modelInfo');
    if (storedModels) {
      this.models = JSON.parse(storedModels);
    } else {
      // Initialize with some default model info for sample images
      this.initializeDefaultModels();
    }
  }
  
  // Initialize with default models
  initializeDefaultModels() {
    // Sample models for demo images
    const defaultModels = {
      'western_1': {
        name: 'Emma Watson',
        instagram: 'https://www.instagram.com/emmawatson',
        facebook: 'https://www.facebook.com/emmawatson',
        twitter: 'https://twitter.com/emmawatson'
      },
      'western_2': {
        name: 'Scarlett Johansson',
        instagram: 'https://www.instagram.com/scarlettjohansson',
        facebook: 'https://www.facebook.com/scarlett'
      },
      'asian_1': {
        name: 'Lisa Manoban',
        instagram: 'https://www.instagram.com/lalalalisa_m',
        facebook: 'https://www.facebook.com/lisa'
      },
      'vietnam_1': {
        name: 'Ngọc Trinh',
        instagram: 'https://www.instagram.com/ngoctrinh',
        facebook: 'https://www.facebook.com/ngoctrinh'
      }
    };
    
    this.models = defaultModels;
    this.saveModels();
  }
  
  // Get model info by image ID
  getModel(imageId) {
    return this.models[imageId] || null;
  }
  
  // Add or update model info
  setModel(imageId, modelInfo) {
    this.models[imageId] = modelInfo;
    this.saveModels();
  }
  
  // Remove model info
  removeModel(imageId) {
    if (this.models[imageId]) {
      delete this.models[imageId];
      this.saveModels();
    }
  }
  
  // Save models to localStorage
  saveModels() {
    localStorage.setItem('modelInfo', JSON.stringify(this.models));
  }
  
  // Get all models
  getAllModels() {
    return this.models;
  }
  
  // Search models by name
  searchModelsByName(name) {
    const searchTerm = name.toLowerCase();
    const results = {};
    
    Object.keys(this.models).forEach(imageId => {
      const model = this.models[imageId];
      if (model.name && model.name.toLowerCase().includes(searchTerm)) {
        results[imageId] = model;
      }
    });
    
    return results;
  }
}

// Create and export model info instance
const modelInfo = new ModelInfo();
window.modelInfo = modelInfo;
