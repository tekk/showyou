#!/bin/bash
# Create a comprehensive highlight.js bundle

cat node_modules/highlight.js/lib/core.js > lib/highlight.min.js

# Add most common programming languages
for lang in javascript typescript python java cpp csharp php ruby go rust swift kotlin xml css scss json bash shell yaml dockerfile sql markdown plaintext; do
    if [ -f "node_modules/highlight.js/lib/languages/${lang}.js" ]; then
        echo "Adding ${lang}..."
        cat "node_modules/highlight.js/lib/languages/${lang}.js" >> lib/highlight.min.js
    fi
done

echo "Highlight.js bundle created!"
