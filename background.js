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
    
    // Use the streaming endpoint to wait for the conversation to be ready
    const response = await fetch(`${apiBaseUrl}/api/v1/app-conversations/stream-start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }
    
    // Read the full streamed JSON array of status updates
    const text = await response.text();
    const updates = JSON.parse(text);
    const lastUpdate = updates[updates.length - 1];
    
    if (!lastUpdate) {
      throw new Error('No response received from the streaming endpoint');
    }
    
    if (lastUpdate.status === 'ERROR') {
      throw new Error(lastUpdate.detail || 'Conversation failed to start');
    }
    
    const conversationId = lastUpdate.app_conversation_id || lastUpdate.id;
    return {
      success: true,
      conversationId: conversationId,
      conversationUrl: `${apiBaseUrl}/conversations/${conversationId}`
    };
  } catch (error) {
    console.error('Error starting OpenHands conversation:', error);
    
    // If there's a CORS error, we'll provide a more helpful error message
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      // Set a flag that we've had CORS errors
      chrome.storage.local.set({ hadCorsError: true });
      
      return {
        success: false,
        error: 'CORS error: Unable to connect to OpenHands API directly from the extension due to browser security restrictions.'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}