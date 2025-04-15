<?php
session_start();
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once '../config/dbaccess.php';
    require_once '../models/event.class.php';

    $input = json_decode(file_get_contents("php://input"), true);
    $action = $_GET['action'] ?? '';
    $event = new Event($conn);

    // Check authentication for protected routes
    function checkAuth() {
        return isset($_SESSION['user']);
    }

    if (!checkAuth()) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Authentication required'
        ]);
        exit;
    }

    switch ($action) {
        case 'getEvents':
            $category = $_GET['category'] ?? null;
            $result = $event->getEvents($category);
            echo json_encode($result);
            break;

        case 'createEvent':
            // Validate event data
            $errors = $event->validateEventData($input);
            
            if (!empty($errors)) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Validation failed",
                    "errors" => $errors
                ]);
                break;
            }

            $result = $event->createEvent($input);
            echo json_encode($result);
            break;

        case 'updateEvent':
            if (empty($input['id'])) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Event ID is required"
                ]);
                break;
            }
            
            $result = $event->updateEvent($input['id'], $input);
            echo json_encode($result);
            break;

        case 'deleteEvent':
            if (empty($input['id'])) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Event ID is required"
                ]);
                break;
            }
            
            $result = $event->deleteEvent($input['id']);
            echo json_encode($result);
            break;

        default:
            echo json_encode([
                "status" => "error",
                "message" => "Invalid action"
            ]);
            break;
    }

} catch (Exception $e) {
    error_log("System error: " . $e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => "System error occurred"
    ]);
}
?>