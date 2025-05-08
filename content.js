// Function to add the OpenHands button to GitHub repository pages
function addOpenHandsButton() {
  // Check if we're on a GitHub repository page, pull request page, or issue page
  const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
  const isRepoPage = pathParts.length === 2 || 
                     (pathParts.length > 2 && 
                      !pathParts.includes('pull') && 
                      !pathParts.includes('issues'));
  const isPRPage = pathParts.includes('pull');
  const isIssuePage = pathParts.includes('issues') && pathParts.length > 3; // Make sure it's a specific issue

  if (!isRepoPage && !isPRPage && !isIssuePage) return;

  // Remove any existing OpenHands buttons to avoid duplicates
  const existingButtons = document.querySelectorAll('.openhands-list-item');
  existingButtons.forEach(button => button.remove());

  // Find the container where we want to add our button
  let container;
  if (isRepoPage) {
    // For repository pages, find the container with star/watch/fork buttons
    container = document.querySelector('ul.pagehead-actions');
  } else if (isPRPage) {
    // For PR pages, find the container with PR actions
    container = document.querySelector('.gh-header-actions');
  } else if (isIssuePage) {
    // For issue pages, find the container with issue actions
    container = document.querySelector('.gh-header-actions');
  }

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
    console.log('Toggle button clicked');
    
    // Force close any other open dropdowns first
    document.querySelectorAll('.openhands-dropdown-menu.show').forEach(menu => {
      if (menu !== dropdownMenu) {
        menu.classList.remove('show');
      }
    });
    
    // Toggle this dropdown
    dropdownMenu.classList.toggle('show');
    console.log('Dropdown visibility:', dropdownMenu.classList.contains('show'));
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

// Function to add repository-specific dropdown items
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

// Function to add PR-specific dropdown items
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

// Function to add Issue-specific dropdown items
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

// Function to get repository information from the current page
function getRepositoryInfo() {
  const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
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
    
    // Try to find the branch name from the page
    const branchElements = document.querySelectorAll('.commit-ref');
    if (branchElements.length >= 2) {
      prBranch = branchElements[0].textContent.trim();
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

// Function to check if a file exists in the repository
async function checkFileExists(repoInfo, filename) {
  try {
    // We'll use GitHub's API to check if the file exists
    // For simplicity, we'll just check if the file is visible in the UI
    const fileElement = document.querySelector(`a[title="${filename}"]`);
    return !!fileElement;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

// Function to check for failing GitHub actions
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

// Function to check for merge conflicts
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

// Function to check for code review feedback
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

// Function to handle launching OpenHands for a repository
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

// Function to handle launching OpenHands for a pull request
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
    
    // Check if PR is from a fork
    const isFork = checkIfPRIsFromFork();
    let targetRepo = repoInfo.fullRepo;
    
    if (isFork) {
      // Get the fork repository name
      const forkInfo = getPRForkInfo();
      if (forkInfo) {
        targetRepo = forkInfo;
      }
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
        repository: targetRepo
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

// Function to check if PR is from a fork
function checkIfPRIsFromFork() {
  // Look for indicators that the PR is from a fork
  const forkIndicator = document.querySelector('.commit-ref.head-ref a[title*="fork"]');
  return !!forkIndicator;
}

// Function to get the fork repository information
function getPRForkInfo() {
  // Try to extract fork information from the page
  const forkElement = document.querySelector('.commit-ref.head-ref a');
  if (forkElement) {
    const forkTitle = forkElement.getAttribute('title');
    if (forkTitle) {
      // Extract owner/repo format from the title
      const match = forkTitle.match(/([^/]+\/[^:]+):/);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  return null;
}

// Function to handle launching OpenHands for an issue
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

// Function to update button state (loading, success, error)
function updateButtonState(state) {
  const button = document.querySelector('.openhands-dropdown-toggle');
  if (!button) return;
  
  // Get logo HTML
  const logoHTML = '<img src="' + chrome.runtime.getURL('images/openhands-logo.svg') + '" class="openhands-logo" alt="OpenHands Logo">';
  
  // Reset classes
  button.classList.remove('loading', 'success', 'error');
  
  if (state === 'loading') {
    button.classList.add('loading');
    button.innerHTML = `${logoHTML}<span>Launching...</span>`;
  } else if (state === 'success') {
    button.classList.add('success');
    button.innerHTML = `${logoHTML}<span>Launched!</span>`;
    // Reset after 3 seconds
    setTimeout(() => {
      button.classList.remove('success');
      button.innerHTML = `${logoHTML}<span>Launch with OpenHands</span>`;
    }, 3000);
  } else if (state === 'error') {
    button.classList.add('error');
    button.innerHTML = `${logoHTML}<span>Failed to launch</span>`;
    // Reset after 3 seconds
    setTimeout(() => {
      button.classList.remove('error');
      button.innerHTML = `${logoHTML}<span>Launch with OpenHands</span>`;
    }, 3000);
  }
}

// Run when the page loads
addOpenHandsButton();

// Re-run when navigation happens within GitHub (it's a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(addOpenHandsButton, 500); // Delay to ensure DOM is updated
  }
}).observe(document, { subtree: true, childList: true });

// Also check periodically in case the button container loads after our script
const checkInterval = setInterval(() => {
  const button = document.querySelector('.openhands-dropdown-toggle');
  if (!button) {
    addOpenHandsButton();
  }
}, 2000);

// Clear interval after 10 seconds to avoid unnecessary processing
setTimeout(() => {
  clearInterval(checkInterval);
}, 10000);
