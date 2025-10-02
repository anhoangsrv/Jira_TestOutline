export const DEFAULT_PROMPT_TEMPLATE = `
You are a software project manager with extensive experience using Jira systems. 
You can fulfill multiple roles including PM, RA, Dev, and QA.

Your task is to create a list of test cases to test the component based on the following information:
{CONTENT}

Create test cases in the format: "Check [functionality/behavior]"
Each test case should start with the word "Check" and describe a specific behavior or function that needs to be tested.
I want to test with different screen sizes and different font ratios.
Write approximately 10 test outlines that can cover the content above.
Only respond with a list of test cases, without any additional formatting. Do not use JSON or any structured format. Only return plain text with each test case on a separate line.
`;

export const AVAILABLE_TEMPLATES = {
  'default': DEFAULT_PROMPT_TEMPLATE,
};
