/**
 * Handlers for issue page actions
 */
import { updateButtonState } from '../ui/button.js';

/**
 * Adds issue-specific dropdown items to the menu
 * @param {HTMLElement} dropdownMenu The dropdown menu element
 * @param {Object} repoInfo Repository information
 */
export function addIssueDropdownItems(dropdownMenu, repoInfo) {
  // Add header
  const header = document.createElement('div');
  header.className = 'openhands-dropdown-header';
  header.textContent = 'Issue Actions';
  dropdownMenu.appendChild(header);
  
  // Investigate issue option
  const investigateItem = document.createElement('button');
  investigateItem.className = 'openhands-dropdown-item';
  investigateItem.textContent = `Investigate Issue #${repoInfo.issueNumber}`;
  investigateItem.addEventListener('click', () => {
    handleIssueLaunch(repoInfo, 'investigate');
  });
  dropdownMenu.appendChild(investigateItem);
  
  // Solve issue option
  const solveItem = document.createElement('button');
  solveItem.className = 'openhands-dropdown-item';
  solveItem.textContent = `Solve Issue #${repoInfo.issueNumber}`;
  solveItem.addEventListener('click', () => {
    handleIssueLaunch(repoInfo, 'solve');
  });
  dropdownMenu.appendChild(solveItem);
}

/**
 * Handles launching OpenHands for an issue
 * @param {Object} repoInfo Repository information
 * @param {string} action The action to perform (investigate, solve)
 */
export async function handleIssueLaunch(repoInfo, action = 'investigate') {
  try {
    // Get API key from storage
    const { apiKey } = await chrome.storage.sync.get('apiKey');
    
    if (!apiKey) {
      alert('Please set your OpenHands API key in the extension settings first.');
      chrome.runtime.sendMessage({ action: 'openOptions' });
      return;
    }
    
    // Show loading state
    updateButtonState('loading');
    
    // Create instruction based on the action
    let instruction = '';
    
    if (action === 'investigate') {
      instruction = `Please use the GitHub API to read issue #${repoInfo.issueNumber} in the ${repoInfo.fullRepo} repository (${repoInfo.url}).

After reading the issue description and any comments, please help me understand:
1. What problem is being reported
2. What are the potential causes of this issue
3. What parts of the codebase might be involved
4. What approaches could be taken to investigate further

Please do not start implementing a solution yet - just help me understand the issue thoroughly.`;
    } else if (action === 'solve') {
      instruction = `Please use the GitHub API to read issue #${repoInfo.issueNumber} in the ${repoInfo.fullRepo} repository (${repoInfo.url}).

After reading the issue description and any comments, please:
1. Analyze the issue to understand the root cause
2. Explore the relevant parts of the codebase
3. Propose a solution to fix the issue
4. Help me implement the solution with appropriate tests
5. Prepare a summary of the changes that could be used in a PR description

Let's work together to solve this issue completely.`;
    }
    
    // Send message to background script to make API request
    chrome.runtime.sendMessage({
      action: 'startConversation',
      data: {
        initial_user_msg: instruction,
        repository: repoInfo.fullRepo
      }
    }, response => {
      if (response.success) {
        updateButtonState('success');
        
        // If we have a conversation URL, open it in a new tab
        if (response.conversationUrl) {
          window.open(response.conversationUrl, '_blank');
        }
        
        // If we have a message (e.g., "Opened in new tab"), log it
        if (response.message) {
          console.log(response.message);
        }
      } else {
        updateButtonState('error');
        alert(`Error: ${response.error}`);
      }
    });
  } catch (error) {
    updateButtonState('error');
    console.error('Error launching OpenHands:', error);
  }
}