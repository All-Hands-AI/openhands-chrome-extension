// Default base URL
const DEFAULT_BASE_URL = 'https://app.all-hands.dev';

// Save options to Chrome storage
function saveOptions() {
  const apiKey = document.getElementById('apiKey').value.trim();
  let baseUrl = document.getElementById('baseUrl').value.trim();
  const statusElement = document.getElementById('status');
  
  if (!apiKey) {
    statusElement.textContent = 'Please enter a valid API key.';
    statusElement.className = 'status error';
    return;
  }
  
  // If no base URL is provided, use the default
  if (!baseUrl) {
    baseUrl = DEFAULT_BASE_URL;
  }
  
  // Ensure the base URL doesn't end with a slash
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  chrome.storage.sync.set({ apiKey, baseUrl }, () => {
    // Update status to let user know options were saved
    statusElement.textContent = 'Settings saved successfully!';
    statusElement.className = 'status success';
    
    // Hide status message after 3 seconds
    setTimeout(() => {
      statusElement.className = 'status';
    }, 3000);
  });
}

// Restore options from Chrome storage
function restoreOptions() {
  chrome.storage.sync.get(['apiKey', 'baseUrl'], (items) => {
    if (items.apiKey) {
      document.getElementById('apiKey').value = items.apiKey;
    }
    
    if (items.baseUrl) {
      document.getElementById('baseUrl').value = items.baseUrl;
    } else {
      document.getElementById('baseUrl').placeholder = DEFAULT_BASE_URL;
    }
  });
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveButton').addEventListener('click', saveOptions);