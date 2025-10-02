document.addEventListener('DOMContentLoaded', async function() {
  try {
    async function getDataFromStorage(maxRetries = 5, retryDelay = 500) {
      for (let i = 0; i < maxRetries; i++) {
        const result = await chrome.storage.local.get(['jiraContent', 'aiResult']);
        if (result.jiraContent && result.aiResult) {
          return result;
        }
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
      return await chrome.storage.local.get(['jiraContent', 'aiResult']);
    }
    
    const result = await getDataFromStorage();
    
    if (result.jiraContent) {
      document.getElementById('jiraContent').textContent = result.jiraContent;
    } else {
      document.getElementById('jiraContent').textContent = 'Jira XML content not found';
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
