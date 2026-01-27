// Simplified highlight.js stub for browser
// This creates a minimal working version that highlights code with basic patterns

(function(window) {
    'use strict';
    
    // Simple syntax highlighter
    const hljs = {
        highlightAuto: function(code) {
            return {
                value: this.highlightCode(code)
            };
        },
        
        highlight: function(code, options) {
            return {
                value: this.highlightCode(code)
            };
        },
        
        getLanguage: function(lang) {
            // Return true for all languages
            return true;
        },
        
        highlightCode: function(code) {
            // Escape HTML
            code = code.replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;');
            
            // Apply basic syntax highlighting patterns
            code = code
                // Comments
                .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, '<span class="hljs-comment">$1</span>')
                // Strings
                .replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, '<span class="hljs-string">$1</span>')
                // Keywords
                .replace(/\b(function|class|const|let|var|if|else|for|while|return|import|export|from|async|await|def|public|private|protected|static|void|int|string|bool|boolean)\b/g, '<span class="hljs-keyword">$1</span>')
                // Numbers
                .replace(/\b(\d+\.?\d*)\b/g, '<span class="hljs-number">$1</span>')
                // Built-ins
                .replace(/\b(console|window|document|Array|Object|String|Number|Math|JSON|Promise)\b/g, '<span class="hljs-built_in">$1</span>');
            
            return code;
        }
    };
    
    window.hljs = hljs;
})(window);
