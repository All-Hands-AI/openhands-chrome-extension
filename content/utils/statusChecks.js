/**
 * Utility functions to check various statuses on GitHub pages
 */

/**
 * Checks if a file exists in the repository
 * @param {Object} repoInfo Repository information
 * @param {string} filename Name of the file to check
 * @returns {Promise<boolean>} Promise resolving to true if the file exists
 */
export async function checkFileExists(repoInfo, filename) {
  try {
    // We'll use GitHub's UI to check if the file is visible
    const fileElement = document.querySelector(`a[title="${filename}"]`);
    return !!fileElement;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

/**
 * Checks for failing GitHub actions in a PR
 * @returns {Promise<boolean>} Promise resolving to true if there are failing actions
 */
export async function checkForFailingActions() {
  try {
    // Look for failing status indicators in the PR
    const failingStatusElements = document.querySelectorAll('.status-heading.text-red');
    return failingStatusElements.length > 0;
  } catch (error) {
    console.error('Error checking for failing actions:', error);
    return false;
  }
}

/**
 * Checks for merge conflicts in a PR
 * @returns {Promise<boolean>} Promise resolving to true if there are merge conflicts
 */
export async function checkForMergeConflicts() {
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

/**
 * Checks for code review feedback in a PR
 * @returns {Promise<boolean>} Promise resolving to true if there is feedback
 */
export async function checkForCodeReviewFeedback() {
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