// Model information handling
class ModelInfo {
  constructor() {
    this.models = {};
    this.categories = {
      'western': 'Gái Âu Mỹ',
      'asian': 'Gái Châu Á',
      'vietnam': 'Gái Việt',
      'other': 'Nơi Khác'
    };
  }
  
  // Add model information
  addModel(imageId, modelData) {
    this.models[imageId] = modelData;
  }
  
  // Get model information
  getModel(imageId) {
    return this.models[imageId] || null;
  }
  
  // Get category name
  getCategoryName(categoryKey) {
    return this.categories[categoryKey] || 'Khác';
  }
  
  // Load models from API or local storage
  loadModels() {
    // This would typically load from an API
    // For now, we'll use a placeholder
    console.log('Loading model information...');
    
    // Example: Load from localStorage if available
    const savedModels = localStorage.getItem('modelInfo');
    if (savedModels) {
      try {
        this.models = JSON.parse(savedModels);
        console.log('Loaded model information from localStorage');
      } catch (error) {
        console.error('Error parsing saved model information:', error);
      }
    }
  }
  
  // Save models to local storage
  saveModels() {
    try {
      localStorage.setItem('modelInfo', JSON.stringify(this.models));
      console.log('Saved model information to localStorage');
    } catch (error) {
      console.error('Error saving model information:', error);
    }
  }
}

// Create and export model info instance
const modelInfo = new ModelInfo();

// Initialize model info when page loads
document.addEventListener('DOMContentLoaded', function() {
  modelInfo.loadModels();
});
