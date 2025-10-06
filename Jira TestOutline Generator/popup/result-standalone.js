/**
 * Result Page Script - Standalone version without ES6 modules
 */

// Configuration
const STORAGE_KEYS = {
  JIRA_CONTENT: 'jiraContent',
  JIRA_CONTENT_HTML: 'jiraContentHtml',
  AI_RESULT: 'aiResult'
};

/**
 * UI State Management Class
 */
class ResultPageUI {
  constructor() {
    this.originalAiContent = '';
    this.isEditing = false;
    this.elements = this.getDOMElements();
    this.initializeEventListeners();
  }

  getDOMElements() {
    return {
      aiContent: document.getElementById('aiContent'),
      aiEditor: document.getElementById('aiContentEditor'),
      jiraContent: document.getElementById('jiraContent'),
      editBtn: document.getElementById('editBtn'),
      saveBtn: document.getElementById('saveBtn'),
      cancelBtn: document.getElementById('cancelBtn'),
      copyBtn: document.getElementById('copyBtn')
    };
  }

  initializeEventListeners() {
    if (this.elements.editBtn) {
      this.elements.editBtn.addEventListener('click', () => this.enterEditMode());
    }
    if (this.elements.saveBtn) {
      this.elements.saveBtn.addEventListener('click', () => this.saveChanges());
    }
    if (this.elements.cancelBtn) {
      this.elements.cancelBtn.addEventListener('click', () => this.cancelChanges());
    }
    if (this.elements.copyBtn) {
      this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());
    }
    
    // Keyboard shortcuts
    if (this.elements.aiEditor) {
      this.elements.aiEditor.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          this.saveChanges();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.cancelChanges();
        }
      });
    }
  }

  enterEditMode() {
    this.isEditing = true;
    if (this.elements.aiContent) this.elements.aiContent.style.display = 'none';
    if (this.elements.aiEditor) this.elements.aiEditor.style.display = 'block';
    if (this.elements.editBtn) this.elements.editBtn.style.display = 'none';
    if (this.elements.saveBtn) this.elements.saveBtn.style.display = 'inline-block';
    if (this.elements.cancelBtn) this.elements.cancelBtn.style.display = 'inline-block';
    if (this.elements.aiEditor) this.elements.aiEditor.focus();
  }

  exitEditMode() {
    this.isEditing = false;
    if (this.elements.aiContent) this.elements.aiContent.style.display = 'block';
    if (this.elements.aiEditor) this.elements.aiEditor.style.display = 'none';
    if (this.elements.editBtn) this.elements.editBtn.style.display = 'inline-block';
    if (this.elements.saveBtn) this.elements.saveBtn.style.display = 'none';
    if (this.elements.cancelBtn) this.elements.cancelBtn.style.display = 'none';
  }

  async saveChanges() {
    if (!this.elements.aiEditor || !this.elements.aiContent) return;
    
    const newContent = this.elements.aiEditor.value;
    this.elements.aiContent.textContent = newContent;
    this.originalAiContent = newContent;
    
    try {
      await this.saveToStorage(STORAGE_KEYS.AI_RESULT, newContent);
      console.log('AI result updated successfully');
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
    
    this.exitEditMode();
  }

  cancelChanges() {
    if (this.elements.aiEditor) {
      this.elements.aiEditor.value = this.originalAiContent;
    }
    this.exitEditMode();
  }

  async copyToClipboard() {
    try {
      const textToCopy = this.isEditing 
        ? (this.elements.aiEditor ? this.elements.aiEditor.value : '')
        : (this.elements.aiContent ? this.elements.aiContent.textContent : '');
      
      await navigator.clipboard.writeText(textToCopy);
      this.showCopyFeedback();
      
    } catch (err) {
      console.error('Failed to copy text: ', err);
      this.fallbackCopy();
    }
  }

  fallbackCopy() {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = this.isEditing 
        ? (this.elements.aiEditor ? this.elements.aiEditor.value : '')
        : (this.elements.aiContent ? this.elements.aiContent.textContent : '');
      
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      this.showCopyFeedback();
      
    } catch (fallbackErr) {
      console.error('Fallback copy also failed: ', fallbackErr);
      alert('Copy failed. Please select and copy the text manually.');
    }
  }

  showCopyFeedback() {
    if (!this.elements.copyBtn) return;
    
    const originalText = this.elements.copyBtn.textContent;
    this.elements.copyBtn.textContent = 'Copied!';
    this.elements.copyBtn.classList.add('copied');
    
    setTimeout(() => {
      this.elements.copyBtn.textContent = originalText;
      this.elements.copyBtn.classList.remove('copied');
    }, 1500);
  }

  displayJiraContent(data) {
    if (!this.elements.jiraContent) return;
    
    if (data[STORAGE_KEYS.JIRA_CONTENT_HTML]) {
      this.elements.jiraContent.innerHTML = data[STORAGE_KEYS.JIRA_CONTENT_HTML];
    } else if (data[STORAGE_KEYS.JIRA_CONTENT]) {
      this.elements.jiraContent.textContent = data[STORAGE_KEYS.JIRA_CONTENT];
    } else {
      this.elements.jiraContent.textContent = 'Jira XML content not found';
    }
  }

  displayAIResult(data) {
    if (!this.elements.aiContent || !this.elements.aiEditor) return;
    
    if (data[STORAGE_KEYS.AI_RESULT]) {
      const formattedResult = data[STORAGE_KEYS.AI_RESULT].replace(/\\n/g, '\n');
      this.originalAiContent = formattedResult;
      this.elements.aiContent.textContent = formattedResult;
      this.elements.aiEditor.value = formattedResult;
    } else {
      const notFoundText = 'AI result not found';
      this.elements.aiContent.textContent = notFoundText;
      this.elements.aiEditor.value = notFoundText;
    }
  }

  // Storage helper methods
  saveToStorage(key, content) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: content }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  getDataFromStorage(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  }
}

/**
 * Initialize the result page
 */
async function initializeResultPage() {
  console.log("🔄 Initializing result page...");
  
  const ui = new ResultPageUI();
  
  try {
    const storageKeys = [
      STORAGE_KEYS.JIRA_CONTENT,
      STORAGE_KEYS.JIRA_CONTENT_HTML,
      STORAGE_KEYS.AI_RESULT
    ];
    
    const data = await ui.getDataFromStorage(storageKeys);
    
    ui.displayJiraContent(data);
    ui.displayAIResult(data);
    
    console.log("✅ Result page loaded successfully");
    
  } catch (error) {
    console.error('Error loading data:', error);
    
    const jiraContent = document.getElementById('jiraContent');
    const aiContent = document.getElementById('aiContent');
    
    if (jiraContent) {
      jiraContent.textContent = 'Error loading Jira XML content';
    }
    if (aiContent) {
      aiContent.textContent = 'Error loading AI result';
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeResultPage);

// Also try immediate setup in case DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  setTimeout(initializeResultPage, 100);
}