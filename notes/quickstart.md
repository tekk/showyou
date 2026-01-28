# Quick Start Guide

Welcome to your **Private Notes** dark mode renderer! 🌙

## What is this?

This is a beautiful, static markdown viewer with:

- ✨ **WebGL Shader Background** - Parallax stars that respond to mouse movement
- 🎨 **Dark Mode** - Easy on the eyes for long reading sessions
- 📝 **GFM Support** - Full GitHub Flavored Markdown rendering
- 🚀 **Fast & Lightweight** - No backend required, runs entirely in the browser

## How to Use

### Adding Notes

1. Create `.md` files in the `notes/` directory
2. Update `notes-index.json` to include your new files
3. Reload the page to see your notes in the sidebar

### Writing Markdown

Use standard GFM syntax:

```markdown
# Headings
## Subheadings

**Bold** and *italic* text

- Lists
- Are
- Easy

`code inline` and blocks:

\```javascript
console.log('Hello, World!');
\```

[Links](https://example.com)
```

### Navigation

- Click on notes in the sidebar to view them
- Use the copy button on code blocks
- Enjoy the parallax stars background by moving your mouse!

## Technical Details

### Technologies Used

- **WebGL** for high-performance shader rendering
- **Marked.js** for markdown parsing
- **Highlight.js** for syntax highlighting
- **Pure CSS** for beautiful styling

### Browser Support

Modern browsers with WebGL support:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Tips & Tricks

💡 **Move your mouse** across the page to see the parallax effect on the stars!

💡 **Code blocks** have a copy button in the top-right corner for easy copying.

💡 **Responsive design** works great on mobile and tablet devices.

## Customization

You can customize the appearance by editing:

- `style.css` - Colors, spacing, and layout
- `shader.js` - Stars density, colors, and parallax intensity
- `renderer.js` - Markdown rendering options

Happy note-taking! 📝✨
