<?php
session_start();
require_once 'config.php';

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Parse AUTH_USERS environment variable
// Format: username:password,username2:password2
function getAuthUsers() {
    $authUsersEnv = getenv('AUTH_USERS');
    if (!$authUsersEnv) {
        // Default credentials if not set (CHANGE IN PRODUCTION!)
        $authUsersEnv = 'admin:changeme123';
    }
    
    $users = [];
    $pairs = explode(',', $authUsersEnv);
    foreach ($pairs as $pair) {
        $parts = explode(':', trim($pair), 2);
        if (count($parts) === 2) {
            $users[trim($parts[0])] = trim($parts[1]);
        }
    }
    return $users;
}

// POST - Login
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        sendError('Username and password are required', 400);
    }
    
    $username = $input['username'];
    $password = $input['password'];
    
    $users = getAuthUsers();
    
    if (isset($users[$username]) && $users[$username] === $password) {
        // Login successful
        $_SESSION['authenticated'] = true;
        $_SESSION['username'] = $username;
        $_SESSION['login_time'] = time();
        
        sendResponse([
            'success' => true,
            'username' => $username
        ]);
    } else {
        // Login failed
        sendError('Invalid username or password', 401);
    }
}

// GET - Check authentication status
if ($method === 'GET') {
    if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
        sendResponse([
            'authenticated' => true,
            'username' => $_SESSION['username'] ?? 'unknown'
        ]);
    } else {
        sendResponse([
            'authenticated' => false
        ]);
    }
}

// DELETE - Logout
if ($method === 'DELETE') {
    session_destroy();
    sendResponse([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
}

sendError('Method not allowed', 405);
