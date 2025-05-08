# Branch Parsing Example

This document provides a real-world example of how the branch parsing works in the OpenHands Chrome Extension.

## PR Example

Consider PR #8353 in the OpenHands repository:

```
PR: xingyaoww wants to merge 3 commits into main from xw/fix-mcp
URL: https://github.com/All-Hands-AI/OpenHands/pull/8353
```

## HTML Structure

When viewing this PR on GitHub, the DOM structure contains elements with the class `.commit-ref`:

```html
<span class="commit-ref">main</span>
<span class="commit-ref">xw/fix-mcp</span>
```

The first element represents the target branch (where the PR is being merged into), and the second element represents the source branch (where the PR is coming from).

## Branch Parsing Logic

The `getRepositoryInfo` function in `content/utils/githubInfo.js` correctly extracts the source branch by using the second `.commit-ref` element:

```javascript
const branchElements = document.querySelectorAll('.commit-ref');
if (branchElements.length >= 2) {
  // Use branchElements[1] for the source branch (the branch being merged from)
  // instead of branchElements[0] which is the target branch (usually main)
  prBranch = branchElements[1].textContent.trim();
}
```

## Result

For PR #8353, this logic correctly extracts:
- Source branch: `xw/fix-mcp`
- Target branch: `main`

This ensures that the extension uses the correct branch name when generating links or performing other operations related to the PR.