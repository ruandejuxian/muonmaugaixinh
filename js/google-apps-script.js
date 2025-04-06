// Google Apps Script code for handling data from the website
// This code should be deployed as a web app in Google Apps Script

// Global variables
const SHEET_ID = '1yU_sBq7OiupRiXK_AqbhUERlN-V79JKeDCxbf2qvAFU'; // Replace with your actual Sheet ID
const MAIN_SHEET_NAME = 'Danh sách ảnh';
const PENDING_SHEET_NAME = 'Chưa duyệt';

// Main function that handles POST requests
function doPost(e) {
  try {
    // Parse the request data
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    
    // Route to the appropriate handler based on the action
    switch (action) {
      case 'appendData':
        result = appendData(data.sheetId || SHEET_ID, data.data);
        break;
      case 'appendToPendingSheet':
        result = appendToPendingSheet(data.sheetId || SHEET_ID, data.pendingSheetName || PENDING_SHEET_NAME, data.data);
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      result: result
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to handle GET requests (for testing)
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'API is working!'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Append data to the main sheet
function appendData(sheetId, data) {
  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName(MAIN_SHEET_NAME) || ss.getSheets()[0];
  
  // Prepare rows to append
  const rows = data.map(item => [
    new Date(), // Timestamp
    item.imageUrl, // Image URL
    item.note || '', // Note
    '' // Reserved for admin notes
  ]);
  
  // Append rows
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    rowsAdded: rows.length
  };
}

// Append data to the pending sheet
function appendToPendingSheet(sheetId, pendingSheetName, data) {
  const ss = SpreadsheetApp.openById(sheetId);
  let sheet = ss.getSheetByName(pendingSheetName);
  
  // Create the pending sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(pendingSheetName);
    // Add headers
    sheet.getRange(1, 1, 1, 7).setValues([
      ['Thời gian', 'Danh mục', 'Tên người mẫu', 'Liên kết mạng xã hội', 'Tên người gửi', 'Tên file', 'Trạng thái']
    ]);
    sheet.setFrozenRows(1);
  }
  
  // Prepare row to append
  const row = [
    new Date(), // Timestamp
    data.category || '', // Category
    data.modelName || '', // Model name
    data.socialLink || '', // Social link
    data.senderName || '', // Sender name
    data.fileNames || '', // File names
    'Chưa duyệt' // Status
  ];
  
  // Append row
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
  
  return {
    rowAdded: true,
    sheetName: pendingSheetName
  };
}

// Helper function to get sheet by name or create it
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  return sheet;
}
