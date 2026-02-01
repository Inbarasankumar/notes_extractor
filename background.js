// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['installDate'], (result) => {
    if (!result.installDate) {
      chrome.storage.sync.set({
        installDate: Date.now(),
        usageCount: 0
      });
    }
  });

  console.log('Learning Notes Extractor installed successfully!');
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateUsageCount') {
    chrome.storage.sync.get(['usageCount'], (result) => {
      const count = (result.usageCount || 0) + 1;
      chrome.storage.sync.set({ usageCount: count });
      sendResponse({ success: true, count: count });
    });
    return true; // Keep the message channel open for async response
  }
});
