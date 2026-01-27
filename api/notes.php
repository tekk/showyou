<?php
require_once 'config.php';

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// GET - List all notes
if ($method === 'GET') {
    if (file_exists(INDEX_FILE)) {
        $indexContent = file_get_contents(INDEX_FILE);
        $index = json_decode($indexContent, true);
        sendResponse($index);
    } else {
        sendResponse(['notes' => []]);
    }
}

// POST - Create a new note
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['name']) || !isset($input['content'])) {
        sendError('Name and content are required', 400);
    }
    
    $name = trim($input['name']);
    $content = $input['content'];
    
    // Validate name
    $safeName = validateFilename($name);
    if (!$safeName) {
        sendError('Invalid note name', 400);
    }
    
    // Ensure .md extension
    if (getFileExtension($safeName) !== 'md') {
        $safeName .= '.md';
    }
    
    // Create unique filename
    $filename = date('Y-m-d_His') . '_' . $safeName;
    $filePath = NOTES_DIR . '/' . $filename;
    
    // Save note content
    if (file_put_contents($filePath, $content) === false) {
        sendError('Failed to create note', 500);
    }
    
    // Update index
    $index = ['notes' => []];
    if (file_exists(INDEX_FILE)) {
        $indexContent = file_get_contents(INDEX_FILE);
        $index = json_decode($indexContent, true) ?: ['notes' => []];
    }
    
    $index['notes'][] = [
        'name' => $name,
        'path' => 'notes/' . $filename
    ];
    
    file_put_contents(INDEX_FILE, json_encode($index, JSON_PRETTY_PRINT));
    
    sendResponse([
        'success' => true,
        'name' => $name,
        'path' => 'notes/' . $filename
    ], 201);
}

// PUT - Update an existing note
if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['path']) || !isset($input['content'])) {
        sendError('Path and content are required', 400);
    }
    
    $path = $input['path'];
    $content = $input['content'];
    
    // Validate path
    $fullPath = BASE_DIR . '/' . $path;
    
    // Ensure path is within allowed directories
    $realPath = realpath(dirname($fullPath));
    $allowedPaths = [realpath(NOTES_DIR), realpath(UPLOADS_DIR)];
    
    $isAllowed = false;
    foreach ($allowedPaths as $allowedPath) {
        if (strpos($realPath, $allowedPath) === 0) {
            $isAllowed = true;
            break;
        }
    }
    
    if (!$isAllowed || !file_exists($fullPath)) {
        sendError('Invalid note path', 400);
    }
    
    // Update note content
    if (file_put_contents($fullPath, $content) === false) {
        sendError('Failed to update note', 500);
    }
    
    sendResponse([
        'success' => true,
        'path' => $path
    ]);
}

// DELETE - Delete a note
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['path'])) {
        sendError('Path is required', 400);
    }
    
    $path = $input['path'];
    $fullPath = BASE_DIR . '/' . $path;
    
    // Validate path
    $realPath = realpath(dirname($fullPath));
    $allowedPaths = [realpath(NOTES_DIR), realpath(UPLOADS_DIR)];
    
    $isAllowed = false;
    foreach ($allowedPaths as $allowedPath) {
        if (strpos($realPath, $allowedPath) === 0) {
            $isAllowed = true;
            break;
        }
    }
    
    if (!$isAllowed || !file_exists($fullPath)) {
        sendError('Invalid note path', 400);
    }
    
    // Delete file
    if (!unlink($fullPath)) {
        sendError('Failed to delete note', 500);
    }
    
    // Update index
    if (file_exists(INDEX_FILE)) {
        $indexContent = file_get_contents(INDEX_FILE);
        $index = json_decode($indexContent, true) ?: ['notes' => []];
        
        // Remove note from index
        $index['notes'] = array_filter($index['notes'], function($note) use ($path) {
            return $note['path'] !== $path;
        });
        
        // Re-index array
        $index['notes'] = array_values($index['notes']);
        
        file_put_contents(INDEX_FILE, json_encode($index, JSON_PRETTY_PRINT));
    }
    
    sendResponse([
        'success' => true,
        'path' => $path
    ]);
}

sendError('Method not allowed', 405);
