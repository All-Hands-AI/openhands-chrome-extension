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
    
    try {
      // First try with regular CORS mode
      const response = await fetch('https://app.all-hands.dev/api/conversations', {
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
          // If we can't parse the JSON, just use the HTTP error
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      return {
        success: true,
        conversationId: result.conversation_id,
        conversationUrl: `https://app.all-hands.dev/conversations/${result.conversation_id}`
      };
    } catch (error) {
      // If there's a CORS error, we'll try to open the conversation in a new tab instead
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        console.log('CORS issue detected, opening conversation in new tab');
        
        // Open the OpenHands website in a new tab
        const newTabUrl = 'https://app.all-hands.dev/new-conversation?' + 
          new URLSearchParams({
            repo: data.repository,
            branch: data.branch || 'main',
            instruction: data.initial_user_msg || ''
          }).toString();
        
        chrome.tabs.create({ url: newTabUrl });
        
        return {
          success: true,
          message: 'Opened conversation in new tab due to CORS restrictions'
        };
      }
      
      // For other errors, just propagate them
      throw error;
    }
    
    // This code is unreachable due to the try/catch block above
    // Keeping it commented for reference
    /*return {
      success: true,
      conversationId: result.conversation_id,
      conversationUrl: `https://app.all-hands.dev/conversations/${result.conversation_id}`
    };*/
  } catch (error) {
    console.error('Error starting OpenHands conversation:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}