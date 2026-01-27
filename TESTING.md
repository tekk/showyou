# Testing Guide for Private Notes PHP Backend

This guide provides steps to test and verify the PHP backend implementation.

## Prerequisites

- PHP 8.0+ installed
- Docker (optional, for Docker testing)
- curl or similar HTTP client

## Test 1: Static Mode (GitHub Pages Compatibility)

**Objective**: Verify the application still works in static mode without PHP backend.

### Steps:
1. Start a simple HTTP server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open http://localhost:8000 in a browser

3. **Expected Results**:
   - Application loads successfully
   - WebGL stars background is visible
   - Notes from `notes-index.json` are listed in sidebar
   - Upload button is NOT visible (static mode)
   - Clicking on notes loads and renders markdown content
   - Console shows "Static mode (GitHub Pages compatible)"

## Test 2: PHP Backend Mode

**Objective**: Verify PHP backend API endpoints and file upload functionality.

### Setup:
1. Start PHP development server:
   ```bash
   php -S localhost:8080
   ```

2. Open http://localhost:8080 in a browser

3. **Expected Results**:
   - Application loads successfully
   - Upload button IS visible in sidebar (backend mode detected)
   - Console shows "Backend mode enabled"

### Test 2a: List Notes API

```bash
curl http://localhost:8080/api/notes.php
```

**Expected Response**:
```json
{
  "notes": [
    {"name": "🎨 Syntax Highlighting Showcase", "path": "notes/syntax-showcase.md"},
    {"name": "📘 Quick Start Guide", "path": "notes/quickstart.md"},
    ...
  ]
}
```

### Test 2b: File Upload

```bash
# Create a test markdown file
cat > /tmp/test-upload.md << 'EOF'
# Test Note

This is a test note uploaded via API.

## Features
- File upload works
- Index updated automatically

```javascript
console.log('Success!');
```
EOF

# Upload the file
curl -X POST -F "file=@/tmp/test-upload.md" http://localhost:8080/api/upload.php
```

**Expected Response**:
```json
{
  "success": true,
  "filename": "2026-01-27_HHMMSS_test-upload.md",
  "originalName": "test-upload.md",
  "path": "uploads/2026-01-27_HHMMSS_test-upload.md",
  "size": 123,
  "type": "md"
}
```

**Verification**:
- File exists in `uploads/` directory
- `notes-index.json` contains the new entry
- Refreshing the browser shows the new note in the sidebar

### Test 2c: Create Note via API

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"API Test","content":"# API Test\n\nCreated via API"}' \
  http://localhost:8080/api/notes.php
```

**Expected Response**:
```json
{
  "success": true,
  "name": "API Test",
  "path": "notes/2026-01-27_HHMMSS_API-Test.md"
}
```

### Test 2d: Update Note via API

```bash
# Use the path from the create response
curl -X PUT -H "Content-Type: application/json" \
  -d '{"path":"notes/2026-01-27_HHMMSS_API-Test.md","content":"# Updated\n\nContent modified"}' \
  http://localhost:8080/api/notes.php
```

**Expected Response**:
```json
{
  "success": true,
  "path": "notes/2026-01-27_HHMMSS_API-Test.md"
}
```

### Test 2e: Delete Note via API

```bash
curl -X DELETE -H "Content-Type: application/json" \
  -d '{"path":"notes/2026-01-27_HHMMSS_API-Test.md"}' \
  http://localhost:8080/api/notes.php
```

**Expected Response**:
```json
{
  "success": true,
  "path": "notes/2026-01-27_HHMMSS_API-Test.md"
}
```

**Verification**:
- File no longer exists in `notes/` directory
- Entry removed from `notes-index.json`

## Test 3: Security Validation

### Test 3a: Invalid File Type

```bash
echo "test" > /tmp/test.exe
curl -X POST -F "file=@/tmp/test.exe" http://localhost:8080/api/upload.php
```

**Expected Response**:
```json
{
  "error": "File type not allowed. Allowed types: jpg, jpeg, png, gif, pdf, txt, md"
}
```

### Test 3b: File Size Limit

```bash
# Create a file larger than 5MB
dd if=/dev/zero of=/tmp/large.md bs=1M count=6
curl -X POST -F "file=@/tmp/large.md" http://localhost:8080/api/upload.php
```

**Expected Response**:
```json
{
  "error": "File too large. Maximum size is 5MB"
}
```

### Test 3c: Path Traversal Prevention

```bash
curl -X DELETE -H "Content-Type: application/json" \
  -d '{"path":"../../../etc/passwd"}' \
  http://localhost:8080/api/notes.php
```

**Expected Response**:
```json
{
  "error": "Invalid note path"
}
```

## Test 4: Docker Deployment

**Objective**: Verify Docker containerization works correctly.

### Setup:
1. Build Docker image:
   ```bash
   docker build -t private-notes .
   ```

2. Run container:
   ```bash
   docker run -p 8080:80 private-notes
   ```
   
   Or using Docker Compose:
   ```bash
   docker-compose up
   ```

3. Open http://localhost:8080 in a browser

**Expected Results**:
- Application loads in backend mode
- Upload button is visible
- All API endpoints work as in Test 2
- Uploaded files persist in the container

## Test 5: UI File Upload

**Objective**: Test file upload through the web interface.

### Steps:
1. Start PHP server (or Docker container)
2. Open http://localhost:8080 in browser
3. Click "📤 Upload" button
4. **Verify**: Upload modal appears
5. Click "Choose File" and select a markdown file
6. Click "Upload" button
7. **Verify**: 
   - "File uploaded successfully" message appears
   - Modal closes
   - New file appears in sidebar
   - Clicking the file loads and renders its content

## Test 6: Concurrent Access (Race Condition Prevention)

**Objective**: Verify thread-safe file locking prevents index corruption.

### Steps:
```bash
# Upload multiple files simultaneously
for i in {1..5}; do
  echo "# Test $i" > /tmp/test$i.md
  curl -X POST -F "file=@/tmp/test$i.md" http://localhost:8080/api/upload.php &
done
wait

# Verify index file is valid JSON
cat notes-index.json | python3 -m json.tool
```

**Expected Results**:
- All 5 files upload successfully
- `notes-index.json` is valid JSON (not corrupted)
- All 5 files are listed in the index
- No duplicate entries

## Cleanup

After testing, clean up test files:

```bash
# Remove test uploads
rm -f uploads/2026-01-27_*_test*.md

# Reset notes-index.json to original state
git checkout notes-index.json
```

## Success Criteria

All tests should pass with:
- ✅ Static mode works without PHP backend
- ✅ PHP backend mode detected automatically
- ✅ All CRUD operations work correctly
- ✅ Security validations prevent invalid operations
- ✅ Docker deployment works
- ✅ UI file upload functional
- ✅ Thread-safe operations prevent race conditions
- ✅ No CodeQL security alerts
