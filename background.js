/*
 **********************************************************************
 * -------------------------------------------------------------------
 * Project Name : Abdal FoxyByPass
 * File Name    : background.js
 * Author       : Ebrahim Shafiei (EbraSha)
 * Email        : Prof.Shafiei@Gmail.com
 * Created On   : 2024-12-19 15:30:00
 * Description  : Background script for Abdal FoxyByPass Firefox extension
 * -------------------------------------------------------------------
 *
 * "Coding is an engaging and beloved hobby for me. I passionately and insatiably pursue knowledge in cybersecurity and programming."
 * – Ebrahim Shafiei
 *
 **********************************************************************
 */

// Default settings for the extension
const DEFAULT_SETTINGS = {
  // Feature toggles - all enabled by default
  enableRightClick: true,
  enableKeyboardShortcuts: true,
  enableDragAndDrop: true,
  enableTextSelection: true,
  enableImageRightClick: true,
  enableInvisibleOverlay: true,
  enableDropContent: true,
  enablePrint: true,
  enableScreenshot: true,
  
  // Site list mode: 'whitelist' or 'blacklist'
  siteListMode: 'blacklist',
  
  // List of sites to apply restrictions to
  siteList: [],
  
  // Extension enabled state
  enabled: true
};

// Initialize extension settings
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get('settings').then((result) => {
    if (!result.settings) {
      browser.storage.local.set({ settings: DEFAULT_SETTINGS });
    }
  });
});

// Handle messages from popup and content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'getSettings':
      browser.storage.local.get('settings').then((result) => {
        sendResponse({ settings: result.settings || DEFAULT_SETTINGS });
      });
      return true; // Keep message channel open for async response
      
    case 'saveSettings':
      browser.storage.local.set({ settings: message.settings }).then(() => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'getCurrentTab':
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        sendResponse({ tab: tabs[0] });
      });
      return true;
      
    case 'checkShouldApply':
      browser.storage.local.get('settings').then((result) => {
        const settings = result.settings || DEFAULT_SETTINGS;
        const shouldApply = shouldApplyToSite(message.url, settings);
        sendResponse({ shouldApply: shouldApply });
      });
      return true;
      
    case 'reloadContentScript':
      browser.tabs.reload(sender.tab.id);
      sendResponse({ success: true });
      return true;
  }
});

// Listen for tab updates to apply bypass rules
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    // Check if we should apply bypass rules to this site
    browser.storage.local.get('settings').then((result) => {
      const settings = result.settings || DEFAULT_SETTINGS;
      
      if (settings.enabled && shouldApplyToSite(tab.url, settings)) {
        // Content script will be injected automatically via manifest
        console.log('Abdal FoxyByPass: Applying bypass rules to', tab.url);
      } else {
        console.log('Abdal FoxyByPass: Not applying bypass rules to', tab.url);
      }
    });
  }
});

/**
 * Determine if bypass rules should be applied to the given URL
 * @param {string} url - The URL to check
 * @param {Object} settings - Current extension settings
 * @returns {boolean} - True if bypass rules should be applied
 */
function shouldApplyToSite(url, settings) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    console.log('Abdal FoxyByPass: Checking URL:', url);
    console.log('Abdal FoxyByPass: Hostname:', hostname);
    console.log('Abdal FoxyByPass: Site list:', settings.siteList);
    console.log('Abdal FoxyByPass: Mode:', settings.siteListMode);
    
    // Check if site is in the list
    const siteInList = settings.siteList.some(site => {
      const siteLower = site.toLowerCase();
      const matches = hostname.includes(siteLower) || siteLower.includes(hostname);
      console.log('Abdal FoxyByPass: Checking site:', siteLower, 'against hostname:', hostname, 'Result:', matches);
      return matches;
    });
    
    console.log('Abdal FoxyByPass: Site in list:', siteInList);
    
    // Apply based on mode
    let shouldApply = false;
    if (settings.siteListMode === 'whitelist') {
      shouldApply = siteInList; // Only apply to sites in the list
    } else {
      shouldApply = !siteInList; // Apply to all sites except those in the list
    }
    
    console.log('Abdal FoxyByPass: Should apply bypass rules:', shouldApply);
    return shouldApply;
  } catch (error) {
    console.error('Abdal FoxyByPass: Error parsing URL:', error);
    return false;
  }
} 