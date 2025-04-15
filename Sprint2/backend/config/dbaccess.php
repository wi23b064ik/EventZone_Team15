<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'eventzone';

try {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $conn = new mysqli($host, $user, $pass, $dbname);
    $conn->set_charset("utf8mb4");
    
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        throw new Exception("Database connection failed");
    }
    
    error_log("Database connection established successfully");
} catch (Exception $e) {
    error_log("Database error: " . $e->getMessage());
    throw $e;
}
?>