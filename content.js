// Function to add the OpenHands button to GitHub repository pages
function addOpenHandsButton() {
  // Check if we're on a GitHub repository page, pull request page, or issue page
  const isRepoPage = window.location.pathname.split('/').length === 3 || 
                     (window.location.pathname.split('/').length > 3 && 
                      !window.location.pathname.includes('/pull/') &&
                      !window.location.pathname.includes('/issues/'));
  const isPRPage = window.location.pathname.includes('/pull/');
  const isIssuePage = window.location.pathname.includes('/issues/') && 
                      window.location.pathname.split('/').length > 4; // Make sure it's a specific issue
  
  if (!isRepoPage && !isPRPage && !isIssuePage) return;

  // Remove any existing OpenHands buttons to avoid duplicates
  const existingButtons = document.querySelectorAll('.openhands-container');
  existingButtons.forEach(button => button.remove());

  // Find the container where we want to add our button
  let container;
  if (isRepoPage) {
    // For repository pages, find the container with star/watch/fork buttons
    container = document.querySelector('ul.pagehead-actions');
  } else if (isPRPage || isIssuePage) {
    // For PR pages or issue pages, find the container with actions
    container = document.querySelector('.gh-header-actions');
  }

  if (!container) return;

  // Create our button container
  const listItem = document.createElement('li');
  listItem.className = 'openhands-list-item';
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'openhands-container';
  
  // Create main button
  const button = document.createElement('button');
  button.className = 'openhands-launch-btn';
  button.innerHTML = '<img src="' + chrome.runtime.getURL('images/openhands-logo.svg') + '" class="openhands-logo" alt="OpenHands Logo"><span>Launch in OpenHands</span>';
  button.title = 'Start an OpenHands conversation for this repository';
  
  // Create dropdown toggle button
  const dropdownToggle = document.createElement('button');
  dropdownToggle.className = 'openhands-dropdown-toggle';
  dropdownToggle.innerHTML = '<span class="openhands-caret">▼</span>';
  dropdownToggle.title = 'Show OpenHands options';
  
  // Create dropdown menu
  const dropdownMenu = document.createElement('div');
  dropdownMenu.className = 'openhands-dropdown-menu';
  
  // Get repository information
  const repoInfo = getRepositoryInfo();
  
  // Add appropriate dropdown items based on page type
  if (isRepoPage) {
    // Repository home page options
    addDropdownItem(dropdownMenu, `New conversation for ${repoInfo.fullRepo}`, () => {
      handleRepoLaunch(repoInfo, REPO_PROMPTS.DEFAULT(repoInfo));
    });
    
    addDropdownItem(dropdownMenu, 'Learn about this codebase', () => {
      handleRepoLaunch(repoInfo, REPO_PROMPTS.LEARN_CODEBASE(repoInfo));
    });
    
    // Check if repo.md exists
    const repoMdElement = document.querySelector('a[href$="/repo.md"]');
    if (!repoMdElement) {
      addDropdownItem(dropdownMenu, 'Add a repo.md microagent', () => {
        handleRepoLaunch(repoInfo, REPO_PROMPTS.ADD_REPO_MD(repoInfo));
      });
    }
    
    // Check if setup.sh exists
    const setupShElement = document.querySelector('a[href$="/setup.sh"]');
    if (!setupShElement) {
      addDropdownItem(dropdownMenu, 'Add setup.sh', () => {
        handleRepoLaunch(repoInfo, REPO_PROMPTS.ADD_SETUP_SH(repoInfo));
      });
    }
  } else if (isPRPage) {
    // Pull request options
    const prNumber = repoInfo.prNumber;
    
    addDropdownItem(dropdownMenu, `New conversation for PR #${prNumber}`, () => {
      handlePRLaunch(repoInfo);
    });
    
    // Check for failing GitHub actions
    const failingChecks = document.querySelectorAll('.checks-summary-conclusion-failure');
    if (failingChecks.length > 0) {
      addDropdownItem(dropdownMenu, 'Fix failing GitHub actions', () => {
        handlePRLaunch(repoInfo, PR_PROMPTS.FIX_ACTIONS(repoInfo));
      });
    }
    
    // Check for merge conflicts
    const mergeConflicts = document.querySelector('.branch-action-item.color-border-danger');
    if (mergeConflicts) {
      addDropdownItem(dropdownMenu, 'Resolve merge conflicts', () => {
        handlePRLaunch(repoInfo, PR_PROMPTS.RESOLVE_CONFLICTS(repoInfo));
      });
    }
    
    // Check for code review comments
    const reviewComments = document.querySelectorAll('.js-comment');
    if (reviewComments.length > 0) {
      addDropdownItem(dropdownMenu, 'Address code review feedback', () => {
        handlePRLaunch(repoInfo, PR_PROMPTS.ADDRESS_FEEDBACK(repoInfo));
      });
    }
  } else if (isIssuePage) {
    // Issue options
    const issueNumber = window.location.pathname.split('/').pop();
    
    addDropdownItem(dropdownMenu, `Investigate Issue #${issueNumber}`, () => {
      handleRepoLaunch(repoInfo, ISSUE_PROMPTS.INVESTIGATE(repoInfo, issueNumber));
    });
    
    addDropdownItem(dropdownMenu, `Solve Issue #${issueNumber}`, () => {
      handleRepoLaunch(repoInfo, ISSUE_PROMPTS.SOLVE(repoInfo, issueNumber));
    });
  }
  
  // Add click event listener to main button
  button.addEventListener('click', async () => {
    // Get repository information
    const repoInfo = getRepositoryInfo();
    
    if (isPRPage) {
      handlePRLaunch(repoInfo);
    } else {
      handleRepoLaunch(repoInfo);
    }
  });
  
  // Add click event listener to dropdown toggle
  dropdownToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdownMenu.classList.toggle('show');
    
    // Close dropdown when clicking outside
    const closeDropdown = (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== dropdownToggle) {
        dropdownMenu.classList.remove('show');
        document.removeEventListener('click', closeDropdown);
      }
    };
    
    document.addEventListener('click', closeDropdown);
  });
  
  // Add elements to the DOM
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(dropdownToggle);
  buttonContainer.appendChild(dropdownMenu);
  listItem.appendChild(buttonContainer);
  container.appendChild(listItem);
}

// Helper function to add dropdown items
function addDropdownItem(menu, text, clickHandler) {
  const item = document.createElement('a');
  item.className = 'openhands-dropdown-item';
  item.textContent = text;
  item.href = '#';
  item.addEventListener('click', (event) => {
    event.preventDefault();
    clickHandler();
    // Hide dropdown after clicking
    menu.classList.remove('show');
  });
  menu.appendChild(item);
}

// Function to get repository information from the current page
function getRepositoryInfo() {
  const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
  const owner = pathParts[0];
  const repo = pathParts[1];
  
  // For PR pages, get PR number and branch
  let prNumber = null;
  let prBranch = null;
  
  if (window.location.pathname.includes('/pull/')) {
    prNumber = pathParts[3];
    
    // Try to find the branch name from the page
    const branchElements = document.querySelectorAll('.commit-ref');
    if (branchElements.length >= 2) {
      prBranch = branchElements[0].textContent.trim();
    }
  }
  
  return {
    owner,
    repo,
    fullRepo: `${owner}/${repo}`,
    prNumber,
    prBranch,
    url: window.location.href
  };
}

// Function to handle launching OpenHands for a repository
async function handleRepoLaunch(repoInfo, customMessage) {
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
    
    // Use custom message if provided, otherwise use default
    const initialMessage = customMessage || REPO_PROMPTS.DEFAULT(repoInfo);
    
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
async function handlePRLaunch(repoInfo, customMessage) {
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
    
    // Use custom message if provided, otherwise use default
    const instruction = customMessage || PR_PROMPTS.DEFAULT(repoInfo);
    
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

// Function to update button state (loading, success, error)
function updateButtonState(state) {
  const button = document.querySelector('.openhands-launch-btn');
  const dropdownToggle = document.querySelector('.openhands-dropdown-toggle');
  if (!button) return;
  
  // Get logo HTML
  const logoHTML = '<img src="' + chrome.runtime.getURL('images/openhands-logo.svg') + '" class="openhands-logo" alt="OpenHands Logo">';
  
  // Reset classes
  button.classList.remove('loading', 'success', 'error');
  
  if (state === 'loading') {
    button.classList.add('loading');
    button.innerHTML = `${logoHTML}<span>Launching...</span>`;
    
    // Disable dropdown toggle during loading
    if (dropdownToggle) {
      dropdownToggle.disabled = true;
      dropdownToggle.classList.add('disabled');
    }
  } else if (state === 'success') {
    button.classList.add('success');
    button.innerHTML = `${logoHTML}<span>Launched!</span>`;
    
    // Reset after 3 seconds
    setTimeout(() => {
      button.classList.remove('success');
      button.innerHTML = `${logoHTML}<span>Launch in OpenHands</span>`;
      
      // Re-enable dropdown toggle
      if (dropdownToggle) {
        dropdownToggle.disabled = false;
        dropdownToggle.classList.remove('disabled');
      }
    }, 3000);
  } else if (state === 'error') {
    button.classList.add('error');
    button.innerHTML = `${logoHTML}<span>Failed to launch</span>`;
    
    // Reset after 3 seconds
    setTimeout(() => {
      button.classList.remove('error');
      button.innerHTML = `${logoHTML}<span>Launch in OpenHands</span>`;
      
      // Re-enable dropdown toggle
      if (dropdownToggle) {
        dropdownToggle.disabled = false;
        dropdownToggle.classList.remove('disabled');
      }
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
  const button = document.querySelector('.openhands-launch-btn');
  if (!button) {
    addOpenHandsButton();
  }
}, 2000);

// Clear interval after 10 seconds to avoid unnecessary processing
setTimeout(() => {
  clearInterval(checkInterval);
}, 10000);
