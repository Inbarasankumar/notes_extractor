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

// Load and display statistics when popup opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['usageCount', 'installDate'], (result) => {
    const usageCount = result.usageCount || 0;
    const installDate = result.installDate || Date.now();
    const daysActive = Math.floor((Date.now() - installDate) / (1000 * 60 * 60 * 24));

    document.getElementById('usageCount').textContent = usageCount;
    document.getElementById('installDate').textContent = daysActive;
  });
});

// Insert prompt button
document.getElementById('insertBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (prompt) => {
        // Detect platform
        const hostname = window.location.hostname;
        let platform = null;
        if (hostname.includes('claude.ai')) platform = 'claude';
        else if (hostname.includes('chatgpt.com')) platform = 'chatgpt';
        else if (hostname.includes('gemini.google.com')) platform = 'gemini';

        if (!platform) {
          alert('This extension only works on Claude, ChatGPT, or Gemini!');
          return;
        }

        // Get input element
        let inputElement = null;
        if (platform === 'claude') {
          inputElement = document.querySelector('div[contenteditable="true"]') ||
                        document.querySelector('textarea');
        } else if (platform === 'chatgpt') {
          inputElement = document.querySelector('#prompt-textarea') ||
                        document.querySelector('textarea');
        } else if (platform === 'gemini') {
          inputElement = document.querySelector('.ql-editor') ||
                        document.querySelector('div[contenteditable="true"]');
        }

        if (!inputElement) {
          alert('Could not find input field. Try clicking in the chat input first.');
          return;
        }

        // Insert prompt
        if (inputElement.tagName === 'TEXTAREA') {
          inputElement.value = prompt;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          inputElement.textContent = prompt;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        }

        inputElement.focus();

        // Update usage count
        chrome.storage.sync.get(['usageCount'], (result) => {
          const count = (result.usageCount || 0) + 1;
          chrome.storage.sync.set({ usageCount: count });
        });
      },
      args: [UNIVERSAL_PROMPT]
    });

    showStatus('✓ Prompt inserted!');
  } catch (error) {
    showStatus('✗ Error: ' + error.message);
  }
});

// Copy prompt button
document.getElementById('copyBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(UNIVERSAL_PROMPT).then(() => {
    showStatus('✓ Copied to clipboard!');
  }).catch(err => {
    showStatus('✗ Failed to copy');
  });
});

// Show status message
function showStatus(message) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.classList.add('show');

  setTimeout(() => {
    statusEl.classList.remove('show');
  }, 2000);
}
