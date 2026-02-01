// Universal prompt that works on all platforms
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
