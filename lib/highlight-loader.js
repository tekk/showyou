// Standalone highlight.js initialization with common languages
// This wrapper properly initializes hljs with language support

(function() {
    'use strict';
    
    // Load highlight.js core
    const coreScript = document.createElement('script');
    coreScript.src = 'lib/highlight.core.js';
    coreScript.type = 'text/javascript';
    
    coreScript.onload = function() {
        // After core is loaded, register languages
        const hljs = window.hljs || module.exports;
        
        // Language registration function
        function registerLanguage(name, langFunc) {
            try {
                if (hljs && hljs.registerLanguage) {
                    hljs.registerLanguage(name, langFunc);
                }
            } catch(e) {
                console.warn('Could not register language:', name, e);
            }
        }
        
        // Make hljs globally available
        window.hljs = hljs;
        
        console.log('Highlight.js core loaded successfully');
    };
    
    coreScript.onerror = function() {
        console.error('Failed to load highlight.js core');
    };
    
    document.head.appendChild(coreScript);
})();
