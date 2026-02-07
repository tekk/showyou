<?php
require_once 'config.php';

// Share endpoint does NOT require authentication
// This allows public access to shared notes

$method = $_SERVER['REQUEST_METHOD'];

// GET - View shared note
if ($method === 'GET') {
    $token = $_GET['token'] ?? '';
    
    if (!$token) {
        sendError('Share token required', 400);
    }
    
    // Load index to find note by share token
    if (!file_exists(INDEX_FILE)) {
        sendError('Note not found', 404);
    }
    
    $indexContent = file_get_contents(INDEX_FILE);
    $index = json_decode($indexContent, true);
    
    $sharedNote = null;
    foreach ($index['notes'] as $note) {
        if (isset($note['shareToken']) && $note['shareToken'] === $token) {
            $sharedNote = $note;
            break;
        }
    }
    
    if (!$sharedNote) {
        sendError('Note not found or share link expired', 404);
    }
    
    // Check password if required
    if (isset($sharedNote['passwordHash'])) {
        $password = $_GET['password'] ?? '';
        if (!$password || !password_verify($password, $sharedNote['passwordHash'])) {
            sendError('Invalid password', 401);
        }
    }
    
    // Load note content
    $fullPath = BASE_DIR . '/' . $sharedNote['path'];
    if (!file_exists($fullPath)) {
        sendError('Note file not found', 404);
    }
    
    $content = file_get_contents($fullPath);
    
    // Check if burn after reading is enabled
    $burnAfterReading = isset($sharedNote['burnAfterReading']) && $sharedNote['burnAfterReading'] === true;
    
    // Prepare response
    $response = [
        'success' => true,
        'name' => $sharedNote['name'],
        'content' => $content,
        'burnAfterReading' => $burnAfterReading
    ];
    
    // If burn after reading, delete the note atomically
    if ($burnAfterReading) {
        // Delete file
        @unlink($fullPath);
        
        // Update index to remove note
        updateIndexFile(function($idx) use ($sharedNote) {
            $idx['notes'] = array_filter($idx['notes'], function($n) use ($sharedNote) {
                return $n['path'] !== $sharedNote['path'];
            });
            $idx['notes'] = array_values($idx['notes']);
            return $idx;
        });
    }
    
    sendResponse($response);
}

// POST - Create/update share token
if ($method === 'POST') {
    // This endpoint requires authentication
    requireAuth();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['path'])) {
        sendError('Path is required', 400);
    }
    
    $path = $input['path'];
    $burnAfterReading = isset($input['burnAfterReading']) ? (bool)$input['burnAfterReading'] : false;
    
    // Generate share token
    $shareToken = bin2hex(random_bytes(16));
    
    // Update index with share token
    $success = updateIndexFile(function($index) use ($path, $shareToken, $burnAfterReading) {
        foreach ($index['notes'] as &$note) {
            if ($note['path'] === $path) {
                $note['shareToken'] = $shareToken;
                if ($burnAfterReading) {
                    $note['burnAfterReading'] = true;
                } else {
                    unset($note['burnAfterReading']);
                }
                break;
            }
        }
        return $index;
    });
    
    if (!$success) {
        sendError('Failed to create share link', 500);
    }
    
    // Generate full share URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $shareUrl = $protocol . '://' . $host . '/share.html?token=' . $shareToken;
    
    sendResponse([
        'success' => true,
        'shareToken' => $shareToken,
        'shareUrl' => $shareUrl,
        'burnAfterReading' => $burnAfterReading
    ]);
}

sendError('Method not allowed', 405);
