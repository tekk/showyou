# Example Note

This is a sample note to demonstrate the **beautiful dark mode GFM renderer** with parallax stars background!

## Features Demonstrated

### Markdown Formatting

- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- `Inline code`
- [Links](https://github.com)

### Code Blocks

```javascript
// JavaScript example with syntax highlighting
function createStarsShader(canvas) {
    const gl = canvas.getContext('webgl');
    
    // Parallax effect
    const layers = [
        { speed: 0.02, color: [0.4, 0.5, 0.8] },
        { speed: 0.05, color: [0.6, 0.7, 1.0] },
        { speed: 0.08, color: [0.8, 0.9, 1.0] }
    ];
    
    return layers;
}
```

```python
# Python example
def fibonacci(n):
    """Generate Fibonacci sequence up to n terms."""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Print first 10 Fibonacci numbers
for num in fibonacci(10):
    print(num)
```

### Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Dark Mode | ✅ Complete | High |
| GFM Support | ✅ Complete | High |
| Parallax Stars | ✅ Complete | Medium |
| Syntax Highlighting | ✅ Complete | Medium |

### Blockquotes

> "The best way to predict the future is to invent it."
> 
> — Alan Kay

### Task Lists

- [x] Create HTML structure
- [x] Implement WebGL shader
- [x] Add markdown rendering
- [x] Style with dark mode
- [ ] Add more sample notes
- [ ] Deploy to GitHub Pages

## Mathematical Content

You can include formulas and technical content:

- **Time Complexity**: O(n log n)
- **Space Complexity**: O(1)

## Horizontal Rule

---

## Images

Images are supported and will be displayed with proper styling:

![Placeholder](https://via.placeholder.com/600x300/161b22/58a6ff?text=Dark+Mode+Image)

## Conclusion

This renderer provides a beautiful, functional way to view and organize your private notes with:

1. **Stunning visuals** - WebGL-powered parallax stars
2. **Perfect readability** - Optimized dark mode colors
3. **Full GFM support** - All GitHub Flavored Markdown features
4. **Code highlighting** - Multiple language support

---

*Created with ❤️ for beautiful note-taking*
