/*
 **********************************************************************
 * -------------------------------------------------------------------
 * Project Name : Abdal FoxyByPass
 * File Name    : popup.js
 * Author       : Ebrahim Shafiei (EbraSha)
 * Email        : Prof.Shafiei@Gmail.com
 * Created On   : 2024-12-19 15:30:00
 * Description  : Popup script for managing extension settings and UI
 * -------------------------------------------------------------------
 *
 * "Coding is an engaging and beloved hobby for me. I passionately and insatiably pursue knowledge in cybersecurity and programming."
 * – Ebrahim Shafiei
 *
 **********************************************************************
 */

// Global variables
let currentSettings = {};
let isSaving = false;

/**
 * Initialize the popup when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    setupEventListeners();
    updateUI();
});

/**
 * Load settings from storage
 */
async function loadSettings() {
    try {
        const response = await browser.runtime.sendMessage({ action: 'getSettings' });
        currentSettings = response.settings;
        console.log('Abdal FoxyByPass: Settings loaded successfully');
    } catch (error) {
        console.error('Abdal FoxyByPass: Error loading settings:', error);
        // Use default settings if loading fails
        currentSettings = {
            enableRightClick: true,
            enableKeyboardShortcuts: true,
            enableDragAndDrop: true,
            enableTextSelection: true,
            enableImageRightClick: true,
            enableInvisibleOverlay: true,
            enableDropContent: true,
            enablePrint: true,
            enableScreenshot: true,
            siteListMode: 'blacklist',
            siteList: [],
            enabled: true
        };
    }
}

/**
 * Setup event listeners for UI elements
 */
function setupEventListeners() {
    // Toggle switches
    const toggleIds = [
        'enableRightClick',
        'enableKeyboardShortcuts',
        'enableDragAndDrop',
        'enableTextSelection',
        'enableImageRightClick',
        'enableInvisibleOverlay',
        'enableDropContent',
        'enablePrint',
        'enableScreenshot'
    ];

    toggleIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', () => toggleSetting(id));
        }
    });

    // Mode selector buttons
    document.getElementById('blacklistMode').addEventListener('click', () => setMode('blacklist'));
    document.getElementById('whitelistMode').addEventListener('click', () => setMode('whitelist'));

    // Add site button
    document.getElementById('addSiteBtn').addEventListener('click', addSite);

    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveSettings);

    // Enter key in site input
    document.getElementById('siteInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addSite();
        }
    });
}

/**
 * Update the UI based on current settings
 */
function updateUI() {
    // Update toggle switches
    const toggleIds = [
        'enableRightClick',
        'enableKeyboardShortcuts',
        'enableDragAndDrop',
        'enableTextSelection',
        'enableImageRightClick',
        'enableInvisibleOverlay',
        'enableDropContent',
        'enablePrint',
        'enableScreenshot'
    ];

    toggleIds.forEach(id => {
        const element = document.getElementById(id);
        if (element && currentSettings[id] !== undefined) {
            if (currentSettings[id]) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        }
    });

    // Update mode selector
    const blacklistBtn = document.getElementById('blacklistMode');
    const whitelistBtn = document.getElementById('whitelistMode');
    
    if (currentSettings.siteListMode === 'blacklist') {
        blacklistBtn.classList.add('active');
        whitelistBtn.classList.remove('active');
    } else {
        whitelistBtn.classList.add('active');
        blacklistBtn.classList.remove('active');
    }

    // Update site list
    updateSiteList();

    // Update status
    updateStatus();
}

/**
 * Toggle a setting and apply instantly
 * @param {string} settingId - The ID of the setting to toggle
 */
async function toggleSetting(settingId) {
  if (currentSettings[settingId] !== undefined) {
    currentSettings[settingId] = !currentSettings[settingId];
    updateUI();
    
    // Apply changes instantly
    await applySettingsInstantly();
  }
}

/**
 * Set the site list mode and apply instantly
 * @param {string} mode - 'blacklist' or 'whitelist'
 */
async function setMode(mode) {
  currentSettings.siteListMode = mode;
  updateUI();
  
  console.log('Abdal FoxyByPass: Changed mode to:', mode);
  console.log('Abdal FoxyByPass: Current site list:', currentSettings.siteList);
  
  // Apply changes instantly
  await applySettingsInstantly();
}

/**
 * Add a site to the list and apply instantly
 */
async function addSite() {
  const input = document.getElementById('siteInput');
  const site = input.value.trim().toLowerCase();
  
  if (site && !currentSettings.siteList.includes(site)) {
    currentSettings.siteList.push(site);
    input.value = '';
    updateSiteList();
    
    console.log('Abdal FoxyByPass: Added site to list:', site);
    console.log('Abdal FoxyByPass: Current site list:', currentSettings.siteList);
    
    // Apply changes instantly
    await applySettingsInstantly();
  }
}

/**
 * Remove a site from the list and apply instantly
 * @param {string} site - The site to remove
 */
async function removeSite(site) {
  const index = currentSettings.siteList.indexOf(site);
  if (index > -1) {
    currentSettings.siteList.splice(index, 1);
    updateSiteList();
    
    // Apply changes instantly
    await applySettingsInstantly();
  }
}

/**
 * Update the site list display
 */
function updateSiteList() {
    const siteListElement = document.getElementById('siteList');
    siteListElement.innerHTML = '';

    if (currentSettings.siteList.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'site-item';
        emptyItem.textContent = 'No sites added';
        emptyItem.style.color = '#999';
        emptyItem.style.fontStyle = 'italic';
        siteListElement.appendChild(emptyItem);
    } else {
        currentSettings.siteList.forEach(site => {
            const siteItem = document.createElement('div');
            siteItem.className = 'site-item';
            
            const siteText = document.createElement('span');
            siteText.textContent = site;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => removeSite(site));
            
            siteItem.appendChild(siteText);
            siteItem.appendChild(removeBtn);
            siteListElement.appendChild(siteItem);
        });
    }
}

/**
 * Update the status display
 */
function updateStatus() {
  const statusElement = document.getElementById('status');
  const statusTextElement = document.getElementById('statusText');
  
  if (currentSettings.enabled) {
    statusElement.className = 'status enabled';
    const modeText = currentSettings.siteListMode === 'whitelist' ? 'Whitelist' : 'Blacklist';
    const siteCount = currentSettings.siteList.length;
    statusTextElement.textContent = `Extension is enabled (${modeText} mode, ${siteCount} sites)`;
  } else {
    statusElement.className = 'status disabled';
    statusTextElement.textContent = 'Extension is disabled';
  }
}

/**
 * Apply settings instantly to current tab
 */
async function applySettingsInstantly() {
  try {
    // Save to storage first
    await browser.runtime.sendMessage({
      action: 'saveSettings',
      settings: currentSettings
    });
    
    // Apply to current tab
    const response = await browser.runtime.sendMessage({ action: 'getCurrentTab' });
    if (response.tab) {
      try {
        await browser.tabs.sendMessage(response.tab.id, {
          action: 'updateSettings',
          settings: currentSettings
        });
        console.log('Abdal FoxyByPass: Settings applied instantly');
        
        // Show success message
        showStatusMessage('Settings applied instantly!', 2000);
      } catch (error) {
        console.log('Abdal FoxyByPass: Content script not available on this tab');
      }
    }
  } catch (error) {
    console.error('Abdal FoxyByPass: Error applying settings instantly:', error);
  }
}

/**
 * Show status message
 * @param {string} message - The message to show
 * @param {number} duration - Duration in milliseconds
 */
function showStatusMessage(message, duration = 2000) {
  const statusElement = document.getElementById('statusMessage');
  statusElement.textContent = message;
  statusElement.style.display = 'block';
  
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, duration);
}

/**
 * Save settings to storage and apply instantly
 */
async function saveSettings() {
  if (isSaving) return;
  
  isSaving = true;
  const saveBtn = document.getElementById('saveBtn');
  const originalText = saveBtn.textContent;
  
  try {
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    // Save to storage
    await browser.runtime.sendMessage({
      action: 'saveSettings',
      settings: currentSettings
    });
    
    // Apply settings instantly to current tab
    const response = await browser.runtime.sendMessage({ action: 'getCurrentTab' });
    if (response.tab) {
      try {
        await browser.tabs.sendMessage(response.tab.id, {
          action: 'updateSettings',
          settings: currentSettings
        });
        console.log('Abdal FoxyByPass: Settings applied instantly to current tab');
      } catch (error) {
        console.log('Abdal FoxyByPass: Content script not available on this tab');
      }
    }
    
    saveBtn.textContent = 'Applied!';
    showStatusMessage('Settings saved and applied successfully!', 2000);
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
      isSaving = false;
    }, 2000);
    
    console.log('Abdal FoxyByPass: Settings saved and applied successfully');
  } catch (error) {
    console.error('Abdal FoxyByPass: Error saving settings:', error);
    saveBtn.textContent = 'Error!';
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
      isSaving = false;
    }, 2000);
  }
}

/**
 * Validate site domain format
 * @param {string} domain - The domain to validate
 * @returns {boolean} - True if valid domain format
 */
function isValidDomain(domain) {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
} 