<?php
// API Configuration
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Define paths
define('BASE_DIR', dirname(__DIR__));
define('NOTES_DIR', BASE_DIR . '/notes');
define('UPLOADS_DIR', BASE_DIR . '/uploads');
define('INDEX_FILE', BASE_DIR . '/notes-index.json');

// Allowed file types for uploads
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'md']);
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB

// Create directories if they don't exist
if (!is_dir(NOTES_DIR)) {
    mkdir(NOTES_DIR, 0755, true);
}
if (!is_dir(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0755, true);
}

// Helper function to send JSON response
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Helper function to send error response
function sendError($message, $statusCode = 400) {
    sendResponse(['error' => $message], $statusCode);
}

// Validate filename to prevent directory traversal
function validateFilename($filename) {
    // Remove any path components
    $filename = basename($filename);
    
    // Check for invalid characters
    if (preg_match('/[^a-zA-Z0-9._-]/', $filename)) {
        return false;
    }
    
    return $filename;
}

// Get file extension
function getFileExtension($filename) {
    return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
}
