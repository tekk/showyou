// Build script to create highlight.js bundle with common languages
const fs = require('fs');
const path = require('path');

// Read core highlight.js
const core = fs.readFileSync(path.join(__dirname, 'node_modules/highlight.js/lib/core.js'), 'utf8');

// List of common languages to include
const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    'xml', 'css', 'scss', 'json',
    'bash', 'shell', 'yaml', 'dockerfile',
    'sql', 'markdown', 'plaintext'
];

let bundle = `// Highlight.js bundle with common languages\n`;
bundle += `(function(window) {\n`;
bundle += `'use strict';\n\n`;

// Add core
bundle += `// Core\n`;
bundle += core + '\n\n';

// Add each language
languages.forEach(lang => {
    const langPath = path.join(__dirname, `node_modules/highlight.js/lib/languages/${lang}.js`);
    if (fs.existsSync(langPath)) {
        const langCode = fs.readFileSync(langPath, 'utf8');
        bundle += `// Language: ${lang}\n`;
        bundle += langCode + '\n\n';
    }
});

bundle += `window.hljs = module.exports;\n`;
bundle += `})(window);\n`;

// Write bundle
fs.writeFileSync(path.join(__dirname, 'lib/highlight.bundle.js'), bundle);
console.log('Highlight.js bundle created successfully!');
