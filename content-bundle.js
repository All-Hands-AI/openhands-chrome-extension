// Bundled content script for the OpenHands Chrome extension
// This file combines all the module functionality into a single file to avoid module loading issues

// Utility functions to detect the type of GitHub page
function detectPageType() {
  const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);

  const isRepoPage = pathParts.length === 2 ||
                     (pathParts.length > 2 &&
                      !pathParts.includes('pull') &&
                      !pathParts.includes('issues'));

  const isPRPage = pathParts.includes('pull');

  const isIssuePage = pathParts.includes('issues') && pathParts.length > 3; // Make sure it's a specific issue

  return {
    isRepoPage,
    isPRPage,
    isIssuePage,
    isSupported: isRepoPage || isPRPage || isIssuePage
  };
}

// Finds the appropriate container for the OpenHands button based on page type
function findButtonContainer() {
  const { isRepoPage, isPRPage, isIssuePage } = detectPageType();

  let container = null;

  if (isRepoPage) {
    // For repository pages, find the container with repository actions
    container = document.querySelector('ul.pagehead-actions');
  } else if (isPRPage) {
    // For PR pages, find the container with PR actions
    container = document.querySelector('.gh-header-actions');
  } else if (isIssuePage) {
    // For issue pages, find the container with issue actions
    container = document.querySelector('.gh-header-actions');
  }

  return container;
}

// Extracts repository information from the current page
function getRepositoryInfo() {
  const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);

  // Extract owner and repo from URL
  const owner = pathParts[0];
  const repo = pathParts[1];

  // For PR pages, get PR number and branch
  let prNumber = null;
  let prBranch = null;

  // For issue pages, get issue number
  let issueNumber = null;

  if (pathParts.includes('pull')) {
    const prIndex = pathParts.indexOf('pull');
    if (prIndex >= 0 && prIndex + 1 < pathParts.length) {
      prNumber = pathParts[prIndex + 1];
    }
    if (!prBranch) {
      const branchSpan = document.querySelector('span.head-ref');
      if (branchSpan) {
        prBranch = branchSpan.textContent.trim();
      }
    }
  } else if (pathParts.includes('issues')) {
    const issueIndex = pathParts.indexOf('issues');
    if (issueIndex >= 0 && issueIndex + 1 < pathParts.length) {
      issueNumber = pathParts[issueIndex + 1];
    }
  }

  return {
    owner,
    repo,
    fullRepo: `${owner}/${repo}`,
    prNumber,
    prBranch,
    issueNumber,
    url: window.location.href
  };
}

// Extracts information about a PR from a forked repository
function getPRForkInfo() {
  // Look for the fork indicator in the PR
  const forkIndicator = document.querySelector('.fork-flag');

  if (forkIndicator) {
    // Extract the fork owner and repo
    const forkLink = document.querySelector('.fork-flag a');

    if (forkLink) {
      const forkPath = new URL(forkLink.href).pathname;
      const forkParts = forkPath.split('/').filter(part => part.length > 0);

      if (forkParts.length >= 2) {
        return {
          owner: forkParts[0],
          repo: forkParts[1],
          fullRepo: `${forkParts[0]}/${forkParts[1]}`
        };
      }
    }
  }

  return null;
}

// Checks if a file exists in the repository
async function checkFileExists(repoInfo, filename) {
  try {
    // We'll use GitHub's UI to check if the file is visible
    const fileElement = document.querySelector(`a[title="${filename}"]`);
    return !!fileElement;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

// Checks for failing GitHub actions in a PR
async function checkForFailingActions() {
  try {
    // Look for failing status indicators in the PR
    const failingStatusElements = document.querySelectorAll('.status-heading.text-red');
    return failingStatusElements.length > 0;
  } catch (error) {
    console.error('Error checking for failing actions:', error);
    return false;
  }
}

// Checks for merge conflicts in a PR
async function checkForMergeConflicts() {
  try {
    // Look for merge conflict indicators in the PR
    const conflictElements = document.querySelectorAll('.merge-status-icon.octicon-alert');
    const conflictMessages = document.querySelectorAll('.branch-action-item.color-border-danger');
    return conflictElements.length > 0 || conflictMessages.length > 0;
  } catch (error) {
    console.error('Error checking for merge conflicts:', error);
    return false;
  }
}

// Adds a "Resolve Conflict with OpenHands" button next to GitHub's "Resolve conflicts" button
function addResolveConflictWithOpenHandsButton(repoInfo) {
  try {
    // Look for GitHub's "Resolve conflicts" button using a more reliable approach
    const allButtons = document.querySelectorAll('button.btn-sm');
    let githubResolveButton = null;
    
    for (const button of allButtons) {
      if (button.textContent.trim() === 'Resolve conflicts' && 
          !button.classList.contains('openhands-resolve-conflicts-btn')) {
        githubResolveButton = button;
        break;
      }
    }
    
    // If we found the button and our button doesn't already exist
    if (githubResolveButton && !document.querySelector('.openhands-resolve-conflicts-btn')) {
      // Create our button with similar styling to GitHub's button
      const openhandsResolveButton = document.createElement('button');
      openhandsResolveButton.className = 'btn btn-sm openhands-resolve-conflicts-btn';
      
      // Add OpenHands logo and text
      openhandsResolveButton.innerHTML = '<img src="' + chrome.runtime.getURL('images/openhands-logo.svg') + 
                                        '" class="openhands-logo" alt="OpenHands Logo">' + 
                                        '<span>Resolve Conflict with OpenHands</span>';
      
      // Add click event listener
      openhandsResolveButton.addEventListener('click', () => {
        handlePRLaunch(repoInfo, 'resolve_conflicts');
      });
      
      // Insert our button after GitHub's button
      githubResolveButton.parentNode.insertBefore(openhandsResolveButton, githubResolveButton.nextSibling);
    }
  } catch (error) {
    console.error('Error adding Resolve Conflict with OpenHands button:', error);
  }
}

// Checks for code review feedback in a PR
async function checkForCodeReviewFeedback() {
  try {
    // Look for review comments or requested changes
    const reviewElements = document.querySelectorAll('.review-comment, .review-thread-component');
    const requestedChangesElements = document.querySelectorAll('.color-text-danger.mr-1');
    return reviewElements.length > 0 || requestedChangesElements.length > 0;
  } catch (error) {
    console.error('Error checking for code review feedback:', error);
    return false;
  }
}

// Updates the button state (loading, success, error)
function updateButtonState(state) {
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

// Handles launching OpenHands for a repository
async function handleRepoLaunch(repoInfo, action = 'default') {
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

// Handles launching OpenHands for a pull request
async function handlePRLaunch(repoInfo, action = 'default') {
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
        instruction = `You are checked out to branch "${repoInfo.prBranch || 'the PR branch'}", which has an open PR ${repoInfo.url}. This PR has merge conflicts with the main branch that need to be resolved.

# Steps to Resolve Merge Conflicts

1. Analyze the conflicts by examining the diff and understanding what changes are conflicting
2. For each conflicting file:
   - Carefully review both versions of the code
   - Determine the correct resolution that preserves the intended functionality
   - Implement the resolution while maintaining code quality
3. After resolving all conflicts:
   - Test the changes to ensure they work as expected
   - Commit the resolved conflicts
   - Push the changes to update the PR

Please resolve these merge conflicts in a way that preserves the intended functionality of both branches while maintaining code quality and consistency.`;
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

// Handles launching OpenHands for an issue
async function handleIssueLaunch(repoInfo, action = 'investigate') {
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

// Adds repository-specific dropdown items to the menu
function addRepoDropdownItems(dropdownMenu, repoInfo) {
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

// Adds PR-specific dropdown items to the menu
function addPRDropdownItems(dropdownMenu, repoInfo) {
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
      // Add the option to the dropdown menu
      const resolveConflictsItem = document.createElement('button');
      resolveConflictsItem.className = 'openhands-dropdown-item';
      resolveConflictsItem.textContent = 'Resolve merge conflicts';
      resolveConflictsItem.addEventListener('click', () => {
        handlePRLaunch(repoInfo, 'resolve_conflicts');
      });
      dropdownMenu.appendChild(resolveConflictsItem);
      
      // Also add the standalone button next to GitHub's "Resolve conflicts" button
      addResolveConflictWithOpenHandsButton(repoInfo);
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

// Adds issue-specific dropdown items to the menu
function addIssueDropdownItems(dropdownMenu, repoInfo) {
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

// Function to add the OpenHands button to GitHub pages
function addOpenHandsButton() {
  // Check if we're on a GitHub repository page, pull request page, or issue page
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

// Initialize the extension when the DOM is fully loaded
function initialize() {
  // Add the OpenHands button to the page
  addOpenHandsButton();
  
  // Check if we're on a PR page with conflicts
  const { isPRPage } = detectPageType();
  if (isPRPage) {
    const repoInfo = getRepositoryInfo();
    checkForMergeConflicts().then(hasConflicts => {
      if (hasConflicts) {
        // Add the standalone button next to GitHub's "Resolve conflicts" button
        addResolveConflictWithOpenHandsButton(repoInfo);
      }
    });
  }
}

// Set up a MutationObserver to watch for the "Resolve conflicts" button being added
function setupConflictButtonObserver() {
  const { isPRPage } = detectPageType();
  if (!isPRPage) return;
  
  const repoInfo = getRepositoryInfo();
  
  // Create a MutationObserver to watch for changes to the DOM
  const observer = new MutationObserver((mutations) => {
    // Check if any of the mutations added a "Resolve conflicts" button
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if we're on a PR page with conflicts
        checkForMergeConflicts().then(hasConflicts => {
          if (hasConflicts) {
            // Add the standalone button next to GitHub's "Resolve conflicts" button
            addResolveConflictWithOpenHandsButton(repoInfo);
          }
        });
      }
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });
}

// Run the initialization when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  initialize();
  setupConflictButtonObserver();
});

// Also run on navigation within GitHub (for SPA behavior)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      initialize();
      setupConflictButtonObserver();
    }, 500); // Small delay to ensure DOM is updated
  }
}).observe(document, { subtree: true, childList: true });

// Initial run
initialize();
setupConflictButtonObserver();
