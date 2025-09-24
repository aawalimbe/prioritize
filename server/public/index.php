<?php
// Front controller / API router for Task Manager
// See README for endpoint details

header('Content-Type: application/json');
require_once __DIR__ . '/../src/Controllers/TaskController.php';

$controller = new TaskController();

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
