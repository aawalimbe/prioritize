<?php
require_once __DIR__ . '/../server/src/Controllers/AuthController.php';

$controller = new AuthController();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true);
    if (isset($payload['action'])) {
        if ($payload['action'] === 'register') {
            echo json_encode($controller->register($payload['username'], $payload['password']));
            exit;
        }
        if ($payload['action'] === 'login') {
            echo json_encode($controller->login($payload['username'], $payload['password']));
            exit;
        }
        if ($payload['action'] === 'logout') {
            echo json_encode($controller->logout());
            exit;
        }
        if ($payload['action'] === 'me') {
            $info = $controller->getCurrentUserInfo();
            if ($info) {
                echo json_encode(['success' => true, 'user' => $info]);
            } else {
                echo json_encode(['success' => false]);
            }
            exit;
        }
    }
}
echo json_encode(['success' => false, 'message' => 'Unsupported method or missing action']);
