document.addEventListener('DOMContentLoaded', async function() {
  let originalAiContent = '';
  let isEditing = false;
  
  // Get DOM elements
  const aiContentElement = document.getElementById('aiContent');
  const aiEditorElement = document.getElementById('aiContentEditor');
  const editBtn = document.getElementById('editBtn');
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const copyBtn = document.getElementById('copyBtn');
  
  try {
    async function getDataFromStorage(maxRetries = 5, retryDelay = 500) {
      for (let i = 0; i < maxRetries; i++) {
        const result = await chrome.storage.local.get(['jiraContent', 'jiraContentHtml', 'aiResult']);
        if ((result.jiraContent || result.jiraContentHtml) && result.aiResult) {
          return result;
        }
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
      return await chrome.storage.local.get(['jiraContent', 'jiraContentHtml', 'aiResult']);
    }
    
    const result = await getDataFromStorage();
    
    // Display Jira content with HTML formatting if available
    const jiraContentElement = document.getElementById('jiraContent');
    if (result.jiraContentHtml) {
      jiraContentElement.innerHTML = result.jiraContentHtml;
    } else if (result.jiraContent) {
      jiraContentElement.textContent = result.jiraContent;
    } else {
      jiraContentElement.textContent = 'Jira XML content not found';
    }
    
    if (result.aiResult) {
      const formattedResult = result.aiResult.replace(/\\n/g, '\n');
      originalAiContent = formattedResult;
      aiContentElement.textContent = formattedResult;
      aiEditorElement.value = formattedResult;
    } else {
      aiContentElement.textContent = 'AI result not found';
      aiEditorElement.value = 'AI result not found';
    }
    
    // Edit mode functions
    function enterEditMode() {
      isEditing = true;
      aiContentElement.style.display = 'none';
      aiEditorElement.style.display = 'block';
      editBtn.style.display = 'none';
      saveBtn.style.display = 'inline-block';
      cancelBtn.style.display = 'inline-block';
      aiEditorElement.focus();
    }
    
    function exitEditMode() {
      isEditing = false;
      aiContentElement.style.display = 'block';
      aiEditorElement.style.display = 'none';
      editBtn.style.display = 'inline-block';
      saveBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
    }
    
    function saveChanges() {
      const newContent = aiEditorElement.value;
      aiContentElement.textContent = newContent;
      originalAiContent = newContent;
      
      // Save to storage
      chrome.storage.local.set({ aiResult: newContent }, function() {
        console.log('AI result updated');
      });
      
      exitEditMode();
    }
    
    function cancelChanges() {
      aiEditorElement.value = originalAiContent;
      exitEditMode();
    }
    
    async function copyToClipboard() {
      try {
        // Get the current content (either from display or editor)
        const textToCopy = isEditing ? aiEditorElement.value : aiContentElement.textContent;
        
        // Use the modern clipboard API
        await navigator.clipboard.writeText(textToCopy);
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove('copied');
        }, 1500);
        
      } catch (err) {
        console.error('Failed to copy text: ', err);
        
        // Fallback for older browsers
        try {
          const textArea = document.createElement('textarea');
          textArea.value = isEditing ? aiEditorElement.value : aiContentElement.textContent;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          // Visual feedback
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('copied');
          }, 1500);
          
        } catch (fallbackErr) {
          console.error('Fallback copy also failed: ', fallbackErr);
          alert('Copy failed. Please select and copy the text manually.');
        }
      }
    }
    
    // Event listeners
    editBtn.addEventListener('click', enterEditMode);
    saveBtn.addEventListener('click', saveChanges);
    cancelBtn.addEventListener('click', cancelChanges);
    copyBtn.addEventListener('click', copyToClipboard);
    
    // Keyboard shortcuts
    aiEditorElement.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        saveChanges();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelChanges();
      }
    });
    
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('jiraContent').textContent = 'Error loading Jira XML content';
    aiContentElement.textContent = 'Error loading AI result';
  }
});
