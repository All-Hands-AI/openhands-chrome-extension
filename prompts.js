// Prompts for OpenHands Chrome Extension
// This file contains all the prompts used in the extension

// Repository prompts
const REPO_PROMPTS = {
  // Default prompt for repository
  DEFAULT: (repoInfo) => `I've launched OpenHands for the ${repoInfo.fullRepo} repository. Please ask what task I'd like to perform.`,
  
  // Learn about codebase prompt
  LEARN_CODEBASE: (repoInfo) => `I've launched OpenHands for the ${repoInfo.fullRepo} repository. Please help me understand this codebase.`,
  
  // Add repo.md microagent prompt
  ADD_REPO_MD: (repoInfo) => `I've launched OpenHands for the ${repoInfo.fullRepo} repository. Please create a repo.md microagent file.`,
  
  // Add setup.sh prompt
  ADD_SETUP_SH: (repoInfo) => `I've launched OpenHands for the ${repoInfo.fullRepo} repository. Please create a setup.sh script.`
};

// Pull request prompts
const PR_PROMPTS = {
  // Default prompt for PR
  DEFAULT: (repoInfo) => `You are working on a PR ${repoInfo.url}, and you should check out to branch ${repoInfo.prBranch || 'the PR branch'} that corresponds to this PR, read the git diff against main branch, understand the purpose of this PR, and then awaits me for further instructions.`,
  
  // Fix failing GitHub actions prompt
  FIX_ACTIONS: (repoInfo) => `You are working on PR #${repoInfo.prNumber} (${repoInfo.url}). Please help me fix the failing GitHub actions.`,
  
  // Resolve merge conflicts prompt
  RESOLVE_CONFLICTS: (repoInfo) => `You are working on PR #${repoInfo.prNumber} (${repoInfo.url}). Please help me resolve the merge conflicts.`,
  
  // Address code review feedback prompt
  ADDRESS_FEEDBACK: (repoInfo) => `You are working on PR #${repoInfo.prNumber} (${repoInfo.url}). Please help me address the code review feedback.`
};

// Issue prompts
const ISSUE_PROMPTS = {
  // Investigate issue prompt
  INVESTIGATE: (repoInfo, issueNumber) => `I've launched OpenHands for the ${repoInfo.fullRepo} repository. Please help me investigate Issue #${issueNumber} (${repoInfo.url}).`,
  
  // Solve issue prompt
  SOLVE: (repoInfo, issueNumber) => `I've launched OpenHands for the ${repoInfo.fullRepo} repository. Please help me solve Issue #${issueNumber} (${repoInfo.url}).`
};