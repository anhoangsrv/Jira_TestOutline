/**
 * Utility functions for AutoTestOutline Extension
 */

import { DEFAULT_PROMPT_TEMPLATE } from '../prompt-template.js';
import { API_CONFIG, STORAGE_KEYS, PERFORMANCE, UI_MESSAGES } from '../config.js';

/**
 * Sanitize filename for safe file operations
 */
export function sanitizeFileName(input) {
  return input
    .replace(/[\\/:*?"<>|\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, PERFORMANCE.FILENAME_MAX_LENGTH);
}

/**
 * Get prompt template from storage or default
 */
export async function getPromptTemplate() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.CUSTOM_PROMPT_TEMPLATE]);
    return result[STORAGE_KEYS.CUSTOM_PROMPT_TEMPLATE] || DEFAULT_PROMPT_TEMPLATE;
  } catch (error) {
    console.warn('Could not load custom prompt, using default:', error);
    return DEFAULT_PROMPT_TEMPLATE;
  }
}

/**
 * Build prompt by replacing template placeholders
 */
export function buildPrompt(template, data) {
  let content = '';
  
  if (data.titles && Array.isArray(data.titles)) {
    content = data.titles
      .map(title => title.text || '')
      .filter(text => text.trim())
      .join('\n');
  }
  
  return template.replace('{CONTENT}', content);
}

/**
 * Call AI API with error handling and retry logic
 */
export async function callAIApi(data) {
  const template = await getPromptTemplate();
  const prompt = buildPrompt(template, data);
  
  const payload = {
    prompt,
    gauss_token: API_CONFIG.TOKEN,
    model_id: API_CONFIG.MODEL_ID,
    user_id: API_CONFIG.USER_ID
  };

  try {
    console.log('Sending request to AI API via background script');
    
    const response = await chrome.runtime.sendMessage({
      action: 'callAIApi',
      payload
    });

    if (!response?.success) {
      const errorMsg = response?.error || 'Unknown error from background script';
      console.error('Background script error:', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Received response from AI API:', response.data);
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error('AI API error:', error);
    
    // Handle specific error types
    if (error.message.includes('Extension context invalidated')) {
      throw new Error(UI_MESSAGES.ERROR_EXTENSION_CONTEXT);
    }
    
    if (error.message.includes('Could not establish connection')) {
      throw new Error(UI_MESSAGES.ERROR_CONNECTION);
    }
    
    throw new Error(`AI API call error: ${error.message}`);
  }
}

/**
 * Storage utilities with error handling
 */
export async function saveToStorage(key, content) {
  try {
    await chrome.storage.local.set({ [key]: content });
    console.log(`Content saved to storage with key: ${key}`);
  } catch (error) {
    console.error('Error saving to storage:', error);
    throw error;
  }
}

export async function readFromStorage(key) {
  try {
    const result = await chrome.storage.local.get([key]);
    return result[key] || '';
  } catch (error) {
    console.error('Error reading from storage:', error);
    return '';
  }
}

/**
 * Get data from storage with retry mechanism
 */
export async function getDataFromStorage(keys, maxRetries = PERFORMANCE.MAX_RETRIES, retryDelay = PERFORMANCE.RETRY_DELAY) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await chrome.storage.local.get(keys);
    
    // Check if we have the required data
    const hasRequiredData = keys.some(key => result[key]);
    if (hasRequiredData) {
      return result;
    }
    
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return await chrome.storage.local.get(keys);
}
