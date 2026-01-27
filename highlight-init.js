// Highlight.js initialization with common languages
// Using a bundled approach to load highlight.js with most common programming languages

(function() {
    // Load highlight.js core from node_modules
    const script = document.createElement('script');
    script.src = 'node_modules/highlight.js/lib/core.js';
    script.type = 'module';
    
    script.onload = function() {
        // Load common language modules
        const languages = [
            'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
            'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
            'xml', 'css', 'scss', 'json',
            'bash', 'shell', 'yaml', 'dockerfile',
            'sql', 'r', 'matlab', 'scala', 'perl', 'lua', 'dart'
        ];
        
        // This is a fallback - we'll create a standalone bundle instead
        console.log('Highlight.js loaded');
    };
    
    document.head.appendChild(script);
})();
