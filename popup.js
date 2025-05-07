// Check if we're on a GitHub page
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentUrl = tabs[0].url;
  const isGitHub = currentUrl.startsWith('https://github.com/');
  
  // Show appropriate content based on whether we're on GitHub
  document.getElementById('notGitHub').style.display = isGitHub ? 'none' : 'block';
  document.getElementById('gitHubContent').style.display = isGitHub ? 'block' : 'none';
  
  if (isGitHub) {
    // Check if API key is set
    chrome.storage.sync.get('apiKey', (items) => {
      if (!items.apiKey) {
        document.getElementById('status').textContent = 'Please set your API key in the settings first.';
        document.getElementById('launchButton').disabled = true;
      }
    });
    
    // Check if we've had CORS errors before
    chrome.storage.local.get('hadCorsError', (items) => {
      if (items.hadCorsError) {
        document.getElementById('corsError').style.display = 'block';
      }
    });
    
    // Set up the direct website link with configurable base URL
    document.getElementById('openWebsiteButton').addEventListener('click', () => {
      // Get the base URL from storage or use default
      chrome.storage.sync.get('baseUrl', (items) => {
        const baseUrl = items.baseUrl || 'https://app.all-hands.dev';
        chrome.tabs.create({ url: baseUrl });
      });
    });
  }
});

// Open settings page when settings button is clicked
document.getElementById('settingsButton').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Also open settings page when settings link is clicked
document.getElementById('settingsLink').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Launch OpenHands when launch button is clicked
document.getElementById('launchButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const statusElement = document.getElementById('status');
    statusElement.textContent = 'Launching...';
    
    // Execute content script function to launch OpenHands
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => {
        // Find and click the OpenHands button if it exists
        const button = document.querySelector('.openhands-dropdown-toggle');
        if (button) {
          button.click();
          return true;
        }
        
        return false;
      }
    }, (results) => {
      if (results && results[0] && results[0].result) {
        statusElement.textContent = 'Launched successfully!';
        // Close popup after a short delay
        setTimeout(() => window.close(), 1500);
      } else {
        statusElement.textContent = 'Button not found on this page.';
      }
    });
  });
});