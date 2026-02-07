<?php
require_once 'config.php';

// Require authentication
requireAuth();

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
        sendError('File too large. Maximum size is 4GB', 400);
    }
    
    // Validate filename
    $originalName = $file['name'];
    $safeName = validateFilename($originalName);
    
    if (!$safeName) {
        sendError('Invalid filename', 400);
    }
    
    // Validate file extension - block dangerous file types
    $extension = getFileExtension($safeName);
    if (in_array($extension, BLOCKED_EXTENSIONS)) {
        sendError('File type not allowed for security reasons. Blocked types: ' . implode(', ', BLOCKED_EXTENSIONS), 400);
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
        // Update index using thread-safe function
        $noteName = pathinfo($safeName, PATHINFO_FILENAME);
        $success = updateIndexFile(function($index) use ($noteName, $uniqueName) {
            $index['notes'][] = [
                'name' => $noteName,
                'path' => 'uploads/' . $uniqueName
            ];
            return $index;
        });
        
        if (!$success) {
            // File was uploaded but index update failed
            // Could log this error but still return success for the upload
        }
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
