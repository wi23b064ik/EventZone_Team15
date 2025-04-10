<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'eventzone';

try {
    $conn = new mysqli($host, $user, $pass, $dbname);
    
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