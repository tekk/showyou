// Markdown Renderer and File Indexer
class MarkdownRenderer {
    constructor() {
        this.fileListElement = document.getElementById('file-list');
        this.contentElement = document.getElementById('markdown-content');
        this.currentFileElement = document.getElementById('current-file');
        this.notes = new Map();
        this.backendMode = false; // Will be detected automatically
        this.monacoEditor = null;
        this.currentEditingNote = null;
        this.authenticated = false;
        this.currentPasswordNote = null;
        this.currentShareNote = null;
        
        this.setupMarked();
        this.setupEditorUI();
        this.setupAuthUI();
        this.setupPasswordPromptUI();
        this.setupShareUI();
        
        // Chain async operations properly
        this.detectBackendMode().then(() => {
            this.checkAuth().then(() => {
                this.setupUploadUI();
                this.loadNotes();
            });
        });
        
        // Initialize Monaco Editor
        this.initMonacoEditor();
    }
    
    async detectBackendMode() {
        // Try to detect if PHP backend is available
        try {
            const response = await fetch('api/notes.php');
            if (response.ok) {
                this.backendMode = true;
                console.log('Backend mode enabled');
            }
        } catch (error) {
            this.backendMode = false;
            console.log('Static mode (GitHub Pages compatible)');
        }
    }
    
    async checkAuth() {
        if (!this.backendMode) return;
        
        try {
            const response = await fetch('api/auth.php');
            const data = await response.json();
            
            if (data.authenticated) {
                this.authenticated = true;
                console.log('Authenticated as:', data.username);
            } else {
                this.showLoginModal();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // If auth endpoint doesn't exist or fails, assume no auth required
            this.authenticated = true;
        }
    }
    
    setupAuthUI() {
        const loginForm = document.getElementById('login-form');
        const loginModal = document.getElementById('login-modal');
        
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(loginForm);
        });
    }
    
    showLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
    }
    
    hideLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
    }
    
    async handleLogin(form) {
        const username = form.querySelector('#login-username').value;
        const password = form.querySelector('#login-password').value;
        const errorDiv = document.getElementById('login-error');
        
        try {
            const response = await fetch('api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.authenticated = true;
                this.hideLoginModal();
                this.loadNotes();
            } else {
                errorDiv.textContent = data.error || 'Login failed';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Login failed: ' + error.message;
            errorDiv.style.display = 'block';
        }
    }
    
    setupPasswordPromptUI() {
        const form = document.getElementById('password-prompt-form');
        const cancelBtn = document.getElementById('password-cancel');
        
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('note-password-prompt').value;
            await this.verifyNotePassword(password);
        });
        
        cancelBtn?.addEventListener('click', () => {
            this.hidePasswordPrompt();
        });
    }
    
    showPasswordPrompt(note) {
        this.currentPasswordNote = note;
        const modal = document.getElementById('password-prompt-modal');
        const errorDiv = document.getElementById('password-error');
        const input = document.getElementById('note-password-prompt');
        
        if (modal) {
            errorDiv.style.display = 'none';
            input.value = '';
            modal.style.display = 'flex';
        }
    }
    
    hidePasswordPrompt() {
        const modal = document.getElementById('password-prompt-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentPasswordNote = null;
    }
    
    async verifyNotePassword(password) {
        if (!this.currentPasswordNote) return;
        
        const note = this.currentPasswordNote;
        const errorDiv = document.getElementById('password-error');
        
        // Hash check is done on backend for shares, but for local notes
        // we need to check here (though we don't store passwords for local viewing)
        // For simplicity, we'll just load the note if password is provided
        // In production, you might want to verify the hash client-side or server-side
        
        // For now, just try to load the note (password already verified in index)
        this.hidePasswordPrompt();
        this.loadNote(note);
    }
    
    setupShareUI() {
        const closeBtn = document.getElementById('share-close');
        const copyBtn = document.getElementById('copy-share-link');
        const burnCheckbox = document.getElementById('burn-after-reading');
        
        closeBtn?.addEventListener('click', () => {
            this.hideShareModal();
        });
        
        copyBtn?.addEventListener('click', async () => {
            const input = document.getElementById('share-link-input');
            try {
                await navigator.clipboard.writeText(input.value);
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            } catch (err) {
                // Fallback for older browsers
                input.select();
                try {
                    document.execCommand('copy');
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                    }, 2000);
                } catch (e) {
                    console.error('Failed to copy:', e);
                    copyBtn.textContent = 'Failed';
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                    }, 2000);
                }
            }
        });
        
        burnCheckbox?.addEventListener('change', async (e) => {
            const warning = document.getElementById('burn-warning');
            warning.style.display = e.target.checked ? 'block' : 'none';
            
            // Regenerate share link with updated settings
            if (this.currentShareNote) {
                const linkInput = document.getElementById('share-link-input');
                linkInput.value = 'Updating share link...';
                
                try {
                    const response = await fetch('api/share.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            path: this.currentShareNote.path,
                            burnAfterReading: e.target.checked
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok && data.success) {
                        linkInput.value = data.shareUrl;
                    } else {
                        linkInput.value = 'Error: ' + (data.error || 'Failed to update share link');
                    }
                } catch (error) {
                    console.error('Share update error:', error);
                    linkInput.value = 'Error: ' + error.message;
                }
            }
        });
    }
    
    async showShareModal(note) {
        this.currentShareNote = note;
        const modal = document.getElementById('share-modal');
        const noteNameEl = document.getElementById('share-note-name');
        const linkInput = document.getElementById('share-link-input');
        const burnCheckbox = document.getElementById('burn-after-reading');
        const warning = document.getElementById('burn-warning');
        
        if (!modal) return;
        
        noteNameEl.textContent = `Sharing: ${note.name}`;
        linkInput.value = 'Generating share link...';
        burnCheckbox.checked = false;
        warning.style.display = 'none';
        modal.style.display = 'flex';
        
        try {
            const response = await fetch('api/share.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    path: note.path,
                    burnAfterReading: false
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                linkInput.value = data.shareUrl;
                this.currentShareData = data;
            } else {
                linkInput.value = 'Error: ' + (data.error || 'Failed to generate share link');
            }
        } catch (error) {
            console.error('Share error:', error);
            linkInput.value = 'Error: ' + error.message;
        }
    }
    
    hideShareModal() {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    async updateShareSettings() {
        if (!this.currentShareData) return;
        
        const burnCheckbox = document.getElementById('burn-after-reading');
        const note = this.currentPasswordNote;
        
        // Re-create share with new settings
        // This is handled when user changes checkbox
    }
    
    setupUploadUI() {
        const uploadButton = document.getElementById('upload-button');
        const uploadModal = document.getElementById('upload-modal');
        const closeModal = uploadModal?.querySelector('.close');
        const cancelButton = document.getElementById('cancel-upload');
        const uploadForm = document.getElementById('upload-form');
        const newNoteButton = document.getElementById('new-note-button');
        
        // Show upload button only in backend mode
        setTimeout(() => {
            if (this.backendMode && uploadButton) {
                uploadButton.style.display = 'inline-block';
            }
        }, 100);
        
        // New note button - always visible
        newNoteButton?.addEventListener('click', () => {
            this.openEditor();
        });
        
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
        
        // Get UI elements for progress tracking
        const progressFill = document.getElementById('lolcat-progress-fill');
        const progressCat = document.querySelector('.lolcat-cat');
        const percentageText = document.getElementById('upload-percentage');
        const filenameText = document.getElementById('upload-filename');
        const filesizeText = document.getElementById('upload-filesize');
        const uploadedText = document.getElementById('upload-uploaded');
        const speedText = document.getElementById('upload-speed');
        const timeText = document.getElementById('upload-time');
        
        // Minimum time difference for accurate speed calculation (in seconds)
        const MIN_TIME_DIFF_FOR_SPEED_CALC = 0.1;
        
        try {
            // Show progress UI and hide form
            progressDiv.style.display = 'block';
            form.style.display = 'none';
            
            // Set initial values
            filenameText.textContent = file.name;
            filesizeText.textContent = this.formatFileSize(file.size);
            uploadedText.textContent = '0 B';
            speedText.textContent = '0 B/s';
            timeText.textContent = 'Calculating...';
            percentageText.textContent = '0%';
            
            // Upload with progress tracking using XMLHttpRequest
            const startTime = Date.now();
            let lastLoaded = 0;
            let lastTime = startTime;
            
            const result = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentage = (e.loaded / e.total) * 100;
                        const currentTime = Date.now();
                        const timeDiff = (currentTime - lastTime) / 1000; // seconds
                        const loadedDiff = e.loaded - lastLoaded;
                        
                        // Update progress bar
                        progressFill.style.width = percentage + '%';
                        progressCat.style.left = percentage + '%';
                        percentageText.textContent = Math.round(percentage) + '%';
                        
                        // Update statistics
                        uploadedText.textContent = this.formatFileSize(e.loaded);
                        
                        // Calculate speed (only if enough time has passed)
                        if (timeDiff > MIN_TIME_DIFF_FOR_SPEED_CALC) {
                            const speed = loadedDiff / timeDiff;
                            speedText.textContent = this.formatFileSize(speed) + '/s';
                            
                            // Calculate time remaining
                            const remaining = e.total - e.loaded;
                            const timeRemaining = remaining / speed;
                            timeText.textContent = this.formatTime(timeRemaining);
                            
                            lastLoaded = e.loaded;
                            lastTime = currentTime;
                        }
                    }
                });
                
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (e) {
                            reject(new Error('Invalid response from server'));
                        }
                    } else {
                        try {
                            const errorData = JSON.parse(xhr.responseText);
                            reject(new Error(errorData.error || 'Upload failed'));
                        } catch (e) {
                            reject(new Error('Upload failed with status: ' + xhr.status));
                        }
                    }
                });
                
                xhr.addEventListener('error', () => {
                    reject(new Error('Network error during upload'));
                });
                
                xhr.addEventListener('abort', () => {
                    reject(new Error('Upload cancelled'));
                });
                
                xhr.open('POST', 'api/upload.php');
                xhr.send(formData);
            });
            
            // Upload complete
            progressFill.style.width = '100%';
            progressCat.style.left = '100%';
            percentageText.textContent = '100%';
            speedText.textContent = this.formatFileSize(file.size / ((Date.now() - startTime) / 1000)) + '/s';
            timeText.textContent = 'Complete!';
            
            // Insert file reference into editor if it's open
            if (this.monacoEditor && document.getElementById('editor-modal').style.display === 'flex') {
                const fileRef = this.generateFileReference(result);
                const position = this.monacoEditor.getPosition();
                const range = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column);
                this.monacoEditor.executeEdits('', [{
                    range: range,
                    text: fileRef,
                    forceMoveMarkers: true
                }]);
            }
            
            // Show success message
            setTimeout(() => {
                alert(`File uploaded successfully: ${result.filename}\n\nFile reference has been inserted into the editor.`);
                uploadModal.style.display = 'none';
                form.style.display = 'block';
                progressDiv.style.display = 'none';
                form.reset();
                
                // Reset progress UI
                progressFill.style.width = '0%';
                progressCat.style.left = '0%';
                
                // Reload notes list
                this.loadNotes();
            }, 500);
            
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + error.message);
            form.style.display = 'block';
            progressDiv.style.display = 'none';
            
            // Reset progress UI
            progressFill.style.width = '0%';
            progressCat.style.left = '0%';
        }
    }
    
    generateFileReference(uploadResult) {
        const { filename, type, originalName } = uploadResult;
        const path = `uploads/${filename}`;
        
        // Determine if it's an image
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
        if (imageExts.includes(type.toLowerCase())) {
            return `\n![${originalName}](${path})\n`;
        }
        
        // For other files, create a link
        return `\n[${originalName}](${path})\n`;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    formatTime(seconds) {
        if (!isFinite(seconds) || seconds <= 0) return 'Calculating...';
        if (seconds < 1) return '< 1s';
        if (seconds < 60) return Math.round(seconds) + 's';
        if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.round(seconds % 60);
            return `${minutes}m ${secs}s`;
        }
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
    
    setupEditorUI() {
        const editorModal = document.getElementById('editor-modal');
        const closeBtn = document.getElementById('editor-close');
        const cancelBtn = document.getElementById('editor-cancel');
        const saveBtn = document.getElementById('editor-save');
        const tabEdit = document.getElementById('tab-edit');
        const tabPreview = document.getElementById('tab-preview');
        const editPane = document.getElementById('editor-edit-pane');
        const previewPane = document.getElementById('editor-preview-pane');
        const titleInput = document.getElementById('note-title-input');
        
        if (!editorModal) return;
        
        // Close modal
        closeBtn?.addEventListener('click', () => {
            this.closeEditor();
        });
        
        cancelBtn?.addEventListener('click', () => {
            this.closeEditor();
        });
        
        // Note: Window click handler removed for full-page editor
        
        // Tab switching
        tabEdit?.addEventListener('click', () => {
            tabEdit.classList.add('active');
            tabPreview.classList.remove('active');
            editPane.classList.add('active');
            previewPane.classList.remove('active');
        });
        
        tabPreview?.addEventListener('click', () => {
            tabPreview.classList.add('active');
            tabEdit.classList.remove('active');
            previewPane.classList.add('active');
            editPane.classList.remove('active');
            this.updatePreview();
        });
        
        // Save button
        saveBtn?.addEventListener('click', async () => {
            await this.saveNote();
        });
        
        // Auto-update slug from title
        titleInput?.addEventListener('input', (e) => {
            const slugInput = document.getElementById('note-slug-input');
            if (!this.currentEditingNote && slugInput && !slugInput.value) {
                // Only auto-generate slug for new notes if user hasn't set custom slug
                const slug = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                slugInput.value = slug;
            }
        });
        
        // Initialize Monaco Editor
        this.initMonacoEditor();
    }
    
    initMonacoEditor() {
        if (typeof require !== 'undefined') {
            // Monaco loader is available
            require.config({ 
                paths: { 
                    'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' 
                } 
            });
            
            require(['vs/editor/editor.main'], () => {
                this.createMonacoEditor();
            });
        } else {
            // Wait for Monaco loader to load
            setTimeout(() => this.initMonacoEditor(), 100);
        }
    }
    
    createMonacoEditor() {
        const container = document.getElementById('monaco-editor');
        if (!container || this.monacoEditor) return;
        
        this.monacoEditor = monaco.editor.create(container, {
            value: '',
            language: 'markdown',
            theme: 'vs-dark',
            automaticLayout: true,
            wordWrap: 'on',
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            folding: true,
            renderWhitespace: 'selection'
        });
    }
    
    openEditor(note = null) {
        const editorModal = document.getElementById('editor-modal');
        const titleInput = document.getElementById('note-title-input');
        const slugInput = document.getElementById('note-slug-input');
        const editorTitle = document.getElementById('editor-title');
        const tabEdit = document.getElementById('tab-edit');
        const tabPreview = document.getElementById('tab-preview');
        const editPane = document.getElementById('editor-edit-pane');
        const previewPane = document.getElementById('editor-preview-pane');
        
        if (!editorModal) return;
        
        this.currentEditingNote = note;
        
        // Reset tabs to edit mode
        tabEdit.classList.add('active');
        tabPreview.classList.remove('active');
        editPane.classList.add('active');
        previewPane.classList.remove('active');
        
        if (note) {
            // Edit mode
            editorTitle.textContent = 'Edit Note';
            titleInput.value = note.name;
            slugInput.value = note.slug || '';
            
            // Load note content
            this.loadNoteContent(note).then(content => {
                if (this.monacoEditor) {
                    this.monacoEditor.setValue(content);
                }
            });
        } else {
            // Create mode
            editorTitle.textContent = 'Create Note';
            titleInput.value = '';
            slugInput.value = '';
            if (this.monacoEditor) {
                this.monacoEditor.setValue('# New Note\n\nStart writing...\n');
            }
        }
        
        editorModal.style.display = 'flex';
        
        // Force Monaco editor to recalculate its size
        setTimeout(() => {
            if (this.monacoEditor) {
                this.monacoEditor.layout();
            }
            titleInput.focus();
        }, 100);
    }
    
    closeEditor() {
        const editorModal = document.getElementById('editor-modal');
        if (editorModal) {
            editorModal.style.display = 'none';
        }
        this.currentEditingNote = null;
    }
    
    updatePreview() {
        const previewPane = document.getElementById('editor-preview-pane');
        if (!this.monacoEditor || !previewPane) return;
        
        const markdown = this.monacoEditor.getValue();
        const html = marked.parse(markdown);
        previewPane.innerHTML = html;
        
        // Add copy buttons to code blocks in preview
        this.addCopyButtonsToElement(previewPane);
    }
    
    async loadNoteContent(note) {
        try {
            const response = await fetch(note.path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading note content:', error);
            return '# Error\n\nFailed to load note content.';
        }
    }
    
    async saveNote() {
        const titleInput = document.getElementById('note-title-input');
        const slugInput = document.getElementById('note-slug-input');
        const passwordInput = document.getElementById('note-password-input');
        
        const title = titleInput.value.trim();
        const slug = slugInput.value.trim();
        const password = passwordInput.value.trim();
        const content = this.monacoEditor ? this.monacoEditor.getValue() : '';
        
        if (!title) {
            alert('Please enter a note title');
            return;
        }
        
        if (!content.trim()) {
            alert('Please enter some content');
            return;
        }
        
        try {
            if (this.currentEditingNote) {
                // Update existing note
                await this.updateNote(this.currentEditingNote.path, content);
            } else {
                // Create new note
                await this.createNote(title, content, slug, password);
            }
            
            this.closeEditor();
            await this.loadNotes();
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save note: ' + error.message);
        }
    }
    
    async createNote(name, content, slug = '', password = '') {
        if (!this.backendMode) {
            alert('Note creation is only available in backend mode');
            return;
        }
        
        const body = { name, content, slug };
        if (password) {
            body.password = password;
        }
        
        const response = await fetch('api/notes.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create note');
        }
        
        return await response.json();
    }
    
    async updateNote(path, content) {
        if (!this.backendMode) {
            alert('Note updating is only available in backend mode');
            return;
        }
        
        const response = await fetch('api/notes.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path, content })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update note');
        }
        
        return await response.json();
    }
    
    async deleteNote(note) {
        if (!this.backendMode) {
            alert('Note deletion is only available in backend mode');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete "${note.name}"?`)) {
            return;
        }
        
        try {
            const response = await fetch('api/notes.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path: note.path })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete note');
            }
            
            await this.loadNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note: ' + error.message);
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
            },
            image({href, title, text}) {
                // Support both absolute and relative paths
                // If href starts with uploads/ or notes/, it's a reference to uploaded file
                let src = href;
                if (!href.startsWith('http') && !href.startsWith('/') && !href.startsWith('data:')) {
                    // Relative path - check if it's in uploads or notes
                    if (href.startsWith('uploads/') || href.startsWith('notes/')) {
                        src = href;
                    } else {
                        // Assume it's in uploads
                        src = 'uploads/' + href;
                    }
                }
                
                const titleAttr = title ? ` title="${title}"` : '';
                const alt = text || '';
                return `<img src="${src}" alt="${alt}"${titleAttr} loading="lazy" />`;
            },
            link({href, title, text}) {
                // Support references to uploaded files
                let url = href;
                if (!href.startsWith('http') && !href.startsWith('/') && !href.startsWith('#') && !href.startsWith('data:')) {
                    if (!href.startsWith('uploads/') && !href.startsWith('notes/')) {
                        url = 'uploads/' + href;
                    }
                }
                
                const titleAttr = title ? ` title="${title}"` : '';
                // Open PDFs and other documents in new tab
                const target = url.match(/\.(pdf|docx?|xlsx?|pptx?|zip|rar)$/i) ? ' target="_blank" rel="noopener"' : '';
                return `<a href="${url}"${titleAttr}${target}>${text}</a>`;
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
            
            const content = document.createElement('div');
            content.className = 'file-item-content';
            content.innerHTML = `
                <span class="file-icon">${icon}</span>
                <span class="file-name">${note.name}</span>
            `;
            
            const actions = document.createElement('div');
            actions.className = 'file-item-actions';
            
            if (this.backendMode) {
                const shareBtn = document.createElement('button');
                shareBtn.className = 'file-action-btn share';
                shareBtn.innerHTML = '🔗';
                shareBtn.title = 'Share';
                shareBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showShareModal(note);
                });
                
                const editBtn = document.createElement('button');
                editBtn.className = 'file-action-btn edit';
                editBtn.innerHTML = '✏️';
                editBtn.title = 'Edit';
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openEditor(note);
                });
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'file-action-btn delete';
                deleteBtn.innerHTML = '🗑️';
                deleteBtn.title = 'Delete';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteNote(note);
                });
                
                actions.appendChild(shareBtn);
                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);
            }
            
            content.addEventListener('click', () => this.loadNote(note, item));
            
            item.appendChild(content);
            item.appendChild(actions);
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
        this.addCopyButtonsToElement(this.contentElement);
    }
    
    addCopyButtonsToElement(element) {
        const codeBlocks = element.querySelectorAll('pre code');
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
