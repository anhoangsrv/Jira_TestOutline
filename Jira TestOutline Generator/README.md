# AutoTestOutline Chrome Extension

A Chrome extension (Manifest V3) for automatically extracting content from Jira XML pages and generating test outlines using AI.

## Features

- Extract content from Jira XML pages
- Process and summarize HTML content with proper formatting
- Generate test outlines using AI API
- Edit and save generated results
- Copy results to clipboard
- Responsive design with dual-panel layout

## Architecture

### Core Files

- `manifest.json` - Extension configuration and permissions
- `config.js` - Centralized configuration constants
- `background.js` - Service worker for API calls and message handling

### Popup Interface

- `popup/popup.html` - Main popup interface
- `popup/popup.js` - Main popup logic and XML extraction
- `popup/popup.css` - Popup styling
- `popup/utils.js` - Utility functions for API calls and storage
- `popup/htmlProcessor.js` - HTML content processing and summarization

### Results Interface

- `popup/result.html` - Results display page
- `popup/result.js` - Results page logic with editing capabilities

### AI Configuration

- `prompt-template.js` - AI prompt templates for test case generation

## Data Flow

1. **User Action**: Click "Generate Test Outline" in popup
2. **Content Extraction**: Extract XML content from current tab using `chrome.scripting.executeScript`
3. **Content Processing**: Parse XML and summarize HTML content in `htmlProcessor.js`
4. **Storage**: Save processed content to `chrome.storage.local`
5. **AI Processing**: Send content to AI API via background service worker
6. **Results Display**: Open results page showing both Jira content and AI-generated test outline

## Configuration

All configuration is centralized in `config.js`:

- API endpoints and credentials
- Storage keys
- UI messages
- Performance settings

## Storage Keys

- `jiraContent` - Text version of processed content
- `jiraContentHtml` - HTML version of processed content  
- `aiResult` - AI-generated test outline
- `customPromptTemplate` - Custom prompt template (optional)

## Development

### Setup
1. Clone the repository
2. Open Chrome → Extensions → Developer Mode
3. Click "Load unpacked" and select the project folder

### Debugging
- **Popup**: Right-click popup → Inspect → Console
- **Background**: Extensions page → Service worker → Inspect

### Code Organization

The codebase is organized for maintainability:

- **Separation of Concerns**: HTML processing, API calls, and UI logic are in separate modules
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Performance**: Optimized DOM operations and async processing
- **Modularity**: ES6 modules for better code organization

## Performance Optimizations

- **Timeout Support**: API calls include timeout handling
- **Retry Logic**: Storage operations include retry mechanisms
- **DOM Optimization**: Efficient HTML processing with minimal DOM manipulation
- **Memory Management**: Proper cleanup and resource management

## Error Handling

- Network connectivity issues
- API timeouts and failures
- Extension context invalidation
- Storage operation failures
- XML parsing errors

## Browser Compatibility

- Chrome 88+ (Manifest V3 support)
- Edge 88+ (Chromium-based)

## Security

- API credentials are configurable
- Content Security Policy compliant
- Minimal permissions required

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
