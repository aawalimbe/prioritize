<?php
require_once __DIR__ . '/../Config/database.php';

class TaskController {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = getPDO();
    }

    // Fetch all tasks
    public function fetchAll() {
        $stmt = $this->pdo->query('SELECT * FROM tasks ORDER BY id DESC');
        $tasks = $stmt->fetchAll();
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'data' => $tasks]);
    }

    // Create a new task
    public function create($payload) {
        $sql = 'INSERT INTO tasks (title, description, priority, due_date, due_time, tags, recurring, completed) VALUES (:title, :description, :priority, :due_date, :due_time, :tags, :recurring, :completed)';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':title' => $payload['title'] ?? '',
            ':description' => $payload['description'] ?? null,
            ':priority' => $payload['priority'] ?? 'Low',
            ':due_date' => $payload['due_date'] ?? null,
            ':due_time' => $payload['due_time'] ?? null,
            ':tags' => $payload['tags'] ?? null,
            ':recurring' => $payload['recurring'] ?? null,
            ':completed' => $payload['completed'] ?? 'Pending'
        ]);
        $id = $this->pdo->lastInsertId();
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'data' => ['id' => (int)$id]]);
    }
}
