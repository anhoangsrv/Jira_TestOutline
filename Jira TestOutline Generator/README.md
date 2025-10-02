# AutoTestOutline Extension

A Chrome extension that automatically extracts content from Jira XML pages and generates test outlines using AI.

## Features

1. **AI-powered Test Outline Generation**: Extracts content from the current Jira XML page and uses AI to generate test outlines.
2. **Extracted Content Display**: Extracts and displays content from the description tag of the Jira XML page.
3. **Chrome Storage Data Storage**: Data is stored in Chrome Storage to display results without saving files to the computer.

## Usage Guide

### Generate Test Outline with AI

1. Open the extension on a Jira XML page.
2. Click the **"Generate Test Outline"** button.
3. The extension will extract content from the description tag of the Jira XML page and send it to AI to generate a test outline.
4. The results will be displayed on a new page with two columns: extracted content and AI results.

## System Requirements

- Google Chrome or Chromium-compatible browser
- Internet connection to use the AI API
- Jira XML web page for content extraction

## Development Notes

- The extension extracts content directly from the current Jira XML page instead of from an integrated XML file.
- The XML extraction function can process basic HTML tags and retain text structure.
- Results are stored in Chrome Storage and displayed on the web page instead of being saved to the computer.
