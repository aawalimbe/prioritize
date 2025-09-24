
<?php
require_once __DIR__ . '/../Config/database.php';

class AuthController {
    private PDO $pdo;
    public function __construct() {
        $this->pdo = getPDO();
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function getCurrentUserInfo() {
        if (!isset($_SESSION['user_id'])) return null;
        $stmt = $this->pdo->prepare('SELECT id, username FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function register($username, $password) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        try {
            $stmt->execute([$username, $hash]);
            return ['success' => true];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Username already exists'];
        }
    }

    public function login($username, $password) {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            return ['success' => true];
        }
        return ['success' => false, 'message' => 'Invalid credentials'];
    }

    public function logout() {
        session_destroy();
        return ['success' => true];
    }

    public function getCurrentUserId() {
        return $_SESSION['user_id'] ?? null;
    }
}
