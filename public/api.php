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
if ($method === 'PATCH') {
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!isset($payload['id'])) {
        echo json_encode(['success' => false, 'message' => 'Task ID required for update']);
        exit;
    }
    $id = $payload['id'];
    unset($payload['id']);
    $controller->update($id, $payload);
    exit;
}
echo json_encode(['success' => false, 'message' => 'Unsupported method']);
