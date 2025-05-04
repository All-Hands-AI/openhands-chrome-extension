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

// Function to start a conversation using the OpenHands API
async function startOpenHandsConversation(data) {
  try {
    // Get API key from storage
    const { apiKey } = await chrome.storage.sync.get('apiKey');
    
    if (!apiKey) {
      throw new Error('API key not found. Please set it in the extension options.');
    }
    
    // Make API request to OpenHands
    const response = await fetch('https://app.all-hands.dev/api/conversations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      conversationId: result.conversation_id,
      conversationUrl: `https://app.all-hands.dev/conversations/${result.conversation_id}`
    };
  } catch (error) {
    console.error('Error starting OpenHands conversation:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}