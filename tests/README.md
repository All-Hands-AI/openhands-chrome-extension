# OpenHands Chrome Extension Tests

This directory contains tests for the OpenHands Chrome Extension.

## Running Tests

To run all tests:

```bash
npm test
```

## Real PR Example

The `real_pr_example.js` file demonstrates how the branch parsing works with a real PR example. This example simulates the DOM structure of a GitHub PR page and verifies that the branch parsing logic correctly extracts the source branch name.

To run the real PR example:

```bash
node tests/real_pr_example.js
```

### Example Output

```
PR Information:
---------------
Repository: All-Hands-AI/OpenHands
PR Number: 8353
Branch: xw/fix-mcp
---------------
✅ SUCCESS: Correctly parsed the source branch as "xw/fix-mcp"
```

This example demonstrates that the branch parsing logic correctly extracts `xw/fix-mcp` as the source branch from the PR, addressing the issue mentioned in PR #1.