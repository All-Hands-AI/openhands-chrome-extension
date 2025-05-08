/**
 * Real PR example for testing branch parsing
 * 
 * This script simulates the DOM environment of a real GitHub PR page
 * and tests the branch parsing logic with actual PR data.
 */

// Mock the DOM environment
global.document = {
  querySelectorAll: (selector) => {
    if (selector === '.commit-ref') {
      // This simulates the actual DOM structure of the PR page we observed
      // where the first element is the target branch (main) and
      // the second element is the source branch (xw/fix-mcp)
      return [
        { textContent: 'main' },
        { textContent: 'xw/fix-mcp' }
      ];
    }
    return [];
  },
  querySelector: (selector) => {
    // Return null for these selectors to simulate them not being found
    // This forces the code to use the commit-ref selector above
    return null;
  }
};

// Mock the window.location object
global.window = {
  location: {
    // This is the actual PR URL we observed
    pathname: '/All-Hands-AI/OpenHands/pull/8353',
    href: 'https://github.com/All-Hands-AI/OpenHands/pull/8353'
  }
};

// Import the function we want to test from our CommonJS version
const githubInfo = require('./githubInfo.cjs');

// Run the function with our mocked environment
const result = githubInfo.getRepositoryInfo();

// Display the results
console.log('PR Information:');
console.log('---------------');
console.log(`Repository: ${result.fullRepo}`);
console.log(`PR Number: ${result.prNumber}`);
console.log(`Branch: ${result.prBranch}`);
console.log('---------------');

// Verify the branch is correct
if (result.prBranch === 'xw/fix-mcp') {
  console.log('✅ SUCCESS: Correctly parsed the source branch as "xw/fix-mcp"');
} else {
  console.log(`❌ ERROR: Incorrectly parsed the branch as "${result.prBranch}" instead of "xw/fix-mcp"`);
}