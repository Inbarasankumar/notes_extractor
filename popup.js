const UNIVERSAL_PROMPT = `Please create comprehensive learning notes from our conversation as SEPARATE markdown files for each distinct topic/concept discussed.

## 📚 Output Format: Multiple Topic-Based Files

**IMPORTANT: Create one markdown file for each major topic/concept we discussed.**

### For Each Topic File:

**File Structure:**
\`\`\`markdown
# 📘 [Topic Name]

**📍 Context: Where I Used This**
- Project/Service: [Name of project where this was used]
- Why I needed it: [Brief reason]
- What problem it solved: [The problem]

**📅 Metadata**
- Date: [Date]
- Session: [Brief session context]
- Related Topics: [Links to other topic files]

---

## 🎯 Overview
[Brief 2-3 sentence overview of what this topic is]

## 🔄 My Learning Journey
### Initial Approach
- What I initially thought/tried: [Description]
- Why that approach: [Reasoning]

### Better Approach Discovered
- What was recommended: [New approach]
- Why it's better: [Comparison with pros/cons]
- Key advantages: [List]
- Trade-offs: [What you give up]

## 🔧 Technical Details
[Detailed explanation of the concept]
- How it works
- Key components
- Architecture/Design patterns
- Code examples with explanations

## 🐛 Issues & Solutions
[Any errors or problems encountered while learning this]

## 💡 Key Insights
[Important discoveries and "aha!" moments]

## 🔗 Related Concepts
[Other topics that connect to this one]

## ✅ When to Use This
[Practical guidelines on when this approach is appropriate]

## 📚 Resources
[Any references or documentation mentioned]
\`\`\`

---

## 📋 Required Coverage:

### 1. Create Master Index File: \`00-Session-Index.md\`
- List all topic files created
- Brief description of each
- Conversation metadata (date, platform, duration)
- Overall context of the session

### 2. Create Separate Topic Files:

Identify all distinct topics discussed and create individual files:

**Technical Concepts** (e.g., "S3-Presigned-URLs.md", "CloudFront-CDN.md")
- Full technical explanation
- Where I used it (which project/service)
- Code examples

**Architectural Decisions** (e.g., "Image-Upload-Architecture.md")
- Initial approach vs chosen approach
- Comparison table with pros/cons
- Why one was selected over another
- Trade-offs analysis

**Problem-Solutions** (e.g., "Fixing-CORS-Issues.md")
- The problem encountered
- What caused it
- Solution steps
- Prevention tips

**Tools/Libraries** (e.g., "AWS-CDK-Setup.md")
- What it is and why used
- Setup/configuration
- Usage examples

### 3. Naming Convention:
- Use kebab-case: \`Topic-Name-Here.md\`
- Number files by importance: \`01-Main-Topic.md\`, \`02-Secondary-Topic.md\`
- Use descriptive names that indicate content

### 4. Cross-Linking:
- Link related topics to each other
- Use relative links: \`[S3 Presigned URLs](./S3-Presigned-URLs.md)\`

---

## 🎯 Example Output Structure:

\`\`\`
00-Session-Index.md
01-Image-Upload-Architecture.md
02-S3-Presigned-URLs.md
03-S3-Bucket-Configuration.md
04-CloudFront-CDN-Setup.md
05-AWS-CDK-Basics.md
\`\`\`

Each file focused on ONE topic with context of where/why I used it.

---

## ✅ Quality Checklist:

- [ ] Each topic has its own file
- [ ] Every file mentions WHERE it was used (which project/service)
- [ ] Learning journey documented (initial → better approach)
- [ ] Code examples included with explanations
- [ ] Related topics cross-linked
- [ ] All files use proper markdown formatting
- [ ] Master index file created
- [ ] Files are Notion-importable

**Please analyze our conversation and create separate, well-organized markdown files as downloadable artifacts.**`;

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
