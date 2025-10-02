export function sanitizeFileName(input) {
  const replaced = input
    .replace(/[\\/:*?"<>|\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return replaced.slice(0, 80);
}

import { DEFAULT_PROMPT_TEMPLATE } from '../prompt-template.js';

export async function getPromptTemplate() {
  try {
    const result = await chrome.storage.local.get(['customPromptTemplate']);
    return result.customPromptTemplate || DEFAULT_PROMPT_TEMPLATE;
  } catch (error) {
    console.warn('Could not load custom prompt, using default:', error);
    return DEFAULT_PROMPT_TEMPLATE;
  }
}

export function buildPrompt(template, data) {
  let content = '';
  if (data.titles && Array.isArray(data.titles)) {
    data.titles.forEach(title => {
      if (title.text) {
        content += title.text + '\n';
      }
    });
  }
  
  return template.replace('{CONTENT}', content);
}

export async function callAIApi(data) {
  const template = await getPromptTemplate();
  const prompt = buildPrompt(template, data);
  
  const payload = {
    "prompt": prompt,
    "gauss_token": "40072b14eb43f10ab1c03f32d1cce829842be1b5",
    "model_id": "Gauss2.2-37B-Instruct-250515",
    "user_id": "ngoc.dh"
  };

  try {
    console.log('Sending request to AI API via background script:', payload);
    
    const response = await chrome.runtime.sendMessage({
      action: 'callAIApi',
      payload: payload
    });

    console.log('Response from background script:', response);

    if (!response || !response.success) {
      const errorMsg = response?.error || 'Unknown error from background script';
      console.error('Background script error:', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Received response from AI API:', response.data);
    
    return { 
      success: true, 
      data: response.data
    };
  } catch (error) {
    console.error('AI API error:', error);
    
    if (error.message.includes('Extension context invalidated')) {
      throw new Error('Extension has been reloaded. Please refresh the page and try again.');
    }
    
    if (error.message.includes('Could not establish connection')) {
      throw new Error('Connection error: Cannot connect to AI API. Check network connection and API URL.');
    }
    
    throw new Error(`AI API call error: ${error.message}`);
  }
}
