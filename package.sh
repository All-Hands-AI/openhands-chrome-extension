#!/bin/bash

# Script to package the OpenHands Chrome Extension for distribution

# Create a zip file of the extension
echo "Creating extension package..."

# Create a temporary directory for the package
mkdir -p dist

# Create the zip file
zip -r dist/openhands-chrome-extension-v1.2.zip \
  manifest.json \
  background.js \
  content-bundle.js \
  options.html \
  options.js \
  popup.html \
  popup.js \
  styles.css \
  images/

echo "Package created at dist/openhands-chrome-extension-v1.2.zip"
echo "You can now upload this file to the Chrome Web Store."