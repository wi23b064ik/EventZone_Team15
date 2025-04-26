<?php
class User {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function register($data) {
        $stmt = $this->conn->prepare("
            INSERT INTO users (salutation, firstname, surname, address, plz, postalCode, email, username, passwordh, paymentInfo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->bind_param("ssssssssss",
            $data['salutation'],
            $data['firstName'],
            $data['surname'],
            $data['address'],
            $data['plz'],
            $data['postalCode'],
            $data['email'],
            $data['username'],
            $data['passwordh'],
            $data['paymentInfo']
        );
        $success = $stmt->execute();

        if (!$success) {
            error_log("MYSQL ERROR: " . $stmt->error);
        }
    
        return $success;
    }

    public function login($username, $password) {
        try {
            // Log login attempt
            error_log("Attempting login for user: $username");
            
            $stmt = $this->conn->prepare("
                SELECT id, username, email, passwordh, status, role
                FROM users 
                WHERE (username = ? OR email = ?) AND status = 'active'
            ");
            
            if (!$stmt) {
                error_log("Prepare failed: " . $this->conn->error);
                return false;
            }
            
            $stmt->bind_param("ss", $username, $username);
            
            if (!$stmt->execute()) {
                error_log("Execute failed: " . $stmt->error);
                return false;
            }
            
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                error_log("No user found with username/email: $username");
                return false;
            }
            
            $user = $result->fetch_assoc();
            
            if (!$user) {
                error_log("Failed to fetch user data");
                return false;
            }
            
            if (password_verify($password, $user['passwordh'])) {
                error_log("Password verified successfully for user: $username");
                unset($user['passwordh']);
                return $user;
            }
            
            error_log("Invalid password for user: $username");
            return false;
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            return false;
        }
    }
    public function getAllUsers() {
        $stmt = $this->conn->prepare("SELECT id, username, email, role, firstName, surname FROM users");
        $stmt->execute();
        $result = $stmt->get_result();
    
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        return $users;
    }
    
    public function deleteUser($id) {
        $stmt = $this->conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            return [
                "status" => "success",
                "message" => "User deleted"
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to delete user"
            ];
        }
    }
    
}
?>
