// Main entry point for the content script
import { detectPageType } from './utils/pageDetection.js';
import { addOpenHandsButton } from './ui/button.js';

// Initialize the extension when the DOM is fully loaded
function initialize() {
  // Add the OpenHands button to the page
  addOpenHandsButton();
}

// Run the initialization when the page is loaded
document.addEventListener('DOMContentLoaded', initialize);

// Also run on navigation within GitHub (for SPA behavior)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(initialize, 500); // Small delay to ensure DOM is updated
  }
}).observe(document, { subtree: true, childList: true });

// Initial run
initialize();