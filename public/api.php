<?php
require_once __DIR__ . '/../server/src/Controllers/TaskController.php';

$controller = new TaskController();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $controller->fetchAll();
    exit;
}
if ($method === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true);
    $controller->create($payload);
    exit;
}
echo json_encode(['success' => false, 'message' => 'Unsupported method']);
