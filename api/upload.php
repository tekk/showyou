<?php
require_once 'config.php';

// Handle file upload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if file was uploaded
    if (!isset($_FILES['file'])) {
        sendError('No file uploaded', 400);
    }
    
    $file = $_FILES['file'];
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        sendError('File upload failed: ' . $file['error'], 400);
    }
    
    // Validate file size
    if ($file['size'] > MAX_FILE_SIZE) {
        sendError('File too large. Maximum size is 5MB', 400);
    }
    
    // Validate filename
    $originalName = $file['name'];
    $safeName = validateFilename($originalName);
    
    if (!$safeName) {
        sendError('Invalid filename', 400);
    }
    
    // Validate file extension
    $extension = getFileExtension($safeName);
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        sendError('File type not allowed. Allowed types: ' . implode(', ', ALLOWED_EXTENSIONS), 400);
    }
    
    // Generate unique filename to prevent overwriting
    $uniqueName = date('Y-m-d_His') . '_' . $safeName;
    $uploadPath = UPLOADS_DIR . '/' . $uniqueName;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        sendError('Failed to save uploaded file', 500);
    }
    
    // If it's a markdown file, update the notes index
    if ($extension === 'md') {
        // Read current index
        $index = ['notes' => []];
        if (file_exists(INDEX_FILE)) {
            $indexContent = file_get_contents(INDEX_FILE);
            $index = json_decode($indexContent, true) ?: ['notes' => []];
        }
        
        // Add new note to index
        $noteName = pathinfo($safeName, PATHINFO_FILENAME);
        $index['notes'][] = [
            'name' => $noteName,
            'path' => 'uploads/' . $uniqueName
        ];
        
        // Save updated index
        file_put_contents(INDEX_FILE, json_encode($index, JSON_PRETTY_PRINT));
    }
    
    // Return success response
    sendResponse([
        'success' => true,
        'filename' => $uniqueName,
        'originalName' => $originalName,
        'path' => 'uploads/' . $uniqueName,
        'size' => $file['size'],
        'type' => $extension
    ], 201);
}

sendError('Method not allowed', 405);
