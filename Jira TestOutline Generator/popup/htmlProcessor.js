/**
 * HTML Processing Utilities
 * Handles extraction and processing of Jira XML content
 */

import { HTML_PROCESSING } from './config.js';

/**
 * Extract description content from Jira XML
 */
export function extractDescriptionContent(xml) {
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
  
  return itemContent.substring(descStart + 13, descEnd);
}

/**
 * Extract link from Jira XML
 */
export function extractLinkFromXml(xml) {
  const linkStart = xml.indexOf('<link>');
  const linkEnd = xml.indexOf('</link>');
  
  if (linkStart === -1 || linkEnd === -1) {
    throw new Error('Cannot find link tag in XML');
  }
  
  return xml.substring(linkStart + 6, linkEnd);
}

/**
 * Extract ID from Jira link
 */
export function extractIdFromLink(link) {
  const match = link.match(/\/([A-Z]+-\d+)(?:\?.*)?$/);
  if (match && match[1]) {
    return match[1];
  }
  
  return link.replace(/[:\/\?#\[\\\]@!\$&'\(\)\*\+,;=]/g, '_');
}

/**
 * Decode HTML entities
 */
export function decodeHtmlEntities(text) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

/**
 * Create heading HTML with proper numbering
 */
function createHeadingHtml(element, headingCounters) {
  const level = parseInt(element.tagName.charAt(1));
  if (level < 1 || level > HTML_PROCESSING.MAX_HEADING_LEVELS) {
    return { html: '', text: '' };
  }

  // Update counters
  headingCounters[level - 1]++;
  for (let i = level; i < HTML_PROCESSING.MAX_HEADING_LEVELS; i++) {
    headingCounters[i] = 0;
  }

  // Generate heading number
  let headingNumber = '';
  for (let i = 0; i < level; i++) {
    if (headingCounters[i] > 0) {
      if (i > 0) headingNumber += '-';
      headingNumber += headingCounters[i];
    }
  }

  if (headingNumber.startsWith('-')) {
    headingNumber = headingNumber.substring(1);
  }

  const text = element.textContent.trim();
  if (!text) return { html: '', text: '' };

  const headingHtml = `<h${level} style="color: #00875a; font-weight: bold; margin: 15px 0 10px 0;">${headingNumber}. ${text}</h${level}>`;
  const headingText = '\n' + headingNumber + '. ' + text + '\n\n';
  
  return { html: headingHtml, text: headingText };
}

/**
 * Create paragraph HTML
 */
function createParagraphHtml(element, indent) {
  const text = element.textContent.trim();
  if (!text) return { html: '', text: '' };

  const isBold = element.querySelector('b') || element.querySelector('strong');
  const pHtml = `<p style="margin: 8px 0; line-height: 1.5;">${element.innerHTML}</p>`;
  
  if (isBold && text.length < 50) {
    return { html: pHtml, text: '\n' + indent + text + '\n' };
  }
  return { html: pHtml, text: indent + text + '\n\n' };
}

/**
 * Create list HTML (ul/ol)
 */
function createListHtml(element, indent) {
  const tagName = element.tagName.toLowerCase();
  let listHtml = `<${tagName} style="margin: 10px 0; padding-left: 20px;">`;
  let listText = '';
  
  const items = element.querySelectorAll(':scope > li');
  items.forEach((item, index) => {
    const itemText = item.textContent.trim();
    if (!itemText) return;

    listHtml += `<li style="margin: 5px 0; line-height: 1.4;">${item.innerHTML}</li>`;
    
    const prefix = tagName === 'ol' ? `${index + 1}. ` : '• ';
    listText += indent + prefix + itemText + '\n';
    
    // Handle nested lists
    const nestedLists = item.querySelectorAll('ul, ol');
    nestedLists.forEach(nestedList => {
      const nestedItems = nestedList.querySelectorAll(':scope > li');
      nestedItems.forEach((nestedItem, nestedIndex) => {
        const nestedText = nestedItem.textContent.trim();
        if (nestedText) {
          const nestedPrefix = nestedList.tagName === 'OL' ? `${nestedIndex + 1}. ` : '• ';
          listText += '  ' + indent + '  ' + nestedPrefix + nestedText + '\n';
        }
      });
    });
  });
  
  listHtml += `</${tagName}>`;
  listText += '\n';
  
  return { html: listHtml, text: listText };
}

/**
 * Create table HTML with responsive design
 */
function createTableHtml(element, indent) {
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
    if (cells.length === 0) return;

    tableHtml += '<tr>';
    let rowText = indent;
    
    cells.forEach((cell, cellIndex) => {
      const cellText = cell.textContent.trim().replace(/\s+/g, ' ');
      const isHeader = cell.tagName.toLowerCase() === 'th' || rowIndex === 0;
      
      const cellStyle = isHeader 
        ? `padding: 12px 8px; background: #f8f9fa; border: 1px solid #ddd; font-weight: bold; text-align: left; min-width: ${HTML_PROCESSING.TABLE_MIN_WIDTH};`
        : `padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; min-width: ${HTML_PROCESSING.TABLE_MIN_WIDTH};`;
      
      const cellTag = isHeader ? 'th' : 'td';
      tableHtml += `<${cellTag} style="${cellStyle}">${cell.innerHTML}</${cellTag}>`;
      
      rowText += (cellIndex > 0 ? ' | ' : '') + cellText;
    });
    
    tableHtml += '</tr>';
    tableText += rowText + '\n';
  });
  
  tableHtml += '</table></div>';
  tableText += '\n';
  
  return { html: tableHtml, text: tableText };
}

/**
 * Create image HTML
 */
function createImageHtml(element) {
  const src = element.getAttribute('src');
  const alt = element.getAttribute('alt') || 'Image';
  const imgHtml = `<div style="margin: 10px 0;"><img src="${src}" alt="${alt}" style="max-width: ${HTML_PROCESSING.IMAGE_MAX_WIDTH}; height: auto; border: 1px solid #ddd; border-radius: 4px;"/></div>`;
  const imgText = `[Image: ${alt}]\n`;
  return { html: imgHtml, text: imgText };
}

/**
 * Process DOM element recursively
 */
function processElement(element, indentLevel = 0, headingCounters = [0, 0, 0, 0, 0, 0]) {
  const indent = '  '.repeat(indentLevel);
  
  if (element.nodeType === Node.TEXT_NODE) {
    const text = element.textContent.trim();
    return text ? { html: text, text: indent + text + '\n' } : { html: '', text: '' };
  }
  
  if (element.nodeType !== Node.ELEMENT_NODE) {
    return { html: '', text: '' };
  }
  
  const tagName = element.tagName.toLowerCase();
  
  // Handle different element types
  if (tagName.startsWith('h') && tagName.length === 2) {
    return createHeadingHtml(element, headingCounters);
  }
  
  if (tagName === 'p') {
    return createParagraphHtml(element, indent);
  }
  
  if (tagName === 'ul' || tagName === 'ol') {
    return createListHtml(element, indent);
  }
  
  if (tagName === 'div' && element.classList.contains('table-wrap')) {
    const table = element.querySelector('table');
    return table ? processElement(table, indentLevel, headingCounters) : { html: '', text: '' };
  }
  
  if (tagName === 'table') {
    return createTableHtml(element, indent);
  }
  
  if (tagName === 'img') {
    return createImageHtml(element);
  }
  
  // Process child elements
  let html = '';
  let text = '';
  for (let child of element.childNodes) {
    const childResult = processElement(child, indentLevel, headingCounters);
    html += childResult.html;
    text += childResult.text;
  }
  
  return { html, text };
}

/**
 * Main function to summarize HTML content
 */
export function summarizeHtmlContent(html) {
  const decodedHtml = decodeHtmlEntities(html);
  const tmp = document.createElement('div');
  tmp.innerHTML = decodedHtml;
  
  const result = { html: '', text: '' };
  const headingCounters = [0, 0, 0, 0, 0, 0];
  
  for (let child of tmp.childNodes) {
    const childResult = processElement(child, 0, headingCounters);
    result.html += childResult.html;
    result.text += childResult.text;
  }
  
  // Clean up text formatting
  result.text = result.text.replace(/\n\s*\n/g, '\n\n').trim();
  
  return result;
}