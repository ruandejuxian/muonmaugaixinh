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
      // For demo purposes, we'll just log the data
      console.log('Sending data to Google Sheet:', data);
      
      // In a real implementation, we would send a POST request to the Google Apps Script web app
      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, message: 'Data sent successfully' };
    } catch (error) {
      console.error('Error sending data to Google Sheet:', error);
      throw error;
    }
  }
  
  // Send data to pending sheet
  async sendToPendingSheet(data) {
    try {
      // Add sheet name to data
      data.sheetName = this.pendingSheetName;
      
      // Send to sheet
      return await this.sendToSheet(data);
    } catch (error) {
      console.error('Error sending data to pending sheet:', error);
      throw error;
    }
  }
}

// Create and export Sheets API instance
const sheetsApi = new SheetsAPI();
window.sheetsApi = sheetsApi;
