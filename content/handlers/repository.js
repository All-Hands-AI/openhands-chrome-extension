/**
 * Handlers for repository page actions
 */
import { updateButtonState } from '../ui/button.js';
import { checkFileExists } from '../utils/statusChecks.js';

/**
 * Adds repository-specific dropdown items to the menu
 * @param {HTMLElement} dropdownMenu The dropdown menu element
 * @param {Object} repoInfo Repository information
 */
export function addRepoDropdownItems(dropdownMenu, repoInfo) {
  // Add header
  const header = document.createElement('div');
  header.className = 'openhands-dropdown-header';
  header.textContent = 'Repository Actions';
  dropdownMenu.appendChild(header);
  
  // New conversation option
  const newConversationItem = document.createElement('button');
  newConversationItem.className = 'openhands-dropdown-item';
  newConversationItem.textContent = `New conversation for ${repoInfo.fullRepo}`;
  newConversationItem.addEventListener('click', () => {
    handleRepoLaunch(repoInfo);
  });
  dropdownMenu.appendChild(newConversationItem);
  
  // Learn about codebase option
  const learnCodebaseItem = document.createElement('button');
  learnCodebaseItem.className = 'openhands-dropdown-item';
  learnCodebaseItem.textContent = 'Learn about this codebase';
  learnCodebaseItem.addEventListener('click', () => {
    handleRepoLaunch(repoInfo, 'learn');
  });
  dropdownMenu.appendChild(learnCodebaseItem);
  
  // Check if repo.md exists
  checkFileExists(repoInfo, 'repo.md').then(exists => {
    if (!exists) {
      const addRepoMdItem = document.createElement('button');
      addRepoMdItem.className = 'openhands-dropdown-item';
      addRepoMdItem.textContent = 'Add a repo.md microagent';
      addRepoMdItem.addEventListener('click', () => {
        handleRepoLaunch(repoInfo, 'add_repo_md');
      });
      dropdownMenu.appendChild(addRepoMdItem);
    }
  });
  
  // Check if setup.sh exists
  checkFileExists(repoInfo, 'setup.sh').then(exists => {
    if (!exists) {
      const addSetupShItem = document.createElement('button');
      addSetupShItem.className = 'openhands-dropdown-item';
      addSetupShItem.textContent = 'Add setup.sh';
      addSetupShItem.addEventListener('click', () => {
        handleRepoLaunch(repoInfo, 'add_setup_sh');
      });
      dropdownMenu.appendChild(addSetupShItem);
    }
  });
}

/**
 * Handles launching OpenHands for a repository
 * @param {Object} repoInfo Repository information
 * @param {string} action The action to perform (default, learn, add_repo_md, add_setup_sh)
 */
export async function handleRepoLaunch(repoInfo, action = 'default') {
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
    
    // Prepare the initial message based on the action
    let initialMessage = `I've launched OpenHands for the ${repoInfo.fullRepo} repository. Please ask what task I'd like to perform.`;
    
    switch (action) {
      case 'learn':
        initialMessage = `I'd like to learn about the ${repoInfo.fullRepo} codebase. Please browse the repository, look at the documentation and relevant code, and help me understand its structure, main components, and how they work together.`;
        break;
      case 'add_repo_md':
        initialMessage = `Please browse the ${repoInfo.fullRepo} repository, look at the documentation and relevant code, and understand the purpose of this repository.

Specifically, I want you to create a \`.openhands/microagents/repo.md\` file. This file should contain succinct information that summarizes (1) the purpose of this repository, (2) the general setup of this repo, and (3) a brief description of the structure of this repo.

Read all the GitHub workflows under .github/ of the repository (if this folder exists) to understand the CI checks (e.g., linter, pre-commit), and include those in the repo.md file.`;
        break;
      case 'add_setup_sh':
        initialMessage = `I'd like you to create a setup.sh script for the ${repoInfo.fullRepo} repository. Please analyze the repository to understand its dependencies and requirements, then create a comprehensive setup script that automates the environment setup process. The script should handle installing dependencies, setting up configuration, and any other necessary steps to get the repository running.`;
        break;
    }
    
    // Send message to background script to make API request
    chrome.runtime.sendMessage({
      action: 'startConversation',
      data: {
        initial_user_msg: initialMessage,
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