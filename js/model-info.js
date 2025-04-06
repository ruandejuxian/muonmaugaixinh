// Model information for displaying on hover
class ModelInfo {
  constructor() {
    this.models = {};
    this.init();
  }
  
  init() {
    // Initialize with some default model information
    // In a real application, this would be loaded from a database or API
    this.addModel('western_1', 'Emma Watson', 'https://www.instagram.com/emmawatson/', 'https://www.facebook.com/emmawatson', 'https://twitter.com/emmawatson');
    this.addModel('western_2', 'Scarlett Johansson', 'https://www.instagram.com/scarlettjohansson_/', null, null);
    this.addModel('western_3', 'Margot Robbie', 'https://www.instagram.com/margotrobbie/', 'https://www.facebook.com/margotrobbie', null);
    this.addModel('western_4', 'Gal Gadot', 'https://www.instagram.com/gal_gadot/', 'https://www.facebook.com/GalGadot', 'https://twitter.com/GalGadot');
    
    this.addModel('asian_1', 'Lisa Manoban', 'https://www.instagram.com/lalalalisa_m/', null, null);
    this.addModel('asian_2', 'Tzuyu', 'https://www.instagram.com/tzuyu.twice/', null, null);
    this.addModel('asian_3', 'Jennie Kim', 'https://www.instagram.com/jennierubyjane/', null, null);
    this.addModel('asian_4', 'Suzy Bae', 'https://www.instagram.com/skuukzky/', 'https://www.facebook.com/suzybae', null);
    
    this.addModel('vietnam_1', 'Ngọc Trinh', 'https://www.instagram.com/ngoctrinh89/', 'https://www.facebook.com/ngoctrinhfashion89', null);
    this.addModel('vietnam_2', 'Chi Pu', 'https://www.instagram.com/chipupu/', 'https://www.facebook.com/chipupu88', null);
    this.addModel('vietnam_3', 'Ninh Dương Lan Ngọc', 'https://www.instagram.com/ninh_duong_lan_ngoc/', 'https://www.facebook.com/ninhduonglanngoc', null);
    this.addModel('vietnam_4', 'Hoàng Thùy Linh', 'https://www.instagram.com/hoangthuylinhofficial/', 'https://www.facebook.com/hoangthuylinh.official', null);
  }
  
  // Add a model to the collection
  addModel(id, name, instagram = null, facebook = null, twitter = null) {
    this.models[id] = {
      id: id,
      name: name,
      instagram: instagram,
      facebook: facebook,
      twitter: twitter
    };
  }
  
  // Get model information by ID
  getModel(id) {
    // Try to match by exact ID first
    if (this.models[id]) {
      return this.models[id];
    }
    
    // Try to match by prefix (category_number)
    const parts = id.split('_');
    if (parts.length >= 2) {
      const category = parts[0];
      const number = parseInt(parts[1]);
      
      // Try to find a matching model
      const matchingId = Object.keys(this.models).find(modelId => {
        const modelParts = modelId.split('_');
        return modelParts[0] === category && parseInt(modelParts[1]) === number;
      });
      
      if (matchingId) {
        return this.models[matchingId];
      }
    }
    
    // Try to match by filename
    for (const modelId in this.models) {
      if (id.includes(modelId) || id.toLowerCase().includes(this.models[modelId].name.toLowerCase())) {
        return this.models[modelId];
      }
    }
    
    // If no match found, extract potential model name from filename
    const fileName = this.extractFileNameFromId(id);
    if (fileName) {
      // Create a temporary model object
      return {
        id: id,
        name: this.formatModelName(fileName),
        instagram: null,
        facebook: null,
        twitter: null
      };
    }
    
    // Return null if no match found
    return null;
  }
  
  // Extract file name from ID
  extractFileNameFromId(id) {
    // Remove file extension if present
    const parts = id.split('.');
    if (parts.length > 1) {
      parts.pop(); // Remove extension
    }
    
    // Join remaining parts
    return parts.join('.');
  }
  
  // Format model name from file name
  formatModelName(fileName) {
    // Replace underscores and hyphens with spaces
    let name = fileName.replace(/[_-]/g, ' ');
    
    // Capitalize first letter of each word
    name = name.replace(/\b\w/g, l => l.toUpperCase());
    
    return name;
  }
}

// Create and export model info instance
const modelInfo = new ModelInfo();
window.modelInfo = modelInfo;
