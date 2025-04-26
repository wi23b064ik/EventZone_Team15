<?php
session_start();
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    require_once '../config/dbaccess.php';
    require_once '../models/cart.class.php';

    // Debug database connection
    if (!$conn || $conn->connect_error) {
        throw new Exception("Database connection failed: " . ($conn ? $conn->connect_error : "No connection"));
    }

    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    $action = $input['action'] ?? '';

    if (!isset($_SESSION['user'])) {
        throw new Exception("User not authenticated");
    }

    $userId = $_SESSION['user']['id'];
    $cart = new Cart($conn);

    switch ($action) {
        case 'getCartItems':
            $result = $cart->getCartItems($userId);
            echo json_encode($result);
            break;

        case 'updateQuantity':
            if (!isset($input['eventId']) || !isset($input['quantity'])) {
                throw new Exception("Event ID and quantity are required");
            }
            $result = $cart->updateQuantity($userId, $input['eventId'], $input['quantity']);
            echo json_encode($result);
            break;

        case 'addToCart':
            if (!isset($input['eventId']) || !isset($input['quantity'])) {
                throw new Exception("Event ID and quantity are required");
            }
            $result = $cart->addToCart($userId, $input['eventId'], $input['quantity']);
            echo json_encode($result);
            break;

        case 'removeFromCart':
            if (!isset($input['eventId'])) {
                throw new Exception("Event ID is required");
            }
            $result = $cart->removeFromCart($userId, $input['eventId']);
            echo json_encode($result);
            break;

        case 'getCartCount':
            $count = $cart->getCartCount($userId);
            echo json_encode([
                'status' => 'success',
                'count' => $count
            ]);
            break;

        default:
            throw new Exception("Invalid action: " . $action);
    }

} catch (Exception $e) {
    error_log("Cart error: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'debug' => [
            'error_code' => $e->getCode(),
            'error_file' => basename($e->getFile()),
            'error_line' => $e->getLine(),
            'sql_error' => $conn->error ?? 'no SQL error',
            'session_info' => [
                'user_id' => $_SESSION['user']['id'] ?? 'not set',
                'authenticated' => isset($_SESSION['user'])
            ]
        ]
    ]);
}
?>