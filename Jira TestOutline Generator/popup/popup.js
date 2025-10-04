async function getJiraXmlContent() {
  if (!document.contentType || !document.contentType.includes('xml')) {
    throw new Error('Current page is not an XML page');
  }
  
  const xmlContent = document.documentElement.outerHTML;
  return xmlContent;
}

import { callAIApi, getPromptTemplate } from './utils.js';

const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="0.92">
<channel>
<item>
<description><p>Adjust Expandable List and Expand button follow OneUI 8</p> <h3><a name=""></a><font color="#00875a"><b>Minimum Conditions of Acceptance</b></font></h3> <ul> <li>The color of the Expandable button should follow icon button for all states</li> <li>Adjust sub-item in Expandable List follow One UI 8 <ul> <li>Sub-item with text only</li> <li>Sub item should have states follow OneUI 8</li> </ul> </li> <li>When Expand button is in hovered/pressed state, list item will be in rest state</li> <li>Apply Colors/Type Scale/Border tokens follow OneUI 8</li> </ul> <h3><a name=""></a><font color="#00875a"><b>Accessibility</b></font></h3> <p>Check the color of the High Contrast Color in the Excel file.</p> <h3><a name=""></a><font color="#00875a"><b>Impacts</b></font></h3> <ul> <li>Expandable List</li> <li>Expand Button</li> </ul> <h3><a name=""></a><b><font color="#00875a">GUI/UI Guide Page</font></b></h3> <h3><a name=""></a><b><font color="#00875a"><span class="image-wrap" style=""><img src="https://jira-la.secext.samsung.net/secure/attachment/377404/377404_image-2025-08-06-09-06-45-435.png" style="border: 0px solid black" /></span></font></b></h3> <p><b><font color="#00875a"><span class="image-wrap" style=""><img src="https://jira-la.secext.samsung.net/secure/attachment/381726/381726_image-2025-09-17-14-23-38-224.png" style="border: 0px solid black" /></span></font></b></p> <ul> <li>Expand button</li> </ul> <p><span class="image-wrap" style=""><img src="https://jira-la.secext.samsung.net/secure/attachment/381723/381723_image-2025-09-17-14-20-29-965.png" style="border: 0px solid black" /></span></p> <p> </p> <p>Focus stroke Rule 1.</p> <p>Round Conner: <b>sys-radius/50%</b></p> <p>Border: <b>sys-border-md 1px</b></p> <p>Size: <b>32*32 px</b></p> <p> </p> <p><b>Sub Items states</b></p> <div class='table-wrap'> <table class='confluenceTable'><tbody> <tr> <td class='confluenceTd'>OneUI 8</td> <td class='confluenceTd'><b>Rest</b></td> <td class='confluenceTd'>Hovered</td> <td class='confluenceTd'>Pressed</td> <td class='confluenceTd'> </td> <td class='confluenceTd'> </td> </tr> <tr> <td class='confluenceTd'> </td> <td class='confluenceTd'><b>Divider</b>:<br/> Book_Sys/Outline Low<br/> Book_Sys/High contrast/Color2_WindowText<br/>  <br/> <b>text</b>:<br/> Book_Sys/On Surface Container Highest<br/> Book_Sys/High contrast/Color2_WindowText</td> <td class='confluenceTd'><b>BG</b>:<br/> Book_Sys/Book Touch Feedback/Hover On Large Plain<br/> Book_Sys/High contrast/Color5_HighlightText<br/> <b>Divider</b>:<br/> Book_Sys/Outline Low<br/> Book_Sys/High contrast/Color6_Highlight<br/>  <br/> <b>text</b>:<br/> Book_Sys/On Surface Container Highest<br/> Book_Sys/High contrast/Color6_Highlight</td> <td class='confluenceTd'><b>BG</b>:<br/> Book_Sys/Book Touch Feedback/Press On Large Plain<br/> Book_Sys/High contrast/Color5_HighlightText<br/> <b>Divider</b>:<br/> Book_Sys/Outline Low<br/> Book_Sys/High contrast/Color2_WindowText<br/>  <br/> <b>text</b>:<br/> Book_Sys/On Surface Container Highest<br/> Book_Sys/High contrast/Color6_Highlight</td> </tr> </tbody></table> </div> <p><b>Disable states:</b></p> <p><b>text</b>:<br/> Book_Sys/On Surface Container Highest<br/> Book_Sys/High contrast/Color4_GrayText</p> <p><b>Divider</b>:<br/> Book_Sys/Outline Low<br/> Book_Sys/High contrast/Color2_WindowText</p> <p> </p> <p><b>Focus states</b></p> <div class='table-wrap'> <table class='confluenceTable'><tbody> <tr> <td class='confluenceTd'><b>Rule 1:</b><br/> Same with focus stroke token:</td> </tr> </tbody></table> </div> <h3><a name="%C2%A0"></a><b><font color="#00875a">OneUI tool Page</font></b> </h3> <p>No Changes</p> <h3><a name="%7B%7D%7B%7B%7D%7D"></a><font color="#00875a"><b>Tests Outlines:</b></font><b>{</b>}</h3> <ul> <li>Check the color of the Expandable button should follow icon button for all states: Rest/ Hovered/ Pressed/ Disable/ Focus/ selected</li> <li>Check adjusts sub-item in Expandable List follow One UI 8 with 2 cases bellow:</li> <li>If Sub-item with text only</li> <li>If Sub item should have states, follow OneUI 8: Rest/ Hovered/ Pressed</li> <li>Check when Expand button is in hovered/pressed state, list item will be in rest state</li> <li>check apply Colors/Type Scale/Border tokens follow OneUI 8 for Expandable List component and Expand button</li> <li>Check Focus stroke Rule 1: Round Conner: sys-radius/50% , Border: sys-border-md 1px, Size: 32*32 px for Expand button and list components</li> <li>Check Disable state of Text and Divider for Sub Items states</li> <li>Check Focus states follow rule 1: Round Conner: sys-radius/50% , Border: sys-border-md 1px, Size: 32*32 px for Expand button</li> <li>Check these changes with Dark/ Light/ High contrast mode/ narrator</li> </ul> </description>
</item>
</channel>
</rss>`;

function extractDescriptionContent(xml) {
  const itemStart = xml.indexOf('<item>');
  const itemEnd = xml.indexOf('</item>');
  
  if (itemStart === -1 || itemEnd === -1) {
    throw new Error('Cannot find item tag in XML');
  }
  
  const itemContent = xml.substring(itemStart, itemEnd);
  
  const descStart = itemContent.indexOf('<description>');
  const descEnd = itemContent.indexOf('</description>');
  
  if (descStart === -1 || descEnd === -1) {
    throw new Error('Cannot find description tag in XML');
  }
  
  const descriptionContent = itemContent.substring(descStart + 13, descEnd);
  
  return descriptionContent;
}

function extractLinkFromXml(xml) {
  const linkStart = xml.indexOf('<link>');
  const linkEnd = xml.indexOf('</link>');
  
  if (linkStart === -1 || linkEnd === -1) {
    throw new Error('Cannot find link tag in XML');
  }
  
  const linkContent = xml.substring(linkStart + 6, linkEnd);
  
  return linkContent;
}

function extractIdFromLink(link) {
  const match = link.match(/\/([A-Z]+-\d+)(?:\?.*)?$/);
  if (match && match[1]) {
    return match[1];
  }
  
  const sanitizedLink = link.replace(/[:\/\?#\[\\\]@!\$&'\(\)\*\+,;=]/g, '_');
  return sanitizedLink;
}

async function saveToStorage(key, content) {
  try {
    const data = {};
    data[key] = content;
    await chrome.storage.local.set(data);
    console.log(`Content saved to storage with key: ${key}`);
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
}

async function readFromStorage(key) {
  try {
    const result = await chrome.storage.local.get([key]);
    return result[key] || '';
  } catch (error) {
    console.error('Error reading from storage:', error);
    return '';
  }
}

function decodeHtmlEntities(text) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

function summarizeHtmlContent(html) {
  const decodedHtml = decodeHtmlEntities(html);
  
  const tmp = document.createElement('div');
  tmp.innerHTML = decodedHtml;
  
  // Create a result object containing both HTML and text
  let result = {
    html: '',
    text: ''
  };
  
  let textContent = '';
  const headingCounters = [0, 0, 0, 0, 0, 0];
  
  function processElement(element, indentLevel = 0) {
    const indent = '  '.repeat(indentLevel);
    
    if (element.nodeType === Node.TEXT_NODE) {
      const text = element.textContent.trim();
      if (text) {
        return { html: text, text: indent + text + '\n' };
      }
      return { html: '', text: '' };
    }
    
    if (element.nodeType === Node.ELEMENT_NODE) {
      const tagName = element.tagName.toLowerCase();
      
      if (tagName.startsWith('h') && tagName.length === 2) {
        const level = parseInt(tagName.charAt(1));
        if (level >= 1 && level <= 6) {
          headingCounters[level - 1]++;
          for (let i = level; i < 6; i++) {
            headingCounters[i] = 0;
          }
          
          let headingNumber = '';
          for (let i = 0; i < level; i++) {
            if (headingCounters[i] > 0) {
              if (i > 0) {
                headingNumber += '-';
              }
              headingNumber += headingCounters[i];
            }
          }
          
          if (headingNumber.startsWith('-')) {
            headingNumber = headingNumber.substring(1);
          }
          
          const text = element.textContent.trim();
          if (text) {
            const headingHtml = `<h${level} style="color: #00875a; font-weight: bold; margin: 15px 0 10px 0;">${headingNumber}. ${text}</h${level}>`;
            const headingText = '\n' + headingNumber + '. ' + text + '\n\n';
            return { html: headingHtml, text: headingText };
          }
        }
      }
      
      if (tagName === 'p') {
        const text = element.textContent.trim();
        if (text) {
          const isBold = element.querySelector('b') || element.querySelector('strong');
          let pHtml = `<p style="margin: 8px 0; line-height: 1.5;">${element.innerHTML}</p>`;
          
          if (isBold && text.length < 50) {
            return { html: pHtml, text: '\n' + indent + text + '\n' };
          }
          return { html: pHtml, text: indent + text + '\n\n' };
        }
      }
      
      if (tagName === 'ul' || tagName === 'ol') {
        let listHtml = `<${tagName} style="margin: 10px 0; padding-left: 20px;">`;
        let listText = '';
        
        const items = element.querySelectorAll(':scope > li');
        items.forEach((item, index) => {
          const itemText = item.textContent.trim();
          if (itemText) {
            listHtml += `<li style="margin: 5px 0; line-height: 1.4;">${item.innerHTML}</li>`;
            
            if (tagName === 'ol') {
              listText += indent + (index + 1) + '. ' + itemText + '\n';
            } else {
              listText += indent + '• ' + itemText + '\n';
            }
            
            const nestedLists = item.querySelectorAll('ul, ol');
            nestedLists.forEach(nestedList => {
              const nestedItems = nestedList.querySelectorAll(':scope > li');
              nestedItems.forEach(nestedItem => {
                const nestedText = nestedItem.textContent.trim();
                if (nestedText) {
                  if (nestedList.tagName === 'ol') {
                    listText += '  ' + indent + '  ' + (index + 1) + '. ' + nestedText + '\n';
                  } else {
                    listText += '  ' + indent + '  • ' + nestedText + '\n';
                  }
                }
              });
            });
          }
        });
        
        listHtml += `</${tagName}>`;
        listText += '\n';
        
        return { html: listHtml, text: listText };
      }
      
      // Xử lý bảng Jira:
      // Khi gặp div.classList.contains('table-wrap'), lấy table bên trong và xử lý
      if (tagName === 'div' && element.classList.contains('table-wrap')) {
        const table = element.querySelector('table');
        if (table) {
          return processElement(table, indentLevel);
        }
      }
      
      // Xử lý bảng:
      // Tạo HTML responsive table với overflow-x auto và các styles cần thiết
      if (tagName === 'table') {
        // Create responsive table HTML with horizontal scroll
        let tableHtml = `
          <div class="table-container" style="overflow-x: auto; margin: 15px 0; border: 1px solid #ddd; border-radius: 6px;">
            <table style="
              min-width: 100%; 
              border-collapse: collapse; 
              font-size: 13px; 
              background: white;
              white-space: nowrap;
            ">
        `;
        
        let tableText = '\n';
        const rows = element.querySelectorAll('tr');
        
        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('td, th');
          if (cells.length > 0) {
            tableHtml += '<tr>';
            let rowText = indent;
            
            cells.forEach((cell, cellIndex) => {
              const cellText = cell.textContent.trim().replace(/\s+/g, ' ');
              const isHeader = cell.tagName.toLowerCase() === 'th' || rowIndex === 0;
              
              if (isHeader) {
                tableHtml += `<th style="
                  padding: 12px 8px; 
                  background: #f8f9fa; 
                  border: 1px solid #ddd; 
                  font-weight: bold; 
                  text-align: left;
                  min-width: 100px;
                ">${cell.innerHTML}</th>`;
              } else {
                tableHtml += `<td style="
                  padding: 10px 8px; 
                  border: 1px solid #ddd; 
                  vertical-align: top;
                  min-width: 100px;
                ">${cell.innerHTML}</td>`;
              }
              
              rowText += (cellIndex > 0 ? ' | ' : '') + cellText;
            });
            
            tableHtml += '</tr>';
            tableText += rowText + '\n';
          }
        });
        
        tableHtml += '</table></div>';
        tableText += '\n';
        
        return { html: tableHtml, text: tableText };
      }
      
      // Xử lý hình ảnh:
      // Khi gặp thẻ img, tạo thẻ div chứa ảnh với max-width và border styling
      if (tagName === 'img') {
        const src = element.getAttribute('src');
        const alt = element.getAttribute('alt') || 'Image';
        const imgHtml = `<div style="margin: 10px 0;"><img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;"/></div>`;
        const imgText = `[Image: ${alt}]\n`;
        return { html: imgHtml, text: imgText };
      }
      
      let otherHtml = '';
      let otherText = '';
      for (let child of element.childNodes) {
        const childResult = processElement(child, indentLevel);
        otherHtml += childResult.html;
        otherText += childResult.text;
      }
      return { html: otherHtml, text: otherText };
    }
    
    return { html: '', text: '' };
  }
  
  for (let child of tmp.childNodes) {
    const childResult = processElement(child);
    result.html += childResult.html;
    result.text += childResult.text;
  }
  
  result.text = result.text.replace(/\n\s*\n/g, '\n\n');
  result.text = result.text.trim();
  
  return result;
}

console.log("AutoTestOutline popup loaded");

document.getElementById("generateTestOutline").addEventListener("click", async () => {
  console.log("Generate test outline button clicked");
  
  const outputDiv = document.getElementById("output");
  outputDiv.innerText = "🔄 Extracting content from Jira XML page...";
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.id) {
      throw new Error("Cannot access this web page. Please refresh the page.");
    }
    
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('extension://')) {
      throw new Error("Extension cannot access this page. Please try on a regular web page.");
    }

    console.log("Executing script to extract XML content on tab:", tab.id);
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getJiraXmlContent
    });

    console.log("XML content extraction results:", results);

    if (!results || !results[0] || !results[0].result) {
      throw new Error("Cannot extract XML content from web page. Please check extension permissions.");
    }

    const xmlContent = results[0].result;
    console.log("Extracted XML content:", xmlContent);

    const link = extractLinkFromXml(xmlContent);
    console.log('Extracted link from XML:', link);
    
    const id = extractIdFromLink(link);
    console.log('Extracted ID from link:', id);
    
    const descriptionHtml = extractDescriptionContent(xmlContent);
    console.log('Extracted HTML content from description tag');
    
    const summarizedContent = summarizeHtmlContent(descriptionHtml);
    
    console.log('Summarized HTML content');
    
    // Store both HTML and text versions
    await saveToStorage('jiraContentHtml', summarizedContent.html);
    await saveToStorage('jiraContent', summarizedContent.text);
    
    outputDiv.innerText = "🤖 Sending data to AI to generate Test Outline...";
    
    const content = {
      titles: [{ text: summarizedContent.text }]
    };
    
    try {
      const aiResult = await callAIApi(content);
      
      let resultText;
      if (typeof aiResult.data === 'string') {
        resultText = aiResult.data;
      } else if (typeof aiResult.data === 'object' && aiResult.data !== null) {
        if (aiResult.data.text) {
          resultText = aiResult.data.text;
        } else if (aiResult.data.data) {
          resultText = aiResult.data.data;
        } else {
          resultText = JSON.stringify(aiResult.data, null, 2);
        }
      } else {
        resultText = String(aiResult.data);
      }
      
      resultText = resultText.replace(/\\n/g, '\n');
      
      await saveToStorage('aiResult', resultText);
    
    chrome.tabs.create({ url: chrome.runtime.getURL('popup/result.html') });
      
    } catch (aiError) {
      console.error("AI API error:", aiError);
      outputDiv.innerHTML = `
        <div style="padding: 12px; background: #ffebee; border-radius: 6px; border-left: 4px solid #f44336;">
          ❌ <strong>AI API Error:</strong> ${aiError.message}
          <br><small>Check network connection and API configuration</small>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error reading content from file:", error);
    outputDiv.innerHTML = `
      <div style="padding: 12px; background: #ffebee; border-radius: 6px; border-left: 4px solid #f44336;">
        ❌ <strong>Error reading content from file:</strong> ${error.message}
        <br><small>Please select a saved file</small>
      </div>
    `;
  }
});
