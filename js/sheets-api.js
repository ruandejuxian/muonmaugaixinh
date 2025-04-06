// Google Sheets API integration
class SheetsAPI {
  constructor() {
    this.scriptUrl = CONFIG.sheetsApi.scriptUrl;
    this.sheetId = CONFIG.sheetsApi.sheetId;
    this.pendingSheetName = CONFIG.sheetsApi.pendingSheetName;
  }
  
  // Send data to Google Sheet
  async sendToSheet(data) {
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('action', 'addData');
      formData.append('sheetId', this.sheetId);
      formData.append('data', JSON.stringify(data));
      
      // Send request
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        body: formData
      });
      
      // Check response
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }
      
      return result;
    } catch (error) {
      console.error('Error sending to Google Sheet:', error);
      throw error;
    }
  }
  
  // Send data to pending sheet
  async sendToPendingSheet(data) {
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('action', 'addToPending');
      formData.append('sheetId', this.sheetId);
      formData.append('sheetName', this.pendingSheetName);
      formData.append('data', JSON.stringify(data));
      
      // Send request
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        body: formData
      });
      
      // Check response
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }
      
      return result;
    } catch (error) {
      console.error('Error sending to pending sheet:', error);
      throw error;
    }
  }
}

// Create and export Sheets API instance
const sheetsApi = new SheetsAPI();
window.sheetsApi = sheetsApi;
