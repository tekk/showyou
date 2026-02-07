# 📝 Private Notes

**GitHub Flavored Markdown renderer with VS Code-style syntax highlighting.**

![Private Notes](https://img.shields.io/badge/Status-Complete-success)
![WebGL](https://img.shields.io/badge/WebGL-1.0-blue)
![Languages](https://img.shields.io/badge/Languages-23+-orange)

## ✨ Features

### 🌟 WebGL Parallax Stars Background
- Three-layer depth effect with realistic parallax
- Mouse-responsive star movement
- Twinkling animations at 60 FPS
- Procedurally generated using fragment shaders

### 🌙 Beautiful Dark Mode
- Professional color palette optimized for readability
- Glassmorphism effects with backdrop blur
- Smooth transitions and animations
- Fully responsive design

### 📝 Complete GFM Support
- Full GitHub Flavored Markdown rendering
- Tables, task lists, code blocks
- Blockquotes, lists, images
- Autolinks and more

### ✏️ Rich Note Editor (Backend Mode)
- **Monaco Editor** integration (VSCode source code editor)
- Live markdown preview with tab switching
- Create, edit, and delete notes through the UI
- Custom slugs for sharing notes with clean URLs
- Auto-insert file references when uploading

### 📤 Smart File Uploads (Backend Mode)
- Upload any file type (images, PDFs, videos, etc.) up to 4GB
- Automatic file reference insertion into notes
- Non-blocking uploads while editing
- Beautiful "lolcat" progress bar with real-time stats
- Support for markdown image and link references

### 🎨 Vivid Syntax Highlighting
- **23+ programming languages** supported
- VS Code-style color scheme
- Copy-to-clipboard buttons
- Optimized for dark backgrounds

**Supported Languages:**
JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, HTML/XML, CSS, SCSS, JSON, Bash, Shell, YAML, Dockerfile, SQL, Markdown, Plaintext

### 🔐 Security & Authentication (Backend Mode)
- **Site-wide authentication** with session management
- **Per-note password protection** using bcrypt hashing
- Environment-based credential configuration
- Protected API endpoints with automatic auth checks
- Secure session handling

### 🔗 Sharing & Collaboration (Backend Mode)
- **Share notes** with unique cryptographic tokens
- **Password-protected shares** for sensitive content
- **Burn after reading** - self-destructing notes that delete after first view
- Share links work without requiring login
- Beautiful share viewer page with same dark theme

## 🚀 Quick Start

### Static Mode (GitHub Pages)

1. Clone the repository
2. Serve with any HTTP server:
   ```bash
   python3 -m http.server 8000
   # or
   npx serve
   ```
3. Open http://localhost:8000

### PHP Backend Mode (with File Uploads)

The PHP backend allows you to upload files directly through the UI and automatically manages the notes index.

#### Using Docker (Recommended)

1. Clone the repository
2. Start the Docker container:
   ```bash
   docker-compose up -d
   ```
3. Open http://localhost:8080
4. Click the "📤 Upload" button to upload markdown files or attachments

#### Using Local PHP

1. Clone the repository
2. Ensure PHP 8.0+ is installed
3. Start the PHP development server:
   ```bash
   php -S localhost:8080
   ```
4. Open http://localhost:8080

**Note**: The application automatically detects whether it's running in static mode or with PHP backend support.

### Add Your Notes

#### With PHP Backend

**Create Notes:**
1. Click the "➕ New" button in the sidebar
2. Enter a title and optional custom slug for sharing
3. Write your content using the Monaco editor (VSCode-based)
4. Switch between Edit and Preview tabs to see how it looks
5. Click "💾 Save" to save your note

**Upload Files:**
1. Click the "📤 Upload" button in the UI
2. Select any file (markdown, images, PDFs, videos, archives, etc.)
3. If you're editing a note, the file reference will be automatically inserted
4. The file is automatically uploaded and indexed
5. Markdown files appear in the sidebar immediately

**Edit/Delete Notes:**
- Hover over any note in the sidebar to see edit (✏️) and delete (🗑️) buttons
- Click edit to modify the note content
- Click delete to remove the note (with confirmation)

**Reference Uploaded Files in Markdown:**
- Images: `![Alt text](filename.jpg)` or `![Alt text](uploads/filename.jpg)`
- Documents: `[Document name](filename.pdf)` or `[Document name](uploads/filename.pdf)`
- Files are automatically linked when uploaded during note editing

**File restrictions**: Maximum file size is 4GB (FAT32 limit). Executable and server-side script files are blocked for security.

**Share Notes:**
1. Click the share button (🔗) next to any note in the sidebar
2. A share link is automatically generated
3. Optionally check "Burn after reading" to make it self-destruct
4. Copy the link and share it with others
5. Shared notes can be viewed without logging in
6. Password-protected notes require the password even when shared

**Password-Protected Notes:**
1. When creating a note, enter a password in the password field (optional)
2. The password is securely hashed using bcrypt
3. Anyone viewing the note (including shares) will need to enter the password
4. Passwords are never stored in plain text

#### Static Mode (Manual)

1. Create `.md` files in the `notes/` directory
2. Update `notes-index.json`:
   ```json
   {
     "notes": [
       {
         "name": "My Note",
         "path": "notes/my-note.md"
       }
     ]
   }
   ```
3. Reload the page

## ⚙️ Configuration

### Environment Variables

The following environment variables can be set in `.env` file or passed to Docker:

```bash
# Authentication Configuration
AUTH_ENABLED=true                    # Set to 'false' to disable authentication
AUTH_USERS=admin:your-secure-password-here         # Username:password pairs (comma-separated)

# CORS Configuration
ALLOWED_ORIGINS=*                    # Allowed origins for CORS (use specific domain in production)
```

**Example `.env` file:**
```bash
AUTH_ENABLED=true
AUTH_USERS=admin:MySecurePass123!,user2:AnotherStrongPass456!
ALLOWED_ORIGINS=https://yourdomain.com
```

**Docker Configuration:**
Update `docker-compose.yml` with your environment variables or create a `.env` file:
```yaml
environment:
  - AUTH_ENABLED=${AUTH_ENABLED:-true}
  - AUTH_USERS=${AUTH_USERS:-admin:your-password-here}
  - ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-*}
```

**Security Best Practices:**
- ⚠️ **CHANGE DEFAULT CREDENTIALS** before deploying to production
- Use strong passwords with mix of characters
- Set `ALLOWED_ORIGINS` to your specific domain in production
- Use HTTPS in production environments
- Keep authentication enabled unless you have another security layer

## 📸 Screenshots

![Homepage](https://github.com/user-attachments/assets/602b08c3-448c-4999-a6bb-76d195c9a14c)
*Beautiful dark mode interface with parallax stars*

![Syntax Highlighting](https://github.com/user-attachments/assets/103e6e38-415b-46d7-a6c3-734496d2fa2c)
*Vivid VS Code-style syntax highlighting*

## 🛠️ Development

### API Endpoints (PHP Backend)

When running with the PHP backend, the following API endpoints are available:

#### Authentication

**Check Auth Status**
```
GET /api/auth.php

Response:
{
  "authenticated": true,
  "username": "admin"
}
```

**Login**
```
POST /api/auth.php
Content-Type: application/json

Body:
{
  "username": "admin",
  "password": "your-password-here"
}

Response:
{
  "success": true,
  "username": "admin"
}
```

**Logout**
```
DELETE /api/auth.php

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Notes Management

**List Notes**
```
GET /api/notes.php
Requires: Authentication

Response:
{
  "notes": [
    {
      "name": "Example Note",
      "path": "notes/example.md",
      "slug": "example",
      "passwordHash": "$2y$10$...",
      "shareToken": "abc123..."
    }
  ]
}
```

**Create Note**
```
POST /api/notes.php
Requires: Authentication
Content-Type: application/json

Body:
{
  "name": "My Note",
  "content": "# Hello World",
  "slug": "my-note",
  "password": "optional-password"
}

Response:
{
  "success": true,
  "name": "My Note",
  "path": "notes/my-note.md",
  "slug": "my-note"
}
```

**Update Note**
```
PUT /api/notes.php
Requires: Authentication
Content-Type: application/json

Body:
{
  "path": "notes/my-note.md",
  "content": "# Updated content"
}

Response:
{
  "success": true,
  "path": "notes/my-note.md"
}
```

**Delete Note**
```
DELETE /api/notes.php
Requires: Authentication
Content-Type: application/json

Body:
{
  "path": "notes/my-note.md"
}

Response:
{
  "success": true,
  "path": "notes/my-note.md"
}
```

#### Sharing

**Create Share Link**
```
POST /api/share.php
Requires: Authentication
Content-Type: application/json

Body:
{
  "path": "notes/my-note.md",
  "burnAfterReading": false
}

Response:
{
  "success": true,
  "shareToken": "abc123...",
  "shareUrl": "http://localhost:8080/share.html?token=abc123...",
  "burnAfterReading": false
}
```

**View Shared Note**
```
GET /api/share.php?token=abc123&password=optional
Requires: No authentication (public endpoint)

Response:
{
  "success": true,
  "name": "My Note",
  "content": "# Hello World",
  "burnAfterReading": false
}
```

Note: If `burnAfterReading` is true, the note is automatically deleted after being viewed.

#### Upload File
```
POST /api/upload.php
Content-Type: multipart/form-data

Form Data:
- file: File to upload

Response:
{
  "success": true,
  "filename": "2026-01-27_143000_example.md",
  "originalName": "example.md",
  "path": "uploads/2026-01-27_143000_example.md",
  "size": 1024,
  "type": "md"
}
```

#### List Notes
```
GET /api/notes.php

Response:
{
  "notes": [
    {
      "name": "Example Note",
      "path": "notes/example.md"
    }
  ]
}
```

#### Create Note
```
POST /api/notes.php
Content-Type: application/json

Body:
{
  "name": "My Note",
  "content": "# My Note\n\nContent here"
}

Response:
{
  "success": true,
  "name": "My Note",
  "path": "notes/2026-01-27_143000_My-Note.md"
}
```

#### Update Note
```
PUT /api/notes.php
Content-Type: application/json

Body:
{
  "path": "notes/example.md",
  "content": "# Updated content"
}

Response:
{
  "success": true,
  "path": "notes/example.md"
}
```

#### Delete Note
```
DELETE /api/notes.php
Content-Type: application/json

Body:
{
  "path": "notes/example.md"
}

Response:
{
  "success": true,
  "path": "notes/example.md"
}
```

### Build Highlight.js Bundle

```bash
npm install
node build-hljs.js
```

### Project Structure

```
private-notes/
├── index.html              # Main HTML
├── shader.js               # WebGL shader
├── renderer.js             # Markdown renderer
├── style.css               # Styles & theme
├── build-hljs.js           # Build script
├── lib/
│   ├── marked.min.js       # Markdown parser
│   └── highlight.bundle.js # Syntax highlighter
└── notes/                  # Your markdown files
```

## 🎨 Customization

### Change Star Colors
Edit `shader.js` (lines 85-96):
```javascript
color += vec3(0.4, 0.5, 0.8) * stars(layer1Uv, 3.0); // Blue stars
color += vec3(0.6, 0.7, 1.0) * stars(layer2Uv, 2.0); // White stars
color += vec3(0.8, 0.9, 1.0) * stars(layer3Uv, 1.0); // Bright stars
```

### Modify Syntax Theme
Edit `style.css` (lines 280-399) - adjust color values for different elements.

### Add More Languages
Update `build-hljs.js` with new language names and rebuild.

## 🌐 Browser Support

- Chrome/Edge 60+
- Firefox 55+
- Safari 12+
- Opera 47+

**Requirements:** WebGL 1.0, ES6+, Modern CSS

## 📦 Deployment

Deploy to any static hosting:

**GitHub Pages:**
```bash
# Push to gh-pages branch
git push origin main:gh-pages
```

**Netlify/Vercel:**
- Just connect your repository
- No build configuration needed

## 🔒 Security

### Security Features

- ✅ **File Type Validation**: Dangerous file types (executables, server scripts) are blocked
- ✅ **File Size Limits**: Maximum 4GB per file (FAT32 limit)
- ✅ **Path Traversal Prevention**: Filenames are sanitized to prevent directory traversal attacks
- ✅ **Unique Filenames**: Uploaded files are timestamped to prevent overwriting
- ✅ **Input Sanitization**: All user input is validated and sanitized
- ✅ **CodeQL Security Scan**: Passed security analysis
- ✅ **No Vulnerabilities**: Safe third-party libraries (marked.js, highlight.js)

### PHP Backend Security

The PHP backend implements multiple security measures:

- File type blocklist (prevents dangerous executables and server scripts)
- File size validation (max 4GB - FAT32 limit)
- Filename sanitization (prevents directory traversal)
- Path validation (ensures files stay within allowed directories)
- Unique filename generation (prevents overwriting existing files)
- Thread-safe index updates with file locking (prevents race conditions)
- Atomic file operations (prevents data corruption)

**Production CORS Configuration:**

For production deployments, restrict CORS access by setting the `ALLOWED_ORIGINS` environment variable:

```bash
# Docker
docker run -e ALLOWED_ORIGINS="https://yourdomain.com" ...

# Docker Compose
environment:
  - ALLOWED_ORIGINS=https://yourdomain.com
```

By default, CORS is set to `*` (allow all origins) for development convenience.

## 📄 License

ISC

## 🙏 Credits

- **marked.js** - Markdown parser
- **highlight.js** - Syntax highlighting
- **WebGL** - GPU-accelerated rendering

---

*Created with ❤️ by Peter @tekk OM7TEK*
