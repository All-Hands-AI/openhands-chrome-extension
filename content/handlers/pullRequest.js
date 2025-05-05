/**
 * Handlers for pull request page actions
 */
import { updateButtonState } from '../ui/button.js';
import { getPRForkInfo } from '../utils/githubInfo.js';
import { 
  checkForFailingActions, 
  checkForMergeConflicts, 
  checkForCodeReviewFeedback 
} from '../utils/statusChecks.js';

/**
 * Adds PR-specific dropdown items to the menu
 * @param {HTMLElement} dropdownMenu The dropdown menu element
 * @param {Object} repoInfo Repository information
 */
export function addPRDropdownItems(dropdownMenu, repoInfo) {
  // Add header
  const header = document.createElement('div');
  header.className = 'openhands-dropdown-header';
  header.textContent = 'Pull Request Actions';
  dropdownMenu.appendChild(header);
  
  // New conversation option
  const newConversationItem = document.createElement('button');
  newConversationItem.className = 'openhands-dropdown-item';
  newConversationItem.textContent = `New conversation for PR #${repoInfo.prNumber}`;
  newConversationItem.addEventListener('click', () => {
    handlePRLaunch(repoInfo);
  });
  dropdownMenu.appendChild(newConversationItem);
  
  // Check for failing GitHub actions
  checkForFailingActions().then(hasFailures => {
    if (hasFailures) {
      const fixActionsItem = document.createElement('button');
      fixActionsItem.className = 'openhands-dropdown-item';
      fixActionsItem.textContent = 'Fix failing GitHub actions';
      fixActionsItem.addEventListener('click', () => {
        handlePRLaunch(repoInfo, 'fix_actions');
      });
      dropdownMenu.appendChild(fixActionsItem);
    }
  });
  
  // Check for merge conflicts
  checkForMergeConflicts().then(hasConflicts => {
    if (hasConflicts) {
      const resolveConflictsItem = document.createElement('button');
      resolveConflictsItem.className = 'openhands-dropdown-item';
      resolveConflictsItem.textContent = 'Resolve merge conflicts';
      resolveConflictsItem.addEventListener('click', () => {
        handlePRLaunch(repoInfo, 'resolve_conflicts');
      });
      dropdownMenu.appendChild(resolveConflictsItem);
    }
  });
  
  // Check for code review feedback
  checkForCodeReviewFeedback().then(hasFeedback => {
    if (hasFeedback) {
      const addressFeedbackItem = document.createElement('button');
      addressFeedbackItem.className = 'openhands-dropdown-item';
      addressFeedbackItem.textContent = 'Address code review feedback';
      addressFeedbackItem.addEventListener('click', () => {
        handlePRLaunch(repoInfo, 'address_feedback');
      });
      dropdownMenu.appendChild(addressFeedbackItem);
    }
  });
}

/**
 * Handles launching OpenHands for a pull request
 * @param {Object} repoInfo Repository information
 * @param {string} action The action to perform (default, fix_actions, resolve_conflicts, address_feedback)
 */
export async function handlePRLaunch(repoInfo, action = 'default') {
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
    
    // Check if this PR is from a fork
    const forkInfo = getPRForkInfo();
    let repository = repoInfo.fullRepo;
    
    // If this is a PR from a fork, use the fork repository instead
    if (forkInfo) {
      console.log('PR is from a fork:', forkInfo);
      repository = forkInfo.fullRepo;
    }
    
    // Create instruction based on the action
    let instruction = `Please check the branch "${repoInfo.prBranch || 'the PR branch'}" and look at the diff against the main branch. This branch belongs to this PR "${repoInfo.url}".

Once you understand the purpose of the diff, please help me understand what this PR is trying to accomplish and await further instructions.`;
    
    switch (action) {
      case 'fix_actions':
        instruction = `Please check the branch "${repoInfo.prBranch || 'the PR branch'}" for PR ${repoInfo.url}, and run the failing GitHub Actions tests.

Help me fix these tests to pass. PLEASE DO NOT modify the tests by yourself -- Let me know if you think some of the tests are incorrect.`;
        break;
      case 'resolve_conflicts':
        instruction = `Please check the branch "${repoInfo.prBranch || 'the PR branch'}" for PR ${repoInfo.url}. This PR has merge conflicts with the main branch.

Please help me identify and resolve these merge conflicts so the PR can be merged cleanly.`;
        break;
      case 'address_feedback':
        instruction = `First, check the branch "${repoInfo.prBranch || 'the PR branch'}" and read the diff against the main branch to understand the purpose.

This branch corresponds to this PR ${repoInfo.url}

Next, you should use the GitHub API to read the reviews and comments on this PR and help me address them.`;
        break;
    }
    
    // Send message to background script to make API request
    chrome.runtime.sendMessage({
      action: 'startConversation',
      data: {
        initial_user_msg: instruction,
        repository: repository
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