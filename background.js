/**
 * Background service worker for Flash Drill extension
 * Handles extension lifecycle and background tasks
 */

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Flash Drill extension installed:', details.reason);
  
  // Initialize default storage data
  if (details.reason === 'install') {
    initializeDefaultData();
  }
});

// Extension startup handler
chrome.runtime.onStartup.addListener(() => {
  console.log('Flash Drill extension started');
});

// Message handling from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'GET_STORAGE_DATA':
      handleGetStorageData(message.key, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'SET_STORAGE_DATA':
      handleSetStorageData(message.key, message.data, sendResponse);
      return true;
      
    case 'GET_ACTIVE_TAB':
      handleGetActiveTab(sendResponse);
      return true;
      
    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

/**
 * Initialize default extension data
 */
async function initializeDefaultData() {
  try {
    const defaultData = {
      cards: [],
      settings: {
        autoSave: true,
        theme: 'light',
        notifications: true
      },
      stats: {
        totalCards: 0,
        totalReviews: 0,
        lastStudyDate: null
      }
    };
    
    await chrome.storage.local.set(defaultData);
    console.log('Default data initialized');
  } catch (error) {
    console.error('Failed to initialize default data:', error);
  }
}

/**
 * Handle getting storage data
 */
async function handleGetStorageData(key, sendResponse) {
  try {
    const result = await chrome.storage.local.get(key);
    sendResponse({ success: true, data: result[key] });
  } catch (error) {
    console.error('Error getting storage data:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle setting storage data
 */
async function handleSetStorageData(key, data, sendResponse) {
  try {
    await chrome.storage.local.set({ [key]: data });
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error setting storage data:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle getting active tab information
 */
async function handleGetActiveTab(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    sendResponse({ success: true, tab });
  } catch (error) {
    console.error('Error getting active tab:', error);
    sendResponse({ success: false, error: error.message });
  }
} 