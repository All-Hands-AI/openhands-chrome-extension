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
    
    // Load any previously saved custom instructions
    const customInstructionsField = document.getElementById('customInstructions');
    
    // Determine which type of page we're on (repo, PR, or issue)
    const pathParts = new URL(currentUrl).pathname.split('/').filter(part => part.length > 0);
    let storageKey = 'openhandsCustomInput'; // Default for repos
    
    if (pathParts.includes('pull')) {
      storageKey = 'openhandsPRCustomInput';
    } else if (pathParts.includes('issues') && pathParts.length > 3) {
      storageKey = 'openhandsIssueCustomInput';
    }
    
    // Load saved text from localStorage
    const savedText = localStorage.getItem(storageKey);
    if (savedText) {
      customInstructionsField.value = savedText;
    }
    
    // Save text as user types
    customInstructionsField.addEventListener('input', () => {
      localStorage.setItem(storageKey, customInstructionsField.value);
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

// Save custom instructions when save button is clicked
document.getElementById('saveButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    const pathParts = new URL(currentUrl).pathname.split('/').filter(part => part.length > 0);
    let storageKey = 'openhandsCustomInput'; // Default for repos
    
    if (pathParts.includes('pull')) {
      storageKey = 'openhandsPRCustomInput';
    } else if (pathParts.includes('issues') && pathParts.length > 3) {
      storageKey = 'openhandsIssueCustomInput';
    }
    
    const customInstructions = document.getElementById('customInstructions').value;
    localStorage.setItem(storageKey, customInstructions);
    
    // Show a brief "Saved" message
    const saveButton = document.getElementById('saveButton');
    saveButton.textContent = 'Saved!';
    setTimeout(() => {
      saveButton.textContent = 'Save';
    }, 1500);
  });
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
    
    // Get custom instructions if provided
    const customInstructions = document.getElementById('customInstructions').value;
    
    // Execute content script function to launch OpenHands
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: (customInstructions) => {
        // If custom instructions are provided, find the input field and fill it
        if (customInstructions && customInstructions.trim() !== '') {
          // Store the custom instructions in session storage
          sessionStorage.setItem('openhandsCustomInstructions', customInstructions);
          
          // Find and click the OpenHands button if it exists
          const button = document.querySelector('.openhands-dropdown-toggle');
          if (button) {
            button.click();
            
            // Wait for the dropdown to appear
            setTimeout(() => {
              // Find the custom input field and fill it
              const customInput = document.querySelector('.openhands-custom-input');
              if (customInput) {
                customInput.value = customInstructions;
                
                // Click the submit button
                const submitButton = document.querySelector('.openhands-submit-button');
                if (submitButton) {
                  submitButton.click();
                  return true;
                }
              }
            }, 100);
            
            return true;
          }
        } else {
          // No custom instructions, just click the button
          const button = document.querySelector('.openhands-dropdown-toggle');
          if (button) {
            button.click();
            return true;
          }
        }
        
        return false;
      },
      args: [customInstructions]
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