/**
 * API communication utilities
 */

/**
 * Starts a new OpenHands conversation
 * @param {Object} data Conversation data
 * @param {string} data.initial_user_msg Initial user message
 * @param {string} data.repository Repository name (owner/repo)
 * @returns {Promise<Object>} Promise resolving to the API response
 */
export async function startConversation(data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: 'startConversation',
      data
    }, response => {
      if (response.success) {
        resolve(response);
      } else {
        reject(new Error(response.error || 'Unknown error'));
      }
    });
  });
}

/**
 * Opens the extension options page
 * @returns {Promise<void>} Promise resolving when the options page is opened
 */
export async function openOptions() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'openOptions' }, () => {
      resolve();
    });
  });
}