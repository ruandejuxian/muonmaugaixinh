// Google Sheets API integration
class SheetsAPI {
  constructor() {
    this.scriptUrl = CONFIG.sheetsApi.scriptUrl;
    this.sheetId = CONFIG.sheetsApi.sheetId;
  }

  // Send selected images to Google Sheet
  async sendToSheet(images) {
    try {
      const formattedData = images.map(img => ({
        imageUrl: img.url,
        note: img.note || '',
        timestamp: new Date().toISOString()
      }));

      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'appendData',
          sheetId: this.sheetId,
          data: formattedData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending data to Google Sheet:', error);
      throw error;
    }
  }

  // Send upload data to pending sheet
  async sendToPendingSheet(data) {
    try {
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'appendToPendingSheet',
          sheetId: this.sheetId,
          pendingSheetName: CONFIG.sheetsApi.pendingSheetName,
          data: data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending data to pending sheet:', error);
      throw error;
    }
  }
}

// Create and export Sheets API instance
const sheetsApi = new SheetsAPI();
