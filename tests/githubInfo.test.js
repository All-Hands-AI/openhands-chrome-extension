/**
 * Unit tests for githubInfo.js
 */

import { getRepositoryInfo } from '../content/utils/githubInfo';

// Mock the document and window objects
global.document = {
  querySelectorAll: jest.fn().mockReturnValue([]),
  querySelector: jest.fn().mockReturnValue(null)
};

global.window = {
  location: {
    pathname: '',
    href: ''
  }
};

describe('getRepositoryInfo', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Reset window location
    window.location.pathname = '';
    window.location.href = '';
    
    // Reset document query selectors
    document.querySelectorAll.mockReset();
    document.querySelector.mockReset();
  });
  
  test('should extract owner and repo from URL', () => {
    window.location.pathname = '/owner/repo';
    window.location.href = 'https://github.com/owner/repo';
    
    const result = getRepositoryInfo();
    
    expect(result.owner).toBe('owner');
    expect(result.repo).toBe('repo');
    expect(result.fullRepo).toBe('owner/repo');
  });
  
  test('should extract PR number from URL', () => {
    window.location.pathname = '/owner/repo/pull/123';
    window.location.href = 'https://github.com/owner/repo/pull/123';
    
    // Make sure querySelectorAll returns an empty array to avoid the error
    document.querySelectorAll.mockReturnValue([]);
    
    const result = getRepositoryInfo();
    
    expect(result.prNumber).toBe('123');
  });
  
  test('should extract branch name using commit-ref selector', () => {
    window.location.pathname = '/owner/repo/pull/123';
    window.location.href = 'https://github.com/owner/repo/pull/123';
    
    // Mock the commit-ref elements
    document.querySelectorAll.mockReturnValue([
      { textContent: 'main' },
      { textContent: 'feature-branch' }
    ]);
    
    const result = getRepositoryInfo();
    
    // Should get the source branch (second element) not the target branch (first element)
    expect(result.prBranch).toBe('feature-branch');
  });
  
  test('should extract branch name using data-hovercard-type selector', () => {
    window.location.pathname = '/owner/repo/pull/123';
    window.location.href = 'https://github.com/owner/repo/pull/123';
    
    // Mock empty commit-ref elements
    document.querySelectorAll.mockReturnValue([]);
    
    // Mock the data-hovercard-type element
    document.querySelector.mockImplementation((selector) => {
      if (selector === '[data-hovercard-type="branch"]') {
        return { textContent: 'feature/branch-name' };
      }
      return null;
    });
    
    const result = getRepositoryInfo();
    
    expect(result.prBranch).toBe('feature/branch-name');
  });
  
  test('should extract branch name using head-ref selector', () => {
    window.location.pathname = '/owner/repo/pull/123';
    window.location.href = 'https://github.com/owner/repo/pull/123';
    
    // Mock empty commit-ref elements
    document.querySelectorAll.mockReturnValue([]);
    
    // Mock null data-hovercard-type element
    document.querySelector.mockImplementation((selector) => {
      if (selector === '[data-hovercard-type="branch"]') {
        return null;
      }
      if (selector === 'span.head-ref') {
        return { textContent: 'feature/branch-with-emoji:🔥' };
      }
      return null;
    });
    
    const result = getRepositoryInfo();
    
    // Should clean up the branch name
    expect(result.prBranch).toBe('feature/branch-with-emoji');
  });
  
  test('should extract issue number from URL', () => {
    window.location.pathname = '/owner/repo/issues/456';
    window.location.href = 'https://github.com/owner/repo/issues/456';
    
    const result = getRepositoryInfo();
    
    expect(result.issueNumber).toBe('456');
  });
  
  test('should correctly parse branch name for PR #8351 scenario', () => {
    window.location.pathname = '/All-Hands-AI/OpenHands/pull/8351';
    window.location.href = 'https://github.com/All-Hands-AI/OpenHands/pull/8351';
    
    // Mock the commit-ref elements for the specific scenario mentioned in PR comment
    document.querySelectorAll.mockReturnValue([
      { textContent: 'main' },
      { textContent: 'fix-close-broken-socket' }
    ]);
    
    const result = getRepositoryInfo();
    
    // Should correctly parse the source branch (fix-close-broken-socket) not the target branch (main)
    expect(result.prNumber).toBe('8351');
    expect(result.prBranch).toBe('fix-close-broken-socket');
  });
  
  test('should correctly parse branch name for xingyaoww PR scenario', () => {
    window.location.pathname = '/All-Hands-AI/OpenHands/pull/1';
    window.location.href = 'https://github.com/All-Hands-AI/OpenHands/pull/1';
    
    // Mock the commit-ref elements for the specific scenario mentioned in PR comment
    // This PR: xingyaoww wants to merge 3 commits into main from xw/fix-mcp
    document.querySelectorAll.mockReturnValue([
      { textContent: 'main' },
      { textContent: 'xw/fix-mcp' }
    ]);
    
    const result = getRepositoryInfo();
    
    // Should correctly parse the source branch (xw/fix-mcp) not the target branch (main)
    expect(result.prNumber).toBe('1');
    expect(result.prBranch).toBe('xw/fix-mcp');
  });
});