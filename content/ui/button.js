/**
 * UI components for the OpenHands button and dropdown
 */
import { detectPageType, findButtonContainer } from '../utils/pageDetection.js';
import { getRepositoryInfo } from '../utils/githubInfo.js';
import { addRepoDropdownItems } from '../handlers/repository.js';
import { addPRDropdownItems } from '../handlers/pullRequest.js';
import { addIssueDropdownItems } from '../handlers/issue.js';
import { handleRepoLaunch } from '../handlers/repository.js';
import { handlePRLaunch } from '../handlers/pullRequest.js';
import { handleIssueLaunch } from '../handlers/issue.js';

/**
 * Adds the OpenHands button to the GitHub page
 */
export function addOpenHandsButton() {
  const { isRepoPage, isPRPage, isIssuePage, isSupported } = detectPageType();
  
  if (!isSupported) return;
  
  // Remove any existing OpenHands buttons to avoid duplicates
  const existingButtons = document.querySelectorAll('.openhands-list-item');
  existingButtons.forEach(button => button.remove());
  
  // Find the container where we want to add our button
  const container = findButtonContainer();
  if (!container) return;
  
  // Get repository information
  const repoInfo = getRepositoryInfo();
  
  // Create our dropdown
  const listItem = document.createElement('li');
  listItem.className = 'openhands-list-item';
  
  const dropdownContainer = document.createElement('div');
  dropdownContainer.className = 'openhands-dropdown';
  
  // Create the main button
  const mainButton = document.createElement('button');
  mainButton.className = 'openhands-dropdown-toggle';
  mainButton.innerHTML = '<img src="' + chrome.runtime.getURL('images/openhands-logo.svg') + '" class="openhands-logo" alt="OpenHands Logo"><span>Launch with OpenHands</span>';
  mainButton.title = 'Start an OpenHands conversation';
  
  // Create the dropdown toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'openhands-dropdown-caret';
  toggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"></path></svg>';
  toggleButton.title = 'Show options';
  
  // Create the dropdown menu
  const dropdownMenu = document.createElement('div');
  dropdownMenu.className = 'openhands-dropdown-menu';
  
  // Add dropdown menu items based on page type
  if (isRepoPage) {
    addRepoDropdownItems(dropdownMenu, repoInfo);
  } else if (isPRPage) {
    addPRDropdownItems(dropdownMenu, repoInfo);
  } else if (isIssuePage) {
    addIssueDropdownItems(dropdownMenu, repoInfo);
  }
  
  // Add click event listeners
  mainButton.addEventListener('click', async () => {
    // Default action when clicking the main button
    if (isPRPage) {
      handlePRLaunch(repoInfo);
    } else if (isIssuePage) {
      // Default action for issues is to investigate
      handleIssueLaunch(repoInfo, 'investigate');
    } else {
      handleRepoLaunch(repoInfo);
    }
  });
  
  // Toggle dropdown on click
  toggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownContainer.contains(e.target)) {
      dropdownMenu.classList.remove('show');
    }
  });
  
  // Assemble the dropdown
  dropdownContainer.appendChild(mainButton);
  dropdownContainer.appendChild(toggleButton);
  dropdownContainer.appendChild(dropdownMenu);
  listItem.appendChild(dropdownContainer);
  container.appendChild(listItem);
}

/**
 * Updates the button state (loading, success, error)
 * @param {string} state The state to update to ('loading', 'success', 'error')
 */
export function updateButtonState(state) {
  const button = document.querySelector('.openhands-dropdown-toggle');
  if (!button) return;
  
  // Get logo HTML
  const logoHTML = '<img src="' + chrome.runtime.getURL('images/openhands-logo.svg') + '" class="openhands-logo" alt="OpenHands Logo">';
  
  if (state === 'loading') {
    button.classList.add('loading');
    button.innerHTML = `${logoHTML}<span>Loading...</span>`;
  } else if (state === 'success') {
    button.classList.remove('loading');
    button.classList.add('success');
    button.innerHTML = `${logoHTML}<span>Opened in new tab</span>`;
    
    // Reset after 3 seconds
    setTimeout(() => {
      button.classList.remove('success');
      button.innerHTML = `${logoHTML}<span>Launch with OpenHands</span>`;
    }, 3000);
  } else if (state === 'error') {
    button.classList.add('error');
    button.innerHTML = `${logoHTML}<span>Error</span>`;
    
    // Reset after 3 seconds
    setTimeout(() => {
      button.classList.remove('error');
      button.innerHTML = `${logoHTML}<span>Launch with OpenHands</span>`;
    }, 3000);
  }
}