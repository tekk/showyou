// Create browser-compatible highlight.js bundle
const fs = require('fs');
const path = require('path');

// Wrap in IIFE for browser
let bundle = `(function(window) {
'use strict';

`;

// Read and include core
const corePath = path.join(__dirname, 'node_modules/highlight.js/lib/core.js');
let coreCode = fs.readFileSync(corePath, 'utf8');

// Replace module.exports with a variable
coreCode = coreCode.replace(/module\.exports\s*=/g, 'var hljs =');
coreCode = coreCode.replace(/require\([^)]+\)/g, '{}');

bundle += '// Core\n' + coreCode + '\n\n';

// Language list
const languages = {
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'csharp': 'csharp',
    'php': 'php',
    'ruby': 'ruby',
    'go': 'go',
    'rust': 'rust',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'xml': 'xml',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'bash': 'bash',
    'shell': 'shell',
    'yaml': 'yaml',
    'dockerfile': 'dockerfile',
    'sql': 'sql',
    'markdown': 'markdown',
    'plaintext': 'plaintext'
};

// Add each language wrapped in its own scope
Object.entries(languages).forEach(([name, file]) => {
    const langPath = path.join(__dirname, `node_modules/highlight.js/lib/languages/${file}.js`);
    if (fs.existsSync(langPath)) {
        let langCode = fs.readFileSync(langPath, 'utf8');
        
        // Wrap each language in an IIFE to avoid variable conflicts
        bundle += `// Language: ${name}\n`;
        bundle += `(function() {\n`;
        bundle += langCode.replace(/module\.exports\s*=/, 'var langDef =');
        bundle += `\nhljs.registerLanguage('${name}', langDef);\n`;
        bundle += `})();\n\n`;
    }
});

// Export to window
bundle += `
window.hljs = hljs;

})(window);
`;

// Write bundle
const outputPath = path.join(__dirname, 'lib/highlight.bundle.js');
fs.writeFileSync(outputPath, bundle);

console.log('✅ Browser-compatible highlight.js bundle created!');
console.log(`📦 Output: ${outputPath}`);
console.log(`📊 Size: ${(bundle.length / 1024).toFixed(2)} KB`);
