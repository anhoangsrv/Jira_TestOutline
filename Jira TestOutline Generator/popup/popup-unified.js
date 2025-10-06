/**
 * AutoTestOutline Popup - Unified Implementation
 * 
 * ARCHITECTURE OVERVIEW:
 * This file uses a hybrid approach to solve ES6 module compatibility issues in Chrome extensions:
 * 1. Feature flag controls whether to use ES6 modules or inline functions
 * 2. Inline functions provide fallback when modules fail
 * 3. Same interface regardless of which approach is used
 * 
 * MAINTENANCE NOTES:
 * - Set USE_ES6_MODULES = true for development (cleaner debugging)
 * - Set USE_ES6_MODULES = false for production (reliability)
 * - Inline functions should mirror the module versions exactly
 * - Update both places when making changes to core functionality
 */

// =============================================================================
// CONFIGURATION & FEATURE FLAGS
// =============================================================================

/**
 * Feature flag: Controls module loading strategy
 * - true: Try ES6 modules first, fallback to inline if failed
 * - false: Use inline functions directly (production recommended)
 */
const USE_ES6_MODULES = false;

/**
 * Global configuration object
 * Contains all constants needed for the extension to function
 * This ensures we have a fallback even if config.js fails to load
 */
const CONFIG = {
  // API Configuration - matches config.js API_CONFIG
  API_URL: 'http://107.98.160.92:8910/gauss/chat',
  API_TOKEN: '40072b14eb43f10ab1c03f32d1cce829842be1b5',
  MODEL_ID: 'Gauss2.2-37B-Instruct-250515',
  USER_ID: 'ngoc.dh',
  API_TIMEOUT: 30000,

  // Storage Keys - matches config.js STORAGE_KEYS
  STORAGE_KEYS: {
    JIRA_CONTENT: 'jiraContent',
    JIRA_CONTENT_HTML: 'jiraContentHtml',
    AI_RESULT: 'aiResult',
    CUSTOM_PROMPT_TEMPLATE: 'customPromptTemplate'
  },

  // UI Messages - matches config.js UI_MESSAGES
  UI_MESSAGES: {
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
  }
};

// =============================================================================
// INLINE UTILITY FUNCTIONS (ALWAYS AVAILABLE)
// =============================================================================

/**
 * Extract description content from Jira XML
 * Mirrors: htmlProcessor.js -> extractDescriptionContent()
 * 
 * @param {string} xml - Raw XML content from Jira page
 * @returns {string} - HTML content from description tag
 * @throws {Error} - If XML structure is invalid
 */
function extractDescriptionContent(xml) {
  console.log('📄 Extracting description content from XML...');
  
  // Find the main item container
  const itemStart = xml.indexOf('<item>');
  const itemEnd = xml.indexOf('</item>');
  
  if (itemStart === -1 || itemEnd === -1) {
    throw new Error('Cannot find item tag in XML');
  }
  
  // Extract item content
  const itemContent = xml.substring(itemStart, itemEnd);
  
  // Find description within item
  const descStart = itemContent.indexOf('<description>');
  const descEnd = itemContent.indexOf('</description>');
  
  if (descStart === -1 || descEnd === -1) {
    throw new Error('Cannot find description tag in XML');
  }
  
  const description = itemContent.substring(descStart + 13, descEnd);
  console.log('✅ Description extracted successfully');
  return description;
}

/**
 * Extract link from Jira XML  
 * Mirrors: htmlProcessor.js -> extractLinkFromXml()
 */
function extractLinkFromXml(xml) {
  const linkStart = xml.indexOf('<link>');
  const linkEnd = xml.indexOf('</link>');
  
  if (linkStart === -1 || linkEnd === -1) {
    return '';
  }
  
  return xml.substring(linkStart + 6, linkEnd);
}

/**
 * Extract ID from Jira link
 * Mirrors: htmlProcessor.js -> extractIdFromLink()
 */
function extractIdFromLink(link) {
  const match = link.match(/\/([A-Z]+-\d+)(?:\?.*)?$/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Fallback: sanitize the entire link
  return link.replace(/[:\/\?#\[\\\]@!\$&'\(\)\*\+,;=]/g, '_');
}

/**
 * Basic HTML content processing for inline fallback
 * Simplified version of htmlProcessor.js -> summarizeHtmlContent()
 * 
 * @param {string} html - Raw HTML content
 * @returns {object} - {html: string, text: string}
 */
function processHtmlContent(html) {
  console.log('🔄 Processing HTML content...');
  
  // Create temporary DOM element for text extraction
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Extract plain text
  const text = div.textContent || div.innerText || '';
  
  console.log('✅ HTML processed successfully');
  return {
    html: html,
    text: text.trim()
  };
}

/**
 * Save content to Chrome storage with error handling
 * Mirrors: utils.js -> saveToStorage()
 * 
 * @param {string} key - Storage key
 * @param {any} content - Content to save
 * @returns {Promise<void>}
 */
async function saveToStorage(key, content) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: content }, () => {
      if (chrome.runtime.lastError) {
        console.error('❌ Storage error:', chrome.runtime.lastError);
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        console.log(`✅ Saved to storage: ${key}`);
        resolve();
      }
    });
  });
}

/**
 * Call AI API via background script
 * Mirrors: utils.js -> callAIApi()
 * 
 * @param {object} data - Data to send to AI
 * @returns {Promise<object>} - AI response
 */
async function callAIApi(data) {
  console.log('🤖 Calling AI API...');
  
  // Build simple prompt (inline version of buildPrompt)
  let content = '';
  if (data.titles && Array.isArray(data.titles)) {
    content = data.titles
      .map(title => title.text || '')
      .filter(text => text.trim())
      .join('\n');
  }
  
  const prompt = `You are an experienced software testing professional. Generate test cases for this Jira content: ${content}`;
  
  // Prepare payload for background script
  const payload = {
    prompt: prompt,
    gauss_token: CONFIG.API_TOKEN,
    model_id: CONFIG.MODEL_ID,
    user_id: CONFIG.USER_ID
  };

  // Send message to background script
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: 'callAIApi',
      payload: payload
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Runtime error:', chrome.runtime.lastError);
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!response || !response.success) {
        const errorMsg = response?.error || 'Unknown error from background script';
        console.error('❌ Background script error:', errorMsg);
        reject(new Error(errorMsg));
      } else {
        console.log('✅ AI API call successful');
        resolve({ success: true, data: response.data });
      }
    });
  });
}

// =============================================================================
// MODULE LOADING SYSTEM
// =============================================================================

/**
 * Dynamic module loader with fallback strategy
 * This function attempts to load ES6 modules and gracefully falls back to inline functions
 * 
 * @returns {Promise<object>} - Object containing all required functions
 */
async function loadModules() {
  console.log(`🔧 Module loading strategy: ${USE_ES6_MODULES ? 'ES6 modules' : 'inline functions'}`);
  
  // If ES6 modules are enabled, try to load them
  if (USE_ES6_MODULES) {
    try {
      console.log('📦 Attempting to load ES6 modules...');
      
      // Dynamic imports - these may fail in Chrome extension popup context
      const [utils, htmlProcessor, config] = await Promise.all([
        import('./utils.js'),
        import('./htmlProcessor.js'), 
        import('../config.js')
      ]);
      
      console.log('✅ ES6 modules loaded successfully');
      
      // Return module functions with config overrides
      return {
        // Functions from utils.js
        callAIApi: utils.callAIApi,
        saveToStorage: utils.saveToStorage,
        
        // Functions from htmlProcessor.js  
        extractDescriptionContent: htmlProcessor.extractDescriptionContent,
        extractLinkFromXml: htmlProcessor.extractLinkFromXml,
        extractIdFromLink: htmlProcessor.extractIdFromLink,
        summarizeHtmlContent: htmlProcessor.summarizeHtmlContent,
        
        // Configuration from config.js
        API_CONFIG: config.API_CONFIG,
        STORAGE_KEYS: config.STORAGE_KEYS,
        UI_MESSAGES: config.UI_MESSAGES,
        
        // Indicate we're using modules
        usingModules: true
      };
      
    } catch (error) {
      console.warn('⚠️ ES6 modules failed to load, falling back to inline functions:', error);
      // Continue to fallback below
    }
  }
  
  // Fallback: Return inline functions
  console.log('🔄 Using inline functions');
  return {
    // Inline function implementations
    callAIApi,
    saveToStorage,
    extractDescriptionContent,
    extractLinkFromXml, 
    extractIdFromLink,
    summarizeHtmlContent: processHtmlContent, // Use simplified version
    
    // Configuration from CONFIG constant
    API_CONFIG: {
      URL: CONFIG.API_URL,
      TOKEN: CONFIG.API_TOKEN,
      MODEL_ID: CONFIG.MODEL_ID,
      USER_ID: CONFIG.USER_ID,
      TIMEOUT: CONFIG.API_TIMEOUT
    },
    STORAGE_KEYS: CONFIG.STORAGE_KEYS,
    UI_MESSAGES: CONFIG.UI_MESSAGES,
    
    // Indicate we're using inline functions
    usingModules: false
  };
}

// =============================================================================
// UI MANAGEMENT
// =============================================================================

/**
 * Update UI with status message and appropriate styling
 * Provides visual feedback for each step of the process
 * 
 * @param {string} message - Message to display
 * @param {string} type - Message type: 'info', 'loading', 'success', 'error', 'warning'
 */
function updateUI(message, type = 'info') {
  console.log(`📢 UI Update: ${type} - ${message}`);
  
  const outputDiv = document.getElementById("output");
  if (!outputDiv) {
    console.error("❌ Output div not found!");
    return;
  }
  
  // Define styles and icons for different message types
  let style, icon;
  switch(type) {
    case 'error':
      style = "padding: 12px; background: #ffebee; border-radius: 6px; border-left: 4px solid #f44336; color: #c62828; font-size: 13px;";
      icon = "❌";
      break;
    case 'success':
      style = "padding: 12px; background: #e8f5e8; border-radius: 6px; border-left: 4px solid #4caf50; color: #2e7d32; font-size: 13px;";
      icon = "✅";
      break;
    case 'warning':
      style = "padding: 12px; background: #fff3e0; border-radius: 6px; border-left: 4px solid #ff9800; color: #ef6c00; font-size: 13px;";
      icon = "⚠️";
      break;
    case 'loading':
      style = "padding: 12px; background: #e3f2fd; border-radius: 6px; border-left: 4px solid #2196f3; color: #1565c0; font-size: 13px;";
      icon = "🔄";
      break;
    default: // 'info'
      style = "padding: 12px; background: #f5f5f5; border-radius: 6px; border-left: 4px solid #757575; font-size: 13px;";
      icon = "ℹ️";
  }
  
  // Update the UI with styled message
  if (type === 'error') {
    outputDiv.innerHTML = `<div style="${style}">${icon} <strong>Error:</strong> ${message}<br><small>Please try again or check the console for details</small></div>`;
  } else {
    outputDiv.innerHTML = `<div style="${style}">${icon} ${message}</div>`;
  }
}

// =============================================================================
// CORE BUSINESS LOGIC
// =============================================================================

/**
 * Extract Jira XML content from current page
 * This function runs in the context of the current tab
 * 
 * @returns {string} - Raw XML content
 * @throws {Error} - If page is not XML or content unavailable
 */
async function getJiraXmlContent() {
  // Verify this is an XML page
  if (!document.contentType || !document.contentType.includes('xml')) {
    throw new Error('Current page is not an XML page');
  }
  
  // Return the entire document as XML string
  return document.documentElement.outerHTML;
}

/**
 * Validate tab access permissions
 * Ensures we can access the current tab and it's not a restricted page
 * 
 * @param {object} tab - Chrome tab object
 * @throws {Error} - If tab is invalid or restricted
 */
function validateTabAccess(tab, UI_MESSAGES) {
  if (!tab?.id) {
    throw new Error(UI_MESSAGES.ERROR_NO_TAB);
  }
  
  // Check for restricted protocols
  const restrictedProtocols = ['chrome://', 'edge://', 'extension://'];
  if (restrictedProtocols.some(protocol => tab.url.startsWith(protocol))) {
    throw new Error(UI_MESSAGES.ERROR_RESTRICTED_PAGE);
  }
}

/**
 * Extract content from current Jira tab
 * Coordinates the XML extraction process
 * 
 * @param {object} modules - Module functions object
 * @returns {Promise<string>} - Raw XML content
 */
async function extractJiraContent(modules) {
  console.log('🔍 Getting current tab...');
  
  // Get the current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  validateTabAccess(tab, modules.UI_MESSAGES);

  console.log('📄 Executing XML extraction script on tab:', tab.id);
  
  // Inject and execute the XML extraction function
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: getJiraXmlContent
  });

  // Validate the extraction results
  if (!results?.[0]?.result) {
    throw new Error(modules.UI_MESSAGES.ERROR_NO_XML);
  }

  console.log('✅ XML content extracted successfully');
  return results[0].result;
}

/**
 * Process XML content and extract relevant information
 * Orchestrates the content processing pipeline
 * 
 * @param {string} xmlContent - Raw XML from Jira
 * @param {object} modules - Module functions object  
 * @returns {object} - Processed content with metadata
 */
function processXmlContent(xmlContent, modules) {
  console.log('🔄 Processing XML content...');

  // Extract link and generate ID
  const link = modules.extractLinkFromXml(xmlContent);
  console.log('🔗 Extracted link from XML:', link);
  
  const id = modules.extractIdFromLink(link);
  console.log('🆔 Generated ID from link:', id);
  
  // Extract and process description HTML
  const descriptionHtml = modules.extractDescriptionContent(xmlContent);
  console.log('📝 Extracted HTML content from description tag');
  
  // Summarize the content (use appropriate function based on module type)
  const summarizedContent = modules.summarizeHtmlContent(descriptionHtml);
  console.log('� Content summarized successfully');

  return { summarizedContent, id, link };
}

/**
 * Generate AI result from processed content
 * Handles the AI API call and response processing
 * 
 * @param {object} summarizedContent - Processed content object
 * @param {object} modules - Module functions object
 * @returns {Promise<string>} - Formatted AI response
 */
async function generateAIResult(summarizedContent, modules) {
  console.log('🤖 Preparing AI request...');
  
  // Prepare content in the format expected by AI API
  const content = {
    titles: [{ text: summarizedContent.text }]
  };
  
  // Call AI API
  const aiResult = await modules.callAIApi(content);
  
  // Process AI response data
  let resultText;
  const { data } = aiResult;
  
  if (typeof data === 'string') {
    resultText = data;
  } else if (typeof data === 'object' && data !== null) {
    resultText = JSON.stringify(data, null, 2);
  } else {
    resultText = String(data);
  }
  
  // Clean up escape sequences
  return resultText.replace(/\\n/g, '\n');
}

/**
 * Open results page in new tab
 * Creates a new tab to display the results
 * 
 * @param {object} modules - Module functions object
 */
async function openResultsPage(modules) {
  console.log('🚀 Opening results page...');
  
  // Get the result page URL
  const resultUrl = chrome.runtime.getURL('popup/result.html');
  
  // Open in new tab
  await chrome.tabs.create({ url: resultUrl });
  
  console.log('✅ Results page opened successfully');
}

// =============================================================================
// MAIN EXECUTION FUNCTION
// =============================================================================

/**
 * Main function to handle test outline generation
 * Orchestrates the entire workflow from XML extraction to result display
 * 
 * This is the entry point for the extension's core functionality
 */
async function handleGenerateTestOutline() {
  console.log("🚀 Starting test outline generation workflow");
  
  // Prevent multiple simultaneous executions
  if (window.isGenerating) {
    updateUI("Please wait, generation already in progress...", 'warning');
    return;
  }
  
  window.isGenerating = true;
  
  try {
    // STEP 1: Initialize modules
    updateUI("Initializing extension modules...", 'loading');
    console.log("📦 Loading required modules...");
    
    const modules = await loadModules();
    console.log(`✅ Modules loaded (using ${modules.usingModules ? 'ES6 modules' : 'inline functions'})`);
    
    // STEP 2: Extract XML content from current tab
    updateUI(modules.UI_MESSAGES.EXTRACTING, 'loading');
    console.log("📄 Starting XML content extraction...");
    
    const xmlContent = await extractJiraContent(modules);
    console.log("✅ XML content extracted successfully");
    
    // STEP 3: Process the XML content
    updateUI("Processing Jira content...", 'loading');
    console.log("🔄 Processing XML content...");
    
    const { summarizedContent, id, link } = processXmlContent(xmlContent, modules);
    console.log("✅ Content processed successfully");
    
    // STEP 4: Save processed content to storage
    updateUI("Saving content to storage...", 'loading');
    console.log("💾 Saving content to Chrome storage...");
    
    await modules.saveToStorage(modules.STORAGE_KEYS.JIRA_CONTENT, summarizedContent.text);
    await modules.saveToStorage(modules.STORAGE_KEYS.JIRA_CONTENT_HTML, summarizedContent.html);
    console.log("✅ Content saved to storage");
    
    // STEP 5: Generate AI result
    updateUI(modules.UI_MESSAGES.PROCESSING, 'loading');
    console.log("🤖 Generating AI test outline...");
    
    const aiResultText = await generateAIResult(summarizedContent, modules);
    console.log("✅ AI result generated successfully");
    
    // STEP 6: Save AI result to storage
    updateUI("Saving AI results...", 'loading');
    console.log("💾 Saving AI result to storage...");
    
    await modules.saveToStorage(modules.STORAGE_KEYS.AI_RESULT, aiResultText);
    console.log("✅ AI result saved to storage");
    
    // STEP 7: Open results page
    updateUI("Opening results page...", 'loading');
    await openResultsPage(modules);
    
    // STEP 8: Show success message
    updateUI(modules.UI_MESSAGES.SUCCESS, 'success');
    console.log("🎉 Test outline generation completed successfully!");
    
  } catch (error) {
    // Handle all errors with appropriate user feedback
    console.error('❌ Test outline generation failed:', error);
    
    let errorMessage = error.message;
    
    // Provide user-friendly error messages for common issues
    if (error.message.includes('Extension context invalidated')) {
      errorMessage = 'Extension has been reloaded. Please refresh the page and try again.';
    } else if (error.message.includes('Could not establish connection')) {
      errorMessage = 'Cannot connect to AI service. Please check your internet connection.';
    } else if (error.message.includes('not an XML page')) {
      errorMessage = 'Please navigate to a Jira XML page first.';
    }
    
    updateUI(errorMessage, 'error');
    
  } finally {
    // Always reset the generation flag
    window.isGenerating = false;
  }
}

// =============================================================================
// INITIALIZATION & EVENT SETUP
// =============================================================================

/**
 * Setup event listeners and initialize the popup
 * This function runs when the DOM is ready
 */
function initializePopup() {
  console.log("🔄 Initializing AutoTestOutline popup...");
  
  // Get required DOM elements
  const generateButton = document.getElementById("generateTestOutline");
  const outputDiv = document.getElementById("output");
  
  // Validate DOM elements exist
  if (!generateButton) {
    console.error("❌ Generate button not found!");
    return;
  }
  
  if (!outputDiv) {
    console.error("❌ Output div not found!");
    return;
  }
  
  // Show initial ready message
  updateUI("Extension loaded successfully! Ready to generate test outline.", 'success');
  
  // Setup click handler for the generate button
  generateButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent any default behavior
    console.log("🎯 Generate button clicked");
    
    // Execute the main workflow
    await handleGenerateTestOutline();
  });
  
  console.log("✅ AutoTestOutline popup initialized successfully");
}

// =============================================================================
// STARTUP SEQUENCE
// =============================================================================

// Wait for DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', () => {
  console.log("📋 DOM loaded, starting popup initialization...");
  initializePopup();
});

// Fallback initialization for cases where DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  console.log("📋 DOM already loaded, initializing immediately...");
  setTimeout(initializePopup, 100);
}

// Global error handler for debugging
window.addEventListener('error', (event) => {
  console.error('🚨 Global error caught:', event.error);
});

console.log("🔧 AutoTestOutline popup script loaded successfully");