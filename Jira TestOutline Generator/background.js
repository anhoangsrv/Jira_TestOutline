import { API_CONFIG, UI_MESSAGES } from './config.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log("AutoTestOutline extension installed.");
  testApiConnection();
});

/**
 * Test API connection on extension startup
 */
async function testApiConnection() {
  console.log('Testing API connection...');
  
  const testPayload = {
    prompt: "Hello",
    gauss_token: API_CONFIG.TOKEN,
    model_id: API_CONFIG.MODEL_ID,
    user_id: API_CONFIG.USER_ID
  };
  
  try {
    console.log('Sending test request to:', API_CONFIG.URL);
    const response = await fetchWithTimeout(API_CONFIG.URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    }, API_CONFIG.TIMEOUT);
    
    console.log('API Test - Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API test successful:', data);
    } else {
      const errorText = await response.text();
      console.error('API test failed:', response.status, response.statusText, errorText);
    }
  } catch (error) {
    console.error('API test error:', error.message);
    logNetworkErrorDetails(error);
  }
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Log detailed network error information
 */
function logNetworkErrorDetails(error) {
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    console.error('Network error - possible causes:');
    console.error('1. Server unavailable');
    console.error('2. Firewall blocking connection');
    console.error('3. CORS policy');
    console.error('4. Mixed content (HTTP from HTTPS context)');
  }
}

/**
 * Handle messages from popup and content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);
  
  if (request.action === 'callAIApi') {
    handleAIApiCall(request.payload, sendResponse);
    return true; // Keep message channel open for async response
  }
});

/**
 * Handle AI API call with proper error handling
 */
async function handleAIApiCall(payload, sendResponse) {
  try {
    console.log('Calling AI API with payload:', payload);
    
    const response = await fetchWithTimeout(API_CONFIG.URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, API_CONFIG.TIMEOUT);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    // Try to parse as JSON, fallback to text
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed JSON response:', data);
    } catch (e) {
      console.log('Response is not JSON, returning as text');
      data = responseText;
    }
    
    sendResponse({ success: true, data });
    
  } catch (error) {
    console.error('AI API call failed:', error.message);
    
    let errorMessage = error.message;
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = UI_MESSAGES.ERROR_NETWORK;
    } else if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - Please try again';
    }
    
    sendResponse({ success: false, error: errorMessage });
  }
}
