# OpenHands GitHub Launcher

A Chrome extension that adds a "Launch in OpenHands" button to GitHub repositories and pull requests, allowing you to start an OpenHands conversation with one click.

## Features

- Adds a "Launch in OpenHands" button to GitHub repository pages (next to Star/Fork buttons)
- Adds a "Launch in OpenHands" button to GitHub pull request pages
- Automatically detects if a PR is from a forked repository
- Configurable via options page to set your OpenHands API key

## Installation

### From Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon.

### Manual Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension should now be installed and active

## Configuration

1. Click on the extension icon in your browser toolbar
2. Click the "Settings" button
3. Enter your OpenHands API key
   - You can get your API key from the [OpenHands Cloud Settings page](https://app.all-hands.dev/settings)
4. Click "Save Settings"

## Usage

### For GitHub Repositories

1. Navigate to any GitHub repository
2. Look for the "Launch in OpenHands" button next to the Star/Fork buttons
3. Click the button to start a new OpenHands conversation for this repository

### For GitHub Pull Requests

1. Navigate to any GitHub pull request
2. Look for the "Launch in OpenHands" button in the PR header
3. Click the button to start a new OpenHands conversation for this PR
4. The extension will automatically detect if the PR is from a forked repository and use the appropriate repository for context

## How It Works

The extension uses the [OpenHands Cloud API](https://docs.all-hands.dev/modules/usage/cloud/cloud-api) to start new conversations. When you click the "Launch in OpenHands" button:

1. For repositories: It starts a conversation with the repository context
2. For pull requests: It starts a conversation with instructions to check out the PR branch, read the git diff, and understand the purpose of the PR

## Development

### Project Structure

- `manifest.json`: Extension configuration
- `content.js`: Content script that injects the button into GitHub pages
- `background.js`: Background script for API communication
- `options.html/js`: Settings page for API key configuration
- `popup.html/js`: Extension popup UI
- `styles.css`: Styles for the injected button

### Building

No build step is required for this extension. You can load it directly as an unpacked extension in Chrome.

## License

MIT