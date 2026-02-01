// Universal prompt that works on all platforms
const UNIVERSAL_PROMPT = `Please create a comprehensive learning notes summary of our entire conversation and provide it as a downloadable markdown file.

## Required Structure (9 Sections):

### 1. 🎯 Primary Request and Intent
- What is the user trying to accomplish?
- Why do they need this?
- What problem are they solving?

### 2. 🔧 Key Technical Concepts
- List all technologies, frameworks, and concepts discussed
- For each: What it is, why it's relevant, comparisons to similar tech

### 3. 📁 Files and Code Sections
- All files created, modified, or discussed with full paths
- Purpose, importance, and key sections of each file
- Include relevant code snippets with proper syntax highlighting

### 4. 🐛 Errors and Fixes
- Document all errors encountered
- For each: Error message, cause, solution, prevention tips

### 5. 💡 Problem Solving
- Problem-solving approach used
- Debugging steps taken
- Important discoveries and insights
- Alternative solutions considered

### 6. 💬 All User Messages
- List every user message in chronological order (numbered)
- Include the exact text of each message

### 7. ⏳ Pending Tasks
- Tasks started but not completed
- Use checkboxes: \`- [ ] Task description\`
- Priority indicators: 🔴 High, 🟡 Medium, 🟢 Low

### 8. 🚀 Current Work
- What was being worked on before this prompt
- Current state and any blockers

### 9. ➡️ Next Steps
- 2-3 specific, actionable recommendations
- Logical next steps based on the conversation

## Formatting Requirements:
- Title: \`# 📚 Learning Notes: [Topic]\`
- Add metadata: Date, Platform, Session Duration
- Use proper markdown with code blocks, tables, emojis
- Make it Notion-importable
- Be thorough - don't abbreviate technical content

**Create the summary as a downloadable .md file that can be directly imported to Notion.**`;

// Detect which platform we're on
function detectPlatform() {
  const hostname = window.location.hostname;
  if (hostname.includes('claude.ai')) return 'claude';
  if (hostname.includes('chatgpt.com')) return 'chatgpt';
  if (hostname.includes('gemini.google.com')) return 'gemini';
  return null;
}

// Get the appropriate input element based on platform
function getInputElement(platform) {
  if (platform === 'claude') {
    return document.querySelector('div[contenteditable="true"]') ||
           document.querySelector('textarea');
  } else if (platform === 'chatgpt') {
    return document.querySelector('#prompt-textarea') ||
           document.querySelector('textarea');
  } else if (platform === 'gemini') {
    return document.querySelector('.ql-editor') ||
           document.querySelector('div[contenteditable="true"]');
  }
  return null;
}

// Insert the prompt into the input field
function insertPrompt() {
  const platform = detectPlatform();
  if (!platform) {
    console.log('Not on a supported platform');
    return;
  }

  const inputElement = getInputElement(platform);
  if (!inputElement) {
    console.log('Could not find input element');
    return;
  }

  // Set the value
  if (inputElement.tagName === 'TEXTAREA') {
    inputElement.value = UNIVERSAL_PROMPT;
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    inputElement.textContent = UNIVERSAL_PROMPT;
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Focus on the input
  inputElement.focus();

  // Update usage count
  chrome.storage.sync.get(['usageCount'], (result) => {
    const count = (result.usageCount || 0) + 1;
    chrome.storage.sync.set({ usageCount: count });
  });

  console.log('Prompt inserted successfully!');
}

// Create floating button
function createExtractButton() {
  // Check if button already exists
  if (document.getElementById('learning-notes-btn')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'learning-notes-btn';
  button.className = 'learning-notes-extract-btn';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
    Extract Notes
  `;

  button.addEventListener('click', () => {
    insertPrompt();
    button.classList.add('success');
    setTimeout(() => button.classList.remove('success'), 2000);
  });

  document.body.appendChild(button);
}

// Initialize
function init() {
  const platform = detectPlatform();
  if (platform) {
    createExtractButton();

    // Re-create button if page content changes (for SPAs)
    const observer = new MutationObserver(() => {
      if (!document.getElementById('learning-notes-btn')) {
        createExtractButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Run when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
