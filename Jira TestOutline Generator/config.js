/**
 * Configuration constants for AutoTestOutline Extension
 */

// API Configuration
export const API_CONFIG = {
  URL: 'http://107.98.160.92:8910/gauss/chat',
  TOKEN: '40072b14eb43f10ab1c03f32d1cce829842be1b5',
  MODEL_ID: 'Gauss2.2-37B-Instruct-250515',
  USER_ID: 'ngoc.dh',
  TIMEOUT: 30000 // 30 seconds
};

// Storage Keys
export const STORAGE_KEYS = {
  JIRA_CONTENT: 'jiraContent',
  JIRA_CONTENT_HTML: 'jiraContentHtml',
  AI_RESULT: 'aiResult',
  CUSTOM_PROMPT_TEMPLATE: 'customPromptTemplate'
};

// UI Messages
export const UI_MESSAGES = {
  EXTRACTING: '🔄 Extracting content from Jira XML page...',
  PROCESSING: '🤖 Sending data to AI to generate Test Outline...',
  SUCCESS: '✅ Test Outline generated successfully!',
  ERROR_NO_TAB: 'Cannot access this web page. Please refresh the page.',
  ERROR_RESTRICTED_PAGE: 'Extension cannot access this page. Please try on a regular web page.',
  ERROR_NO_XML: 'Cannot extract XML content from web page. Please check extension permissions.',
  ERROR_API: 'AI API Error: Check network connection and API configuration',
  ERROR_NETWORK: 'Network error - Server unavailable or blocked by firewall. Check network connection and security settings.',
  ERROR_EXTENSION_CONTEXT: 'Extension has been reloaded. Please refresh the page and try again.',
  ERROR_CONNECTION: 'Connection error: Cannot connect to AI API. Check network connection and API URL.'
};

// Performance Settings
export const PERFORMANCE = {
  MAX_RETRIES: 5,
  RETRY_DELAY: 500,
  FILENAME_MAX_LENGTH: 80
};

// HTML Processing Settings
export const HTML_PROCESSING = {
  MAX_HEADING_LEVELS: 6,
  TABLE_MIN_WIDTH: '100px',
  IMAGE_MAX_WIDTH: '100%'
};