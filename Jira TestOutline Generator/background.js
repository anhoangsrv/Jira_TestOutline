chrome.runtime.onInstalled.addListener(() => {
  console.log("Jira Test Outline Generator installed.");
  
  testApiConnection();
});

async function testApiConnection() {
  console.log('Testing API connection...');
  
  const apiUrl = 'http://107.98.160.92:8910/gauss/chat';
  const testPayload = {
    "prompt": "Hello",
    "gauss_token": "40072b14eb43f10ab1c03f32d1cce829842be1b5",
    "model_id": "Gauss2.2-37B-Instruct-250515",
    "user_id": "ngoc.dh"
  };
  
  try {
    console.log('Sending test request to:', apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('API Test - Response status:', response.status);
    console.log('API Test - Response ok:', response.ok);
    console.log('API Test - Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('API test successful:', data);
    } else {
      const errorText = await response.text();
      console.error('API test failed:', response.status, response.statusText, errorText);
    }
  } catch (error) {
    console.error('API test error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('Network error - possible causes:');
      console.error('1. Server unavailable');
      console.error('2. Firewall blocking connection');
      console.error('3. CORS policy');
      console.error('4. Mixed content (HTTP from HTTPS context)');
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);
  
  if (request.action === 'callAIApi') {
    const { payload } = request;
    console.log('Payload received:', payload);
    
    const apiUrl = 'http://107.98.160.92:8910/gauss/chat';
    console.log('Calling API:', apiUrl);
    
    console.log('Sending fetch request with payload:', payload);
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        return response.text().then(errorText => {
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        });
      }
      
      return response.text().then(text => {
        console.log('Raw response text:', text);
        try {
          const json = JSON.parse(text);
          console.log('Parsed JSON response:', json);
          return json;
        } catch (e) {
          console.log('Response is not JSON, returning as text');
          return text;
        }
      });
    })
    .then(data => {
      console.log('API response data:', data);
      sendResponse({ success: true, data });
    })
    .catch(error => {
      console.error('API call failed with details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        sendResponse({ 
          success: false, 
          error: 'Network error - Server unavailable or blocked by firewall. Check network connection and security settings.' 
        });
      } else {
        sendResponse({ success: false, error: error.message });
      }
    });
    
    return true;
  }
});
