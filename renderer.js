// Markdown Renderer and File Indexer
class MarkdownRenderer {
    constructor() {
        this.fileListElement = document.getElementById('file-list');
        this.contentElement = document.getElementById('markdown-content');
        this.currentFileElement = document.getElementById('current-file');
        this.notes = new Map();
        this.backendMode = false; // Will be detected automatically
        
        this.setupMarked();
        this.detectBackendMode();
        this.setupUploadUI();
        this.loadNotes();
    }
    
    async detectBackendMode() {
        // Try to detect if PHP backend is available
        try {
            const response = await fetch('api/notes.php');
            if (response.ok || response.status === 200) {
                this.backendMode = true;
                console.log('Backend mode enabled');
            }
        } catch (error) {
            this.backendMode = false;
            console.log('Static mode (GitHub Pages compatible)');
        }
    }
    
    setupUploadUI() {
        const uploadButton = document.getElementById('upload-button');
        const uploadModal = document.getElementById('upload-modal');
        const closeModal = uploadModal?.querySelector('.close');
        const cancelButton = document.getElementById('cancel-upload');
        const uploadForm = document.getElementById('upload-form');
        
        // Show upload button only in backend mode
        setTimeout(() => {
            if (this.backendMode && uploadButton) {
                uploadButton.style.display = 'inline-block';
            }
        }, 100);
        
        if (!uploadButton || !uploadModal) return;
        
        uploadButton.addEventListener('click', () => {
            uploadModal.style.display = 'flex';
        });
        
        closeModal?.addEventListener('click', () => {
            uploadModal.style.display = 'none';
        });
        
        cancelButton?.addEventListener('click', () => {
            uploadModal.style.display = 'none';
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === uploadModal) {
                uploadModal.style.display = 'none';
            }
        });
        
        uploadForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFileUpload(uploadForm);
        });
    }
    
    async handleFileUpload(form) {
        const fileInput = form.querySelector('#file-input');
        const progressDiv = document.getElementById('upload-progress');
        const uploadModal = document.getElementById('upload-modal');
        
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select a file');
            return;
        }
        
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            progressDiv.style.display = 'block';
            form.style.display = 'none';
            
            const response = await fetch('api/upload.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }
            
            alert(`File uploaded successfully: ${result.filename}`);
            uploadModal.style.display = 'none';
            form.style.display = 'block';
            progressDiv.style.display = 'none';
            form.reset();
            
            // Reload notes list
            await this.loadNotes();
            
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + error.message);
            form.style.display = 'block';
            progressDiv.style.display = 'none';
        }
    }
    
    setupMarked() {
        // Configure marked for GitHub Flavored Markdown with custom renderer
        const renderer = {
            code({text, lang}) {
                const language = lang || '';
                if (language && hljs.getLanguage(language)) {
                    try {
                        const highlighted = hljs.highlight(text, { language }).value;
                        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
                    } catch (err) {
                        console.error('Highlight error:', err);
                    }
                }
                try {
                    const highlighted = hljs.highlightAuto(text).value;
                    return `<pre><code class="hljs">${highlighted}</code></pre>`;
                } catch (err) {
                    console.error('Auto-highlight error:', err);
                    // Escape HTML characters in code
                    const escaped = text
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                    return `<pre><code>${escaped}</code></pre>`;
                }
            }
        };
        
        marked.use({
            renderer,
            gfm: true,
            breaks: true
        });
    }
    
    async loadNotes() {
        if (this.backendMode) {
            // Load from API
            try {
                const response = await fetch('api/notes.php');
                if (response.ok) {
                    const data = await response.json();
                    this.displayFileList(data.notes || []);
                    return;
                }
            } catch (error) {
                console.error('Error loading notes from API:', error);
            }
        }
        
        // Fallback to static mode
        const sampleNotes = [
            {
                name: 'README.md',
                path: 'README.md'
            }
        ];
        
        // Try to load notes index if it exists
        try {
            const response = await fetch('notes-index.json');
            if (response.ok) {
                const index = await response.json();
                this.displayFileList(index.notes || sampleNotes);
            } else {
                this.displayFileList(sampleNotes);
            }
        } catch (error) {
            // If index doesn't exist, show sample notes
            this.displayFileList(sampleNotes);
        }
    }
    
    displayFileList(notes) {
        if (notes.length === 0) {
            this.fileListElement.innerHTML = `
                <div class="empty-state">
                    <p>No notes found</p>
                    <small>Create markdown files in the notes/ directory</small>
                </div>
            `;
            return;
        }
        
        this.fileListElement.innerHTML = '';
        
        notes.forEach(note => {
            const item = document.createElement('div');
            item.className = 'file-item';
            
            const icon = this.getFileIcon(note.name);
            item.innerHTML = `
                <span class="file-icon">${icon}</span>
                <span class="file-name">${note.name}</span>
            `;
            
            item.addEventListener('click', () => this.loadNote(note, item));
            this.fileListElement.appendChild(item);
            
            this.notes.set(note.name, note);
        });
    }
    
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'md': '📝',
            'markdown': '📝',
            'txt': '📄',
            'js': '📜',
            'json': '🔧',
            'html': '🌐',
            'css': '🎨'
        };
        return icons[ext] || '📄';
    }
    
    async loadNote(note, clickedElement) {
        try {
            // Update UI to show loading
            this.currentFileElement.textContent = note.name;
            this.contentElement.innerHTML = '<div class="loading">Loading...</div>';
            
            // Remove active class from all items
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            if (clickedElement) {
                clickedElement.classList.add('active');
            }
            
            // Fetch and render the markdown file
            const response = await fetch(note.path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const markdown = await response.text();
            this.renderMarkdown(markdown);
        } catch (error) {
            console.error('Error loading note:', error);
            this.contentElement.innerHTML = `
                <div class="error">
                    <h3>Error Loading Note</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    renderMarkdown(markdown) {
        try {
            const html = marked.parse(markdown);
            this.contentElement.innerHTML = html;
            
            // Scroll to top of content
            this.contentElement.scrollTop = 0;
            
            // Add copy buttons to code blocks
            this.addCopyButtons();
        } catch (error) {
            console.error('Error rendering markdown:', error);
            this.contentElement.innerHTML = `
                <div class="error">
                    <h3>Error Rendering Markdown</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    addCopyButtons() {
        const codeBlocks = this.contentElement.querySelectorAll('pre code');
        codeBlocks.forEach((block, index) => {
            const pre = block.parentElement;
            
            // Don't add button if it already exists
            if (pre.querySelector('.copy-button')) return;
            
            const button = document.createElement('button');
            button.className = 'copy-button';
            button.textContent = 'Copy';
            button.setAttribute('aria-label', 'Copy code to clipboard');
            
            button.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(block.textContent);
                    button.textContent = 'Copied!';
                    button.classList.add('copied');
                    
                    setTimeout(() => {
                        button.textContent = 'Copy';
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                    button.textContent = 'Failed';
                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 2000);
                }
            });
            
            pre.style.position = 'relative';
            pre.appendChild(button);
        });
    }
    
    highlightInitialCodeBlocks() {
        // Highlight any code blocks that were in the initial HTML
        const codeBlocks = document.querySelectorAll('pre code:not(.hljs)');
        codeBlocks.forEach(block => {
            // Extract language from class name (e.g., 'language-javascript')
            const classes = Array.from(block.classList);
            const langClass = classes.find(cls => cls.startsWith('language-'));
            const lang = langClass ? langClass.replace('language-', '') : '';
            
            if (lang && hljs.getLanguage(lang)) {
                try {
                    block.innerHTML = hljs.highlight(block.textContent, { language: lang }).value;
                    block.classList.add('hljs');
                    if (!block.classList.contains(`language-${lang}`)) {
                        block.classList.add(`language-${lang}`);
                    }
                } catch (err) {
                    console.error('Initial highlight error:', err);
                }
            } else {
                try {
                    const result = hljs.highlightAuto(block.textContent);
                    block.innerHTML = result.value;
                    block.classList.add('hljs');
                } catch (err) {
                    console.error('Initial auto-highlight error:', err);
                }
            }
        });
    }
}

// Initialize renderer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new MarkdownRenderer();
    // Highlight code blocks in the initial HTML
    renderer.highlightInitialCodeBlocks();
});
