 
<?php
require_once __DIR__ . '/../Config/database.php';

class TaskController {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = getPDO();
    }

       private function getUserId() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        return $_SESSION['user_id'] ?? null;
    }

    // Update an existing task (status or other fields)
    public function update($id, $payload) {
        $fields = [];
        $params = [':id' => $id];
        if (isset($payload['title'])) {
            $fields[] = 'title = :title';
            $params[':title'] = $payload['title'];
        }
        if (isset($payload['description'])) {
            $fields[] = 'description = :description';
            $params[':description'] = $payload['description'];
        }
        if (isset($payload['priority'])) {
            $fields[] = 'priority = :priority';
            $params[':priority'] = $payload['priority'];
        }
        if (isset($payload['due_date'])) {
            $fields[] = 'due_date = :due_date';
            $params[':due_date'] = $payload['due_date'];
        }
        if (isset($payload['due_time'])) {
            $fields[] = 'due_time = :due_time';
            $params[':due_time'] = $payload['due_time'];
        }
        if (isset($payload['tags'])) {
            $fields[] = 'tags = :tags';
            $params[':tags'] = $payload['tags'];
        }
        if (isset($payload['recurring'])) {
            $fields[] = 'recurring = :recurring';
            $params[':recurring'] = $payload['recurring'];
        }
        if (isset($payload['completed'])) {
            $fields[] = 'completed = :completed';
            $params[':completed'] = $payload['completed'];
        }
        if (empty($fields)) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            return;
        }
        $sql = 'UPDATE tasks SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        header('Content-Type: application/json');
        echo json_encode(['success' => true]);
    }

    // Fetch all tasks
    public function fetchAll() {
        $userId = $this->getUserId();
        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            return;
        }
        $stmt = $this->pdo->prepare("SELECT * FROM tasks WHERE completed != 'Deleted' AND user_id = :user_id ORDER BY id DESC");
        $stmt->execute([':user_id' => $userId]);
        $tasks = $stmt->fetchAll();
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'data' => $tasks]);
    }

    // Create a new task
    public function create($payload) {
        $userId = $this->getUserId();
        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            return;
        }
        $sql = 'INSERT INTO tasks (user_id, title, description, priority, due_date, due_time, tags, recurring, completed) VALUES (:user_id, :title, :description, :priority, :due_date, :due_time, :tags, :recurring, :completed)';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':user_id' => $userId,
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
