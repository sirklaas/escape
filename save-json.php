<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    // Get the JSON data from the request
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Invalid JSON data received');
    }
    
    // Validate that we have the expected structure
    if (!isset($data['pages']) || !is_array($data['pages'])) {
        throw new Exception('Invalid data structure - missing pages array');
    }
    
    // Define the path to your JSON file
    $jsonFilePath = $_SERVER['DOCUMENT_ROOT'] . '/fun/JSON/escapedata.json';
    
    // Create directory if it doesn't exist
    $jsonDir = dirname($jsonFilePath);
    if (!is_dir($jsonDir)) {
        if (!mkdir($jsonDir, 0755, true)) {
            throw new Exception('Failed to create directory: ' . $jsonDir);
        }
    }
    
    // Create backup of existing file
    if (file_exists($jsonFilePath)) {
        $backupPath = $jsonFilePath . '.backup.' . date('Y-m-d-H-i-s');
        if (!copy($jsonFilePath, $backupPath)) {
            error_log('Warning: Could not create backup of ' . $jsonFilePath);
        }
    }
    
    // Save the JSON data
    $jsonString = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if (file_put_contents($jsonFilePath, $jsonString, LOCK_EX) === false) {
        throw new Exception('Failed to write to file: ' . $jsonFilePath);
    }
    
    // Verify the file was written correctly
    $savedData = json_decode(file_get_contents($jsonFilePath), true);
    if (!$savedData) {
        throw new Exception('File was saved but cannot be read back - possible corruption');
    }
    
    echo json_encode([
        'success' => true, 
        'message' => 'JSON data saved successfully',
        'timestamp' => date('Y-m-d H:i:s'),
        'pages_count' => count($data['pages'])
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
    // Log the error
    error_log('JSON Save Error: ' . $e->getMessage());
}
?>
