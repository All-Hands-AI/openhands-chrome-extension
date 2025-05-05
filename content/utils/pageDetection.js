/**
 * Utility functions to detect the type of GitHub page
 */

/**
 * Detects the type of GitHub page we're currently on
 * @returns {Object} Object containing page type information
 */
export function detectPageType() {
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

/**
 * Finds the appropriate container for the OpenHands button based on page type
 * @returns {HTMLElement|null} The container element or null if not found
 */
export function findButtonContainer() {
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