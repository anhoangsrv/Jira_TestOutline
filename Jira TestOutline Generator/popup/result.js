document.addEventListener('DOMContentLoaded', async function() {
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
      document.getElementById('aiContent').textContent = formattedResult;
    } else {
      document.getElementById('aiContent').textContent = 'AI result not found';
    }
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('jiraContent').textContent = 'Error loading Jira XML content';
    document.getElementById('aiContent').textContent = 'Error loading AI result';
  }
});
