// Save options to Chrome storage
function saveOptions() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const statusElement = document.getElementById('status');
  
  if (!apiKey) {
    statusElement.textContent = 'Please enter a valid API key.';
    statusElement.className = 'status error';
    return;
  }
  
  chrome.storage.sync.set({ apiKey }, () => {
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
  chrome.storage.sync.get('apiKey', (items) => {
    if (items.apiKey) {
      document.getElementById('apiKey').value = items.apiKey;
    }
  });
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveButton').addEventListener('click', saveOptions);