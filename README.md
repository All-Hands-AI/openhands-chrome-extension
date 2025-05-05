# OpenHands GitHub Launcher

A Chrome extension that adds a "Launch in OpenHands" button to GitHub repositories and pull requests, allowing you to start an OpenHands conversation with one click.

## Features

- Adds a "Launch with OpenHands" dropdown menu to GitHub repository pages (next to Star/Fork buttons)
- Adds a "Launch with OpenHands" dropdown menu to GitHub pull request pages
- Adds a "Launch with OpenHands" dropdown menu to GitHub issue pages
- Context-aware dropdown options for repositories, PRs, and issues
- Automatically detects if a PR is from a forked repository
- Configurable via options page to set your OpenHands API key

### Repository Page Options
- New conversation for the repository
- Learn about this codebase
- Add a repo.md microagent (if none exists)
- Add setup.sh (if none exists)

### Pull Request Page Options
- New conversation for the PR
- Fix failing GitHub actions (if there are failures)
- Resolve merge conflicts (if there are any)
- Address code review feedback (if there is any)

### Issue Page Options
- Investigate the issue
- Solve the issue

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
2. Look for the "Launch with OpenHands" dropdown menu next to the Star/Fork buttons
3. Click the main button to start a new OpenHands conversation for this repository
4. Or click the dropdown arrow to see additional options:
   - "New conversation for $ORG/$REPO" - Start a general conversation about the repository
   - "Learn about this codebase" - Get an overview of the repository structure and purpose
   - "Add a repo.md microagent" - Create a repo.md file with repository documentation (if none exists)
   - "Add setup.sh" - Create a setup script for the repository (if none exists)

### For GitHub Pull Requests

1. Navigate to any GitHub pull request
2. Look for the "Launch with OpenHands" dropdown menu in the PR header
3. Click the main button to start a new OpenHands conversation for this PR
4. Or click the dropdown arrow to see additional options:
   - "New conversation for PR #123" - Start a general conversation about the PR
   - "Fix failing GitHub actions" - Get help fixing failing CI/CD workflows (if there are failures)
   - "Resolve merge conflicts" - Get help resolving merge conflicts (if there are any)
   - "Address code review feedback" - Get help addressing code review comments (if there are any)
5. The extension will automatically detect if the PR is from a forked repository and use the appropriate repository for context

### For GitHub Issues

1. Navigate to any GitHub issue
2. Look for the "Launch with OpenHands" dropdown menu in the issue header
3. Click the main button to investigate the issue
4. Or click the dropdown arrow to see additional options:
   - "Investigate Issue #123" - Analyze the issue and suggest approaches
   - "Solve Issue #123" - Get help implementing a solution for the issue

## How It Works

The extension uses the [OpenHands Cloud API](https://docs.all-hands.dev/modules/usage/cloud/cloud-api) to start new conversations. When you click the "Launch with OpenHands" button or select an option from the dropdown:

1. For repositories:
   - Default action: Starts a general conversation with the repository context
   - "Learn about this codebase": Starts a conversation focused on understanding the repository structure
   - "Add a repo.md microagent": Starts a conversation to help create a repo.md file
   - "Add setup.sh": Starts a conversation to help create a setup.sh script

2. For pull requests:
   - Default action: Starts a conversation with instructions to check out the PR branch, read the git diff, and understand the purpose of the PR
   - "Fix failing GitHub actions": Starts a conversation focused on fixing CI/CD issues
   - "Resolve merge conflicts": Starts a conversation focused on resolving merge conflicts
   - "Address code review feedback": Starts a conversation focused on addressing review comments

3. For issues:
   - Default action: Starts a conversation to investigate the issue
   - "Investigate Issue #123": Starts a conversation to analyze the issue and suggest approaches
   - "Solve Issue #123": Starts a conversation to implement a solution for the issue

The extension intelligently detects the context (repository, PR, or issue) and shows only relevant options in the dropdown menu.

## Development

### Project Structure

- `manifest.json`: Extension configuration
- `content.js`: Content script that injects the dropdown menu into GitHub pages
- `background.js`: Background script for API communication
- `options.html/js`: Settings page for API key configuration
- `popup.html/js`: Extension popup UI
- `styles.css`: Styles for the injected dropdown menu and buttons
- `images/`: Directory containing extension icons and logos

### Building

No build step is required for this extension. You can load it directly as an unpacked extension in Chrome.

## License

MIT