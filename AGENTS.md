# OpenHands Chrome Extension

## Repository Purpose

This repository contains a Chrome extension that integrates OpenHands AI with GitHub. The extension adds a "Launch with OpenHands" button to GitHub repositories, pull requests, and issue pages, allowing users to start an OpenHands conversation with one click. The extension is context-aware, providing different options based on whether the user is viewing a repository, pull request, or issue page.

Key features include:
- Adding a "Launch with OpenHands" dropdown menu to GitHub repository pages
- Adding a "Launch with OpenHands" dropdown menu to GitHub pull request pages
- Adding a "Launch with OpenHands" dropdown menu to GitHub issue pages
- Context-aware dropdown options for repositories, PRs, and issues
- Automatic detection of forked repositories for PRs
- Configuration options for setting the OpenHands API key

## Repository Setup

The extension is built as a standard Chrome extension using Manifest V3. It doesn't require a build step and can be loaded directly as an unpacked extension in Chrome.

### Installation
1. Download or clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory

### Configuration
1. Click on the extension icon in the browser toolbar
2. Click the "Settings" button
3. Enter your OpenHands API key (available from the OpenHands Cloud Settings page)
4. Click "Save Settings"

## Repository Structure

The repository has a simple structure typical of Chrome extensions:

- `manifest.json`: Extension configuration file that defines permissions, content scripts, and other extension metadata
- `background.js`: Background script that handles API communication with the OpenHands Cloud API
- `content-bundle.js`: Content script that injects the dropdown menu into GitHub pages and detects page context
- `popup.html/js`: Extension popup UI that appears when clicking the extension icon
- `options.html/js`: Settings page for API key configuration
- `styles.css`: CSS styles for the injected dropdown menu and buttons
- `images/`: Directory containing extension icons and logos

### Key Components

1. **Content Script (`content-bundle.js`)**:
   - Detects the type of GitHub page (repository, PR, or issue)
   - Injects the "Launch with OpenHands" button into the appropriate location
   - Extracts repository, PR, or issue information from the page
   - Sends messages to the background script to start conversations

2. **Background Script (`background.js`)**:
   - Handles communication with the OpenHands Cloud API
   - Manages API key storage and retrieval
   - Opens new conversations in the OpenHands web app

3. **Options Page (`options.html/js`)**:
   - Provides a UI for users to configure their OpenHands API key
   - Stores configuration in Chrome's sync storage

4. **Popup (`popup.html/js`)**:
   - Provides quick access to extension features
   - Includes a link to the options page

## CI/CD and Workflows

This repository does not currently have any GitHub workflows or CI/CD configurations in the `.github` directory.