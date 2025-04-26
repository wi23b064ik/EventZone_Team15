<?php
session_start();
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once '../config/dbaccess.php';
    require_once '../models/user.class.php';

    $input = json_decode(file_get_contents("php://input"), true);
    error_log("Received input: " . print_r($input, true));
    
    $action = $input['action'] ?? '';

    if ($action === 'register') {
        $user = new User($conn);

        // Comprehensive server-side validation
        $errors = [];

        // Required fields validation
        $requiredFields = ['username', 'email', 'passwordh', 'firstName', 'surname'];
        foreach ($requiredFields as $field) {
            if (empty($input[$field])) {
                $errors[] = ucfirst($field) . " is required";
            }
        }

        // Email validation
        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format";
        }

        // Username validation (alphanumeric and minimum length)
        if (!preg_match('/^[a-zA-Z0-9]{4,}$/', $input['username'])) {
            $errors[] = "Username must be at least 4 characters long and contain only letters and numbers";
        }

        // Password validation (minimum length)
        if (strlen($input['passwordh']) < 6) {
            $errors[] = "Password must be at least 6 characters long";
        }

        if (!empty($errors)) {
            echo json_encode([
                "status" => "error",
                "message" => "Validation failed",
                "errors" => $errors
            ]);
            exit;
        }

        // Hash password
        $hashedPassword = password_hash($input['passwordh'], PASSWORD_DEFAULT);
        $input['passwordh'] = $hashedPassword;

        // Attempt registration
        try {
            error_log("Registration data: " . print_r($input, true));
            $success = $user->register($input);
            
            if ($success) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Registration successful!"
                ]);
            } else {
                error_log("Registration failed. MySQL Error: " . $conn->error);
                echo json_encode([
                    "status" => "error",
                    "message" => "Registration failed. " . $conn->error
                ]);
            }
        } catch (Exception $e) {
            error_log("Registration error: " . $e->getMessage());
            echo json_encode([
                "status" => "error",
                "message" => "An error occurred during registration: " . $e->getMessage()
            ]);
        }
    } elseif ($action === 'login') {
        $user = new User($conn);
        
        try {
            // Log incoming login attempt
            error_log("Login attempt for user: " . ($input['username'] ?? 'no username provided'));
            
            // Input validation
            if (empty($input['username']) || empty($input['passwordh'])) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Please provide both username/email and password"
                ]);
                exit;
            }
            
            $loginResult = $user->login($input['username'], $input['passwordh']);
            error_log("Login result: " . print_r($loginResult, true));
            
            if ($loginResult) {
                // Set session
                $_SESSION['user'] = $loginResult;
                session_write_close();
                
                echo json_encode([
                    "status" => "success",
                    "message" => "Login successful!",
                    "user" => $loginResult
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => "Invalid username/email or password"
                ]);
            }
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            echo json_encode([
                "status" => "error",
                "message" => "An error occurred during login"
            ]);
        }
    } elseif ($action === 'checkLogin') {
        if (isset($_SESSION['user'])) {
            echo json_encode([
                'status' => 'success',
                'isLoggedIn' => true,
                'user' => $_SESSION['user']
            ]);
        } else {
            echo json_encode([
                'status' => 'success',
                'isLoggedIn' => false
            ]);
        }
    } elseif ($action === 'logout') {
        session_destroy();
        echo json_encode([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }
    
    
} catch (Exception $e) {
    error_log("System error: " . $e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => "System error occurred"
    ]);
}

?>

//----------------------------------------
<?php
session_start();
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once '../config/dbaccess.php';
    require_once '../models/user.class.php';

    $input = json_decode(file_get_contents("php://input"), true);
    error_log("Received input: " . print_r($input, true));
    
    $action = $input['action'] ?? '';

    if ($action === 'register') {
        $user = new User($conn);

        // Comprehensive server-side validation
        $errors = [];

        // Required fields validation
        $requiredFields = ['username', 'email', 'passwordh', 'firstName', 'surname'];
        foreach ($requiredFields as $field) {
            if (empty($input[$field])) {
                $errors[] = ucfirst($field) . " is required";
            }
        }

        // Email validation
        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format";
        }

        // Username validation (alphanumeric and minimum length)
        if (!preg_match('/^[a-zA-Z0-9]{4,}$/', $input['username'])) {
            $errors[] = "Username must be at least 4 characters long and contain only letters and numbers";
        }

        // Password validation (minimum length)
        if (strlen($input['passwordh']) < 6) {
            $errors[] = "Password must be at least 6 characters long";
        }

        if (!empty($errors)) {
            echo json_encode([
                "status" => "error",
                "message" => "Validation failed",
                "errors" => $errors
            ]);
            exit;
        }

        // Hash password
        $hashedPassword = password_hash($input['passwordh'], PASSWORD_DEFAULT);
        $input['passwordh'] = $hashedPassword;

        // Attempt registration
        try {
            error_log("Registration data: " . print_r($input, true));
            $success = $user->register($input);
            
            if ($success) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Registration successful!"
                ]);
            } else {
                error_log("Registration failed. MySQL Error: " . $conn->error);
                echo json_encode([
                    "status" => "error",
                    "message" => "Registration failed. " . $conn->error
                ]);
            }
        } catch (Exception $e) {
            error_log("Registration error: " . $e->getMessage());
            echo json_encode([
                "status" => "error",
                "message" => "An error occurred during registration: " . $e->getMessage()
            ]);
        }
    } elseif ($action === 'login') {
        $user = new User($conn);
        
        try {
            // Log incoming login attempt
            error_log("Login attempt for user: " . ($input['username'] ?? 'no username provided'));
            
            // Input validation
            if (empty($input['username']) || empty($input['passwordh'])) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Please provide both username/email and password"
                ]);
                exit;
            }
            
            $loginResult = $user->login($input['username'], $input['passwordh']);
            error_log("Login result: " . print_r($loginResult, true));
            
            if ($loginResult) {
                // Set session
                $_SESSION['user'] = $loginResult;
                session_write_close();
                
                echo json_encode([
                    "status" => "success",
                    "message" => "Login successful!",
                    "user" => $loginResult
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => "Invalid username/email or password"
                ]);
            }
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            echo json_encode([
                "status" => "error",
                "message" => "An error occurred during login"
            ]);
        }
    } elseif ($action === 'checkLogin') {
        if (isset($_SESSION['user'])) {
            echo json_encode([
                'status' => 'success',
                'isLoggedIn' => true,
                'user' => $_SESSION['user']
            ]);
        } else {
            echo json_encode([
                'status' => 'success',
                'isLoggedIn' => false
            ]);
        }
    } elseif ($action === 'logout') {
        session_destroy();
        echo json_encode([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
} elseif ($action === 'getAllUsers') {
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        echo json_encode([
            'status' => 'error',
            'message' => 'Permission denied'
        ]);
        exit;
    }

    $user = new User($conn);
    $allUsers = $user->getAllUsers(); // diese Methode baust du gleich unten in user.class.php

    echo json_encode([
        'status' => 'success',
        'users' => $allUsers
    ]);

} elseif ($action === 'deleteUser') {
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        echo json_encode([
            'status' => 'error',
            'message' => 'Permission denied'
        ]);
        exit;
    }

    if (empty($input['id'])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'User ID is required'
        ]);
        exit;
    }

    $user = new User($conn);
    $result = $user->deleteUser($input['id']); // baust du gleich
    echo json_encode($result);

    }
} catch (Exception $e) {
    error_log("System error: " . $e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => "System error occurred"
    ]);
}



?>