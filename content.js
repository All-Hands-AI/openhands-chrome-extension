// Function to add the OpenHands button to GitHub repository pages
function addOpenHandsButton() {
  // Check if we're on a GitHub repository page or a pull request page
  const isRepoPage = window.location.pathname.split('/').length === 3 || 
                     (window.location.pathname.split('/').length > 3 && 
                      !window.location.pathname.includes('/pull/'));
  const isPRPage = window.location.pathname.includes('/pull/');
  
  if (!isRepoPage && !isPRPage) return;

  // Remove any existing OpenHands buttons to avoid duplicates
  const existingButtons = document.querySelectorAll('.openhands-launch-btn');
  existingButtons.forEach(button => button.remove());

  // Find the container where we want to add our button
  let container;
  if (isRepoPage) {
    // For repository pages, find the container with star/watch/fork buttons
    container = document.querySelector('ul.pagehead-actions');
  } else if (isPRPage) {
    // For PR pages, find the container with PR actions
    container = document.querySelector('.gh-header-actions');
  }

  if (!container) return;

  // Create our button
  const listItem = document.createElement('li');
  listItem.className = 'openhands-list-item';
  
  const button = document.createElement('button');
  button.className = 'openhands-launch-btn';
  button.innerHTML = '<span>Launch in OpenHands</span>';
  button.title = 'Start an OpenHands conversation for this repository';
  
  // Add click event listener
  button.addEventListener('click', async () => {
    // Get repository information
    const repoInfo = getRepositoryInfo();
    
    if (isPRPage) {
      handlePRLaunch(repoInfo);
    } else {
      handleRepoLaunch(repoInfo);
    }
  });
  
  listItem.appendChild(button);
  container.appendChild(listItem);
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
async function handleRepoLaunch(repoInfo) {
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
    
    // Send message to background script to make API request
    chrome.runtime.sendMessage({
      action: 'startConversation',
      data: {
        initial_user_msg: `I want to explore the ${repoInfo.fullRepo} repository. Please help me understand its structure and functionality.`,
        repository: repoInfo.fullRepo
      }
    }, response => {
      if (response.success) {
        updateButtonState('success');
        // Open the conversation in a new tab
        window.open(response.conversationUrl, '_blank');
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
async function handlePRLaunch(repoInfo) {
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
    
    // Create instruction for PR review
    const instruction = `You are working on a PR ${repoInfo.url}, and you should check out to branch ${repoInfo.prBranch || 'the PR branch'} that corresponds to this PR, read the git diff against main branch, understand the purpose of this PR, and then awaits me for further instructions.`;
    
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
        // Open the conversation in a new tab
        window.open(response.conversationUrl, '_blank');
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
  if (!button) return;
  
  // Reset classes
  button.classList.remove('loading', 'success', 'error');
  
  if (state === 'loading') {
    button.classList.add('loading');
    button.innerHTML = '<span>Launching...</span>';
  } else if (state === 'success') {
    button.classList.add('success');
    button.innerHTML = '<span>Launched!</span>';
    // Reset after 3 seconds
    setTimeout(() => {
      button.classList.remove('success');
      button.innerHTML = '<span>Launch in OpenHands</span>';
    }, 3000);
  } else if (state === 'error') {
    button.classList.add('error');
    button.innerHTML = '<span>Failed to launch</span>';
    // Reset after 3 seconds
    setTimeout(() => {
      button.classList.remove('error');
      button.innerHTML = '<span>Launch in OpenHands</span>';
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