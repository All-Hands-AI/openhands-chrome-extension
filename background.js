// Background script for OpenHands GitHub Launcher

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startConversation') {
    startOpenHandsConversation(message.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates we'll respond asynchronously
  } else if (message.action === 'openOptions') {
    chrome.runtime.openOptionsPage();
  }
});

// Default base URL if not set in options
const DEFAULT_BASE_URL = 'https://app.all-hands.dev';

// Function to start a conversation using the OpenHands API
async function startOpenHandsConversation(data) {
  try {
    // Get API key and base URL from storage
    const { apiKey, baseUrl } = await chrome.storage.sync.get(['apiKey', 'baseUrl']);
    
    if (!apiKey) {
      throw new Error('API key not found. Please set it in the extension options.');
    }
    
    // Use the configured base URL or default if not set
    const apiBaseUrl = baseUrl || DEFAULT_BASE_URL;
    
    // Instead of making a direct API call, redirect to a web page that will handle the API request
    // This avoids CORS issues by letting the web app make the API call instead of the extension
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const redirectUrl = `${apiBaseUrl}/api/extension/launch?data=${encodedData}&key=${apiKey}`;
    
    // Open the URL in a new tab
    chrome.tabs.create({ url: redirectUrl });
    
    return {
      success: true,
      message: 'Redirecting to OpenHands...'
    };
  } catch (error) {
    console.error('Error starting OpenHands conversation:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}