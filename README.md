# 📝 Private Notes

**A beautiful dark mode GitHub Flavored Markdown renderer with WebGL shader-based parallax stars background and vivid VS Code-style syntax highlighting.**

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

### 🎨 Vivid Syntax Highlighting
- **23+ programming languages** supported
- VS Code-style color scheme
- Copy-to-clipboard buttons
- Optimized for dark backgrounds

**Supported Languages:**
JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, HTML/XML, CSS, SCSS, JSON, Bash, Shell, YAML, Dockerfile, SQL, Markdown, Plaintext

## 🚀 Quick Start

### View Locally

1. Clone the repository
2. Serve with any HTTP server:
   ```bash
   python3 -m http.server 8000
   # or
   npx serve
   ```
3. Open http://localhost:8000

### Add Your Notes

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

## 📸 Screenshots

![Homepage](https://github.com/user-attachments/assets/602b08c3-448c-4999-a6bb-76d195c9a14c)
*Beautiful dark mode interface with parallax stars*

![Syntax Highlighting](https://github.com/user-attachments/assets/103e6e38-415b-46d7-a6c3-734496d2fa2c)
*Vivid VS Code-style syntax highlighting*

## 🛠️ Development

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

- ✅ CodeQL security scan passed
- ✅ No vulnerabilities in custom code
- ✅ Safe third-party libraries (marked.js, highlight.js)

## 📄 License

ISC

## 🙏 Credits

- **marked.js** - Markdown parser
- **highlight.js** - Syntax highlighting
- **WebGL** - GPU-accelerated rendering

---

*Created with ❤️ for beautiful note-taking*
