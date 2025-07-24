/*
 **********************************************************************
 * -------------------------------------------------------------------
 * Project Name : Abdal FoxyByPass
 * File Name    : content.js
 * Author       : Ebrahim Shafiei (EbraSha)
 * Email        : Prof.Shafiei@Gmail.com
 * Created On   : 2024-12-19 15:30:00
 * Description  : Content script for bypassing website restrictions
 * -------------------------------------------------------------------
 *
 * "Coding is an engaging and beloved hobby for me. I passionately and insatiably pursue knowledge in cybersecurity and programming."
 * – Ebrahim Shafiei
 *
 **********************************************************************
 */

// Global variables
let settings = {};
let isEnabled = false;

/**
 * Initialize the content script
 */
async function initialize() {
  try {
    // Get settings from background script
    const response = await browser.runtime.sendMessage({ action: 'getSettings' });
    settings = response.settings;
    isEnabled = settings.enabled;
    
    // Check if we should apply bypass rules to this site
    const currentTab = await browser.runtime.sendMessage({ action: 'getCurrentTab' });
    if (currentTab.tab && currentTab.tab.url) {
      const shouldApplyResponse = await browser.runtime.sendMessage({ 
        action: 'checkShouldApply', 
        url: currentTab.tab.url 
      });
      
      const shouldApply = shouldApplyResponse.shouldApply;
      console.log('Abdal FoxyByPass: Should apply to this site:', shouldApply);
      
      if (isEnabled && shouldApply) {
        applyBypassRules();
        console.log('Abdal FoxyByPass: Bypass rules applied successfully');
      } else {
        console.log('Abdal FoxyByPass: Bypass rules not applied (disabled or site not in list)');
        // Don't apply any bypass rules if not supposed to
        return;
      }
    }
  } catch (error) {
    console.error('Abdal FoxyByPass: Error initializing content script:', error);
  }
}

/**
 * Listen for settings updates from popup
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateSettings') {
    settings = message.settings;
    isEnabled = settings.enabled;
    
    // Check if we should apply bypass rules to current site
    browser.runtime.sendMessage({ action: 'getCurrentTab' }).then((currentTab) => {
      if (currentTab.tab && currentTab.tab.url) {
        browser.runtime.sendMessage({ 
          action: 'checkShouldApply', 
          url: currentTab.tab.url 
        }).then((shouldApplyResponse) => {
          const shouldApply = shouldApplyResponse.shouldApply;
          
          if (isEnabled && shouldApply) {
            // Clear previous bypass rules
            clearBypassRules();
            
            // Apply new bypass rules immediately
            applyBypassRules();
            console.log('Abdal FoxyByPass: Settings updated and applied instantly');
          } else {
            // Clear all bypass rules if not supposed to apply
            clearBypassRules();
            console.log('Abdal FoxyByPass: Bypass rules removed (site not in list)');
          }
        });
      }
    });
    
    sendResponse({ success: true });
  }
});

/**
 * Apply all bypass rules based on current settings
 */
function applyBypassRules() {
  if (settings.enableRightClick) {
    enableRightClick();
  }
  
  if (settings.enableKeyboardShortcuts) {
    enableKeyboardShortcuts();
  }
  
  if (settings.enableTextSelection) {
    enableTextSelection();
  }
  
  if (settings.enableDragAndDrop) {
    enableDragAndDrop();
  }
  
  if (settings.enableImageRightClick) {
    enableImageRightClick();
  }
  
  if (settings.enableInvisibleOverlay) {
    removeInvisibleOverlays();
  }
  
  if (settings.enableDropContent) {
    enableDropContent();
  }
  
  if (settings.enablePrint) {
    enablePrint();
  }
  
  if (settings.enableScreenshot) {
    enableScreenshot();
  }
  
  // Force text selection to work by overriding all blocking events
  if (settings.enableTextSelection) {
    forceTextSelection();
  }
  
  // Additional override for strong protections
  if (settings.enableTextSelection || settings.enableRightClick || settings.enableDragAndDrop) {
    overrideStrongProtections();
  }
}

/**
 * Enable right-click functionality
 */
function enableRightClick() {
  // Remove context menu event listeners
  document.addEventListener('contextmenu', (e) => {
    e.stopImmediatePropagation();
    return true;
  }, true);
  
  // Override oncontextmenu
  document.oncontextmenu = null;
  
  // Remove contextmenu event listeners from all elements
  const elements = document.querySelectorAll('*');
  elements.forEach(element => {
    element.oncontextmenu = null;
    element.addEventListener('contextmenu', (e) => {
      e.stopImmediatePropagation();
      return true;
    }, true);
  });
}

/**
 * Enable keyboard shortcuts (Ctrl+C, Ctrl+U, F12, etc.)
 */
function enableKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Allow Ctrl+C (copy)
    if (e.ctrlKey && e.key === 'c') {
      e.stopImmediatePropagation();
      return true;
    }
    
    // Allow Ctrl+U (view source)
    if (e.ctrlKey && e.key === 'u') {
      e.stopImmediatePropagation();
      return true;
    }
    
    // Allow F12 (developer tools)
    if (e.key === 'F12') {
      e.stopImmediatePropagation();
      return true;
    }
    
    // Allow Ctrl+Shift+I (developer tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.stopImmediatePropagation();
      return true;
    }
    
    // Allow Ctrl+Shift+C (inspect element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.stopImmediatePropagation();
      return true;
    }
  }, true);
  
  // Override keydown event handlers
  document.onkeydown = null;
}

/**
 * Enable drag and drop functionality
 */
function enableDragAndDrop() {
  // Remove dragover and drop event listeners that prevent dropping
  document.addEventListener('dragover', (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();
    return true;
  }, true);
  
  document.addEventListener('drop', (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();
    return true;
  }, true);
  
  // Enable drag on images only
  const images = document.querySelectorAll('img');
  images.forEach(element => {
    element.draggable = true;
    element.addEventListener('dragstart', (e) => {
      e.stopImmediatePropagation();
      return true;
    }, true);
  });
  
  // Explicitly prevent text elements from being draggable
  const textElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, a, li, td, th, label, input, textarea, pre, code');
  textElements.forEach(element => {
    element.draggable = false;
    element.addEventListener('dragstart', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }, true);
    
    // Also prevent mousedown from starting drag
    element.addEventListener('mousedown', (e) => {
      if (e.target === element) {
        e.stopImmediatePropagation();
        return true;
      }
    }, true);
  });
  
  // Add a global event listener to prevent drag on text elements
  document.addEventListener('dragstart', (e) => {
    const target = e.target;
    if (target && (target.tagName === 'P' || target.tagName === 'DIV' || target.tagName === 'SPAN' || 
                   target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3' || 
                   target.tagName === 'H4' || target.tagName === 'H5' || target.tagName === 'H6' ||
                   target.tagName === 'A' || target.tagName === 'LI' || target.tagName === 'TD' || 
                   target.tagName === 'TH' || target.tagName === 'LABEL' || target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || target.tagName === 'PRE' || target.tagName === 'CODE')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  }, true);
}

/**
 * Enable text selection
 */
function enableTextSelection() {
  // Remove user-select CSS
  const style = document.createElement('style');
  style.setAttribute('data-abdal-foxybypass', 'text-selection');
  style.textContent = `
    /* Override all user-select restrictions */
    * {
      -webkit-user-select: auto !important;
      -moz-user-select: auto !important;
      -ms-user-select: auto !important;
      user-select: auto !important;
      -webkit-touch-callout: auto !important;
      -webkit-tap-highlight-color: rgba(0,0,0,0) !important;
    }
    
    /* Ensure text elements are selectable */
    p, div, span, h1, h2, h3, h4, h5, h6, a, li, td, th, label, input, textarea, pre, code {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
      pointer-events: auto !important;
      -webkit-user-drag: none !important;
      -khtml-user-drag: none !important;
      -moz-user-drag: none !important;
      -o-user-drag: none !important;
      user-drag: none !important;
    }
    
    /* Prevent images from being selectable as text */
    img {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
    
    /* Override body restrictions */
    body {
      -webkit-user-select: auto !important;
      -moz-user-select: auto !important;
      -ms-user-select: auto !important;
      user-select: auto !important;
      overflow: visible !important;
    }
  `;
  document.head.appendChild(style);
  
  // Completely override all event listeners that prevent text selection
  const events = ['selectstart', 'mousedown', 'mouseup', 'select', 'copy', 'cut', 'contextmenu', 'mousemove'];
  events.forEach(eventType => {
    document.addEventListener(eventType, (e) => {
      const target = e.target;
      
      // If it's an image, allow default behavior
      if (target && (target.tagName === 'IMG' || target.closest('img'))) {
        return;
      }
      
      // For all other elements, prevent any blocking
      e.stopImmediatePropagation();
      e.stopPropagation();
      return true;
    }, true);
  });
  
  // Additional specific handlers for text selection
  document.addEventListener('mousedown', (e) => {
    const target = e.target;
    if (target && (target.tagName === 'P' || target.tagName === 'DIV' || target.tagName === 'SPAN' || 
                   target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3' || 
                   target.tagName === 'H4' || target.tagName === 'H5' || target.tagName === 'H6' ||
                   target.tagName === 'A' || target.tagName === 'LI' || target.tagName === 'TD' || 
                   target.tagName === 'TH' || target.tagName === 'LABEL' || target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || target.tagName === 'PRE' || target.tagName === 'CODE')) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      return true;
    }
  }, true);
  
  // Override any existing event listeners on elements
  const textElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, a, li, td, th, label, input, textarea, pre, code');
  textElements.forEach(element => {
    // Remove any existing event listeners
    element.onmousedown = null;
    element.onmouseup = null;
    element.onselectstart = null;
    element.onselect = null;
    
    // Add our own event listeners
    element.addEventListener('mousedown', (e) => {
      e.stopImmediatePropagation();
      e.stopPropagation();
      return true;
    }, true);
    
    element.addEventListener('mouseup', (e) => {
      e.stopImmediatePropagation();
      e.stopPropagation();
      return true;
    }, true);
    
    element.addEventListener('selectstart', (e) => {
      e.stopImmediatePropagation();
      e.stopPropagation();
      return true;
    }, true);
  });
}

/**
 * Enable right-click on images
 */
function enableImageRightClick() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.oncontextmenu = null;
    img.style.pointerEvents = 'auto';
    img.addEventListener('contextmenu', (e) => {
      e.stopImmediatePropagation();
      e.stopPropagation();
      return true;
    }, true);
  });
}

/**
 * Remove invisible overlays that prevent interaction
 */
function removeInvisibleOverlays() {
  // Remove elements with high z-index that might be overlays
  const overlays = document.querySelectorAll('div[style*="z-index"], div[style*="position: fixed"], div[style*="position:absolute"]');
  overlays.forEach(overlay => {
    const style = window.getComputedStyle(overlay);
    if (style.pointerEvents === 'none' || style.opacity === '0' || style.backgroundColor === 'rgba(0, 0, 0, 0)') {
      overlay.remove();
    }
  });
  
  // Remove transparent overlays
  const transparentElements = document.querySelectorAll('*');
  transparentElements.forEach(element => {
    const style = window.getComputedStyle(element);
    if (style.backgroundColor === 'transparent' && style.pointerEvents === 'none') {
      element.style.pointerEvents = 'auto';
    }
  });
  
  // Specifically handle click-blocker elements
  const clickBlockers = document.querySelectorAll('#click-blocker, [id*="click"], [id*="blocker"], [class*="click"], [class*="blocker"]');
  clickBlockers.forEach(element => {
    const style = window.getComputedStyle(element);
    if (style.position === 'fixed' && (style.backgroundColor === 'rgba(0, 0, 0, 0)' || style.backgroundColor === 'transparent')) {
      element.remove();
    }
  });
  
  // Remove any fixed positioned elements that might be blocking
  const fixedElements = document.querySelectorAll('div[style*="position: fixed"]');
  fixedElements.forEach(element => {
    const style = window.getComputedStyle(element);
    if (style.top === '0px' && style.left === '0px' && style.width === '100vw' && style.height === '100vh') {
      element.remove();
    }
  });
}

/**
 * Enable drop content functionality
 */
function enableDropContent() {
  // Allow dropping content
  document.addEventListener('drop', (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();
    return true;
  }, true);
  
  // Allow dragover
  document.addEventListener('dragover', (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();
    return true;
  }, true);
}

/**
 * Enable print functionality
 */
function enablePrint() {
  document.addEventListener('keydown', (e) => {
    // Allow Ctrl+P (print)
    if (e.ctrlKey && e.key === 'p') {
      e.stopImmediatePropagation();
      return true;
    }
  }, true);
  
  // Override print function
  window.print = function() {
    return true;
  };
}

/**
 * Override strong protections that might be applied
 */
function overrideStrongProtections() {
  // Override any existing event listeners on document
  const originalAddEventListener = document.addEventListener;
  const originalRemoveEventListener = document.removeEventListener;
  
  // Override addEventListener to prevent blocking listeners
  document.addEventListener = function(type, listener, options) {
    if (type === 'contextmenu' || type === 'selectstart' || type === 'mousedown' || 
        type === 'mouseup' || type === 'select' || type === 'dragstart' || type === 'drop') {
      // Don't add blocking listeners
      return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // Override removeEventListener
  document.removeEventListener = function(type, listener, options) {
    return originalRemoveEventListener.call(this, type, listener, options);
  };
  
  // Override any existing event listeners
  document.oncontextmenu = null;
  document.onselectstart = null;
  document.onmousedown = null;
  document.onmouseup = null;
  document.onselect = null;
  document.ondragstart = null;
  document.ondrop = null;
  
  // Override body restrictions
  if (document.body) {
    document.body.style.userSelect = 'auto';
    document.body.style.webkitUserSelect = 'auto';
    document.body.style.mozUserSelect = 'auto';
    document.body.style.msUserSelect = 'auto';
    document.body.style.overflow = 'visible';
    document.body.style.pointerEvents = 'auto';
  }
  
  // Remove any blocking overlays
  setTimeout(() => {
    const clickBlockers = document.querySelectorAll('#click-blocker, [id*="click"], [id*="blocker"], [class*="click"], [class*="blocker"]');
    clickBlockers.forEach(element => {
      const style = window.getComputedStyle(element);
      if (style.position === 'fixed' && (style.backgroundColor === 'rgba(0, 0, 0, 0)' || style.backgroundColor === 'transparent')) {
        element.remove();
      }
    });
  }, 100);
  
  // Fix cursor for specific elements
  fixCursorForElements();
}

/**
 * Fix cursor for specific elements
 */
function fixCursorForElements() {
  // Set appropriate cursors for different elements
  const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"], input[type="reset"]');
  buttons.forEach(button => {
    button.style.cursor = 'pointer';
  });
  
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.style.cursor = 'pointer';
  });
  
  const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="url"], textarea');
  inputs.forEach(input => {
    input.style.cursor = 'text';
  });
  
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.style.cursor = 'default';
  });
  
  // Reset cursor for general elements
  const generalElements = document.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6');
  generalElements.forEach(element => {
    // Only set cursor if it's not already set
    if (!element.style.cursor || element.style.cursor === 'text') {
      element.style.cursor = 'default';
    }
  });
}

/**
 * Force text selection to work by overriding all blocking events
 */
function forceTextSelection() {
  // Override all possible event listeners that could block text selection
  const blockingEvents = [
    'selectstart', 'mousedown', 'mouseup', 'mousemove', 'select', 
    'copy', 'cut', 'contextmenu', 'dragstart', 'drag', 'dragend',
    'touchstart', 'touchmove', 'touchend', 'pointerdown', 'pointerup'
  ];
  
  blockingEvents.forEach(eventType => {
    document.addEventListener(eventType, (e) => {
      const target = e.target;
      
      // Skip images
      if (target && (target.tagName === 'IMG' || target.closest('img'))) {
        return;
      }
      
      // For text elements, prevent any blocking
      if (target && (target.tagName === 'P' || target.tagName === 'DIV' || target.tagName === 'SPAN' || 
                     target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3' || 
                     target.tagName === 'H4' || target.tagName === 'H5' || target.tagName === 'H6' ||
                     target.tagName === 'A' || target.tagName === 'LI' || target.tagName === 'TD' || 
                     target.tagName === 'TH' || target.tagName === 'LABEL' || target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || target.tagName === 'PRE' || target.tagName === 'CODE')) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        return true;
      }
    }, true);
  });
  
  // Override any existing event listeners on all text elements
  const textElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, a, li, td, th, label, input, textarea, pre, code');
  textElements.forEach(element => {
    // Remove all existing event listeners
    const clone = element.cloneNode(true);
    element.parentNode.replaceChild(clone, element);
    
    // Re-apply our styles
    clone.style.userSelect = 'text';
    clone.style.webkitUserSelect = 'text';
    clone.style.mozUserSelect = 'text';
    clone.style.msUserSelect = 'text';
  });
  
  // Override document-level event listeners
  document.oncontextmenu = null;
  document.onselectstart = null;
  document.onmousedown = null;
  document.onmouseup = null;
  document.onselect = null;
  
  // Override body restrictions
  if (document.body) {
    document.body.style.userSelect = 'auto';
    document.body.style.webkitUserSelect = 'auto';
    document.body.style.mozUserSelect = 'auto';
    document.body.style.msUserSelect = 'auto';
    document.body.style.overflow = 'visible';
  }
}

/**
 * Enable screenshot functionality
 */
function enableScreenshot() {
  // Remove screenshot prevention
  document.addEventListener('keydown', (e) => {
    // Allow Print Screen
    if (e.key === 'PrintScreen') {
      e.stopImmediatePropagation();
      return true;
    }
    
    // Allow Alt+PrintScreen
    if (e.altKey && e.key === 'PrintScreen') {
      e.stopImmediatePropagation();
      return true;
    }
  }, true);
  
  // Remove CSS that prevents screenshots
  const style = document.createElement('style');
  style.setAttribute('data-abdal-foxybypass', 'screenshot');
  style.textContent = `
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Clear all previously applied bypass rules
 */
function clearBypassRules() {
  console.log('Abdal FoxyByPass: Clearing previous bypass rules');
  
  // Remove any previously added styles
  const existingStyles = document.querySelectorAll('style[data-abdal-foxybypass]');
  existingStyles.forEach(style => style.remove());
  
  // Reset draggable attributes on images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.draggable = false;
    img.style.pointerEvents = '';
  });
  
  // Reset user-select on all elements
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    element.style.userSelect = '';
    element.style.webkitUserSelect = '';
    element.style.mozUserSelect = '';
    element.style.msUserSelect = '';
    element.style.cursor = '';
  });
  
  // Reset body styles
  if (document.body) {
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.mozUserSelect = '';
    document.body.style.msUserSelect = '';
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
  }
  
  // Note: In a more comprehensive implementation, we would track all event listeners
  // and remove them specifically. For now, we rely on the browser's event handling
  // to properly manage the new event listeners we add.
}

/**
 * Continuously monitor for new elements and apply bypass rules
 */
function startMonitoring() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Re-apply bypass rules to new elements
            if (settings.enableRightClick) {
              node.addEventListener('contextmenu', (e) => {
                e.stopImmediatePropagation();
                return true;
              }, true);
            }
            
            if (settings.enableDragAndDrop && node.matches) {
              if (node.matches('img')) {
                node.draggable = true;
                node.addEventListener('dragstart', (e) => {
                  e.stopImmediatePropagation();
                  return true;
                }, true);
              } else if (node.matches('p, div, span, h1, h2, h3, h4, h5, h6, a, li, td, th, label, input, textarea, pre, code')) {
                node.draggable = false;
                node.addEventListener('dragstart', (e) => {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return false;
                }, true);
              }
            }
            
            if (settings.enableTextSelection && node.matches) {
              if (node.matches('p, div, span, h1, h2, h3, h4, h5, h6, a, li, td, th, label, input, textarea, pre, code')) {
                node.style.userSelect = 'text';
                node.style.webkitUserSelect = 'text';
                node.style.mozUserSelect = 'text';
                node.style.msUserSelect = 'text';
                
                // Set appropriate cursor
                if (node.matches('a')) {
                  node.style.cursor = 'pointer';
                } else if (node.matches('input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="url"], textarea')) {
                  node.style.cursor = 'text';
                } else {
                  node.style.cursor = 'default';
                }
                
                // Remove any existing event listeners
                node.onmousedown = null;
                node.onmouseup = null;
                node.onselectstart = null;
                node.onselect = null;
                
                // Add our own event listeners
                node.addEventListener('mousedown', (e) => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  return true;
                }, true);
                
                node.addEventListener('mouseup', (e) => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  return true;
                }, true);
                
                node.addEventListener('selectstart', (e) => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  return true;
                }, true);
              }
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Start monitoring for dynamic content
document.addEventListener('DOMContentLoaded', startMonitoring); 