<?php
// API Configuration
header('Content-Type: application/json');

// CORS Configuration - restrict in production
// Set ALLOWED_ORIGINS environment variable to restrict access
$allowedOrigins = getenv('ALLOWED_ORIGINS') ?: '*';
header('Access-Control-Allow-Origin: ' . $allowedOrigins);
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

// Blocked file types that could harm the server
// Block executable and server-side script files
define('BLOCKED_EXTENSIONS', ['php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'phps', 'pht', 'phar', 'exe', 'com', 'bat', 'cmd', 'sh', 'bash', 'cgi', 'pl', 'py', 'rb', 'asp', 'aspx', 'jsp', 'jspx', 'dll', 'so', 'dylib']);
define('MAX_FILE_SIZE', (4 * 1024 * 1024 * 1024) - 1); // 4GB - 1 byte (FAT32 max file size)

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

// Validate and sanitize filename to prevent directory traversal
function validateFilename($filename) {
    // Remove any path components
    $filename = basename($filename);
    
    // Replace spaces with hyphens
    $filename = str_replace(' ', '-', $filename);
    
    // Remove any characters that aren't alphanumeric, dots, hyphens, or underscores
    $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
    
    // Ensure filename is not empty after sanitization
    if (empty($filename)) {
        return false;
    }
    
    return $filename;
}

// Thread-safe index file update with file locking
function updateIndexFile($callback) {
    $lockFile = INDEX_FILE . '.lock';
    $fp = fopen($lockFile, 'w');
    
    if (!$fp) {
        return false;
    }
    
    // Acquire exclusive lock
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return false;
    }
    
    try {
        // Read current index
        $index = ['notes' => []];
        if (file_exists(INDEX_FILE)) {
            $indexContent = file_get_contents(INDEX_FILE);
            $index = json_decode($indexContent, true) ?: ['notes' => []];
        }
        
        // Apply callback to modify index
        $index = $callback($index);
        
        // Write updated index atomically
        $tmpFile = INDEX_FILE . '.tmp';
        if (file_put_contents($tmpFile, json_encode($index, JSON_PRETTY_PRINT)) === false) {
            flock($fp, LOCK_UN);
            fclose($fp);
            return false;
        }
        
        // Atomic rename
        if (!rename($tmpFile, INDEX_FILE)) {
            @unlink($tmpFile);
            flock($fp, LOCK_UN);
            fclose($fp);
            return false;
        }
        
        flock($fp, LOCK_UN);
        fclose($fp);
        @unlink($lockFile);
        return true;
    } catch (Exception $e) {
        flock($fp, LOCK_UN);
        fclose($fp);
        return false;
    }
}


// Get file extension
function getFileExtension($filename) {
    return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
}
