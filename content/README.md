# Content Script Structure

This directory contains the modular structure for the content script that injects the OpenHands button and dropdown menu into GitHub pages.

## Directory Structure

- `index.js`: Main entry point for the content script
- `api/`: API communication utilities
  - `communication.js`: Utilities for communicating with the background script and OpenHands API
- `handlers/`: Page-specific action handlers
  - `repository.js`: Handlers for repository page actions
  - `pullRequest.js`: Handlers for pull request page actions
  - `issue.js`: Handlers for issue page actions
- `ui/`: UI components
  - `button.js`: Button and dropdown UI components
- `utils/`: Utility functions
  - `pageDetection.js`: Functions to detect page type and find containers
  - `githubInfo.js`: Functions to extract GitHub repository information
  - `statusChecks.js`: Functions to check various statuses (file existence, failing actions, etc.)

## Flow

1. `index.js` initializes the content script and adds the OpenHands button to the page
2. `ui/button.js` creates the button and dropdown UI
3. Based on the page type (repository, PR, or issue), the appropriate handler adds dropdown items
4. When a button or dropdown item is clicked, the corresponding handler function is called
5. The handler communicates with the background script to start a new OpenHands conversation

## Adding New Features

To add new features:

1. Add new utility functions in the appropriate utils file
2. Add new handler functions in the appropriate handlers file
3. Update the UI components as needed
4. Update the index.js file if necessary