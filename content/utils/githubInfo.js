/**
 * Utility functions to extract GitHub repository information
 */

/**
 * Extracts repository information from the current page
 * @returns {Object} Repository information
 */
export function getRepositoryInfo() {
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

/**
 * Extracts information about a PR from a forked repository
 * @returns {Object|null} Fork information or null if not a fork
 */
export function getPRForkInfo() {
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