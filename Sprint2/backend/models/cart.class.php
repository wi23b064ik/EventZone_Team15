<?php
class Cart {
    private $conn;

    public function __construct($db) {
        if (!$db || $db->connect_error) {
            throw new Exception("Invalid database connection");
        }
        $this->conn = $db;
        error_log("Cart class initialized");
    }

    public function addToCart($userId, $eventId, $quantity = 1) {
        try {
            $sql = "INSERT INTO cart_items (userId, eventId, quantity) 
                    VALUES (?, ?, ?) 
                    ON DUPLICATE KEY UPDATE quantity = quantity + ?";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("iiii", $userId, $eventId, $quantity, $quantity);
            
            if ($stmt->execute()) {
                return [
                    'status' => 'success',
                    'message' => 'Added to cart',
                    'cartCount' => $this->getCartCount($userId)
                ];
            }
            
            throw new Exception($stmt->error);
        } catch (Exception $e) {
            error_log("Error adding to cart: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Failed to add to cart'
            ];
        }
    }

    public function getCartCount($userId) {
        try {
            $sql = "SELECT SUM(quantity) as count FROM cart_items WHERE userId = ?";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                throw new Exception("Failed to prepare count statement");
            }

            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            
            return intval($row['count'] ?? 0);
            
        } catch (Exception $e) {
            error_log("Error in getCartCount: " . $e->getMessage());
            return 0;
        }
    }

    public function getCartItems($userId) {
        try {
            if (!$userId) {
                throw new Exception("User ID is required");
            }

            $sql = "SELECT ci.cartId, ci.eventId, ci.quantity, 
                           e.name, e.description, DATE_FORMAT(e.date, '%M %d, %Y') as date, 
                           CAST(e.price AS FLOAT) as price, e.image 
                    FROM cart_items ci 
                    JOIN events e ON ci.eventId = e.id 
                    WHERE ci.userId = ?";
            
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Query preparation failed: " . $this->conn->error);
            }

            $stmt->bind_param("i", $userId);
            if (!$stmt->execute()) {
                throw new Exception("Query execution failed: " . $stmt->error);
            }

            $result = $stmt->get_result();
            if (!$result) {
                throw new Exception("Failed to get result set: " . $stmt->error);
            }

            $items = [];
            while ($row = $result->fetch_assoc()) {
                $items[] = [
                    'cartId' => (int)$row['cartId'],
                    'eventId' => (int)$row['eventId'],
                    'name' => $row['name'],
                    'description' => $row['description'],
                    'date' => $row['date'],
                    'price' => (float)$row['price'],
                    'image' => $row['image'],
                    'quantity' => (int)$row['quantity']
                ];
            }

            return [
                'status' => 'success',
                'items' => $items
            ];

        } catch (Exception $e) {
            error_log("Cart error: " . $e->getMessage());
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    public function updateQuantity($userId, $eventId, $quantity) {
        try {
            if ($quantity < 1) {
                throw new Exception("Invalid quantity");
            }

            $sql = "UPDATE cart_items 
                    SET quantity = ? 
                    WHERE userId = ? AND eventId = ?";
                
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Query preparation failed: " . $this->conn->error);
            }

            $stmt->bind_param("iii", $quantity, $userId, $eventId);
            if (!$stmt->execute()) {
                throw new Exception("Failed to update quantity: " . $stmt->error);
            }

            return [
                'status' => 'success',
                'message' => 'Quantity updated'
            ];

        } catch (Exception $e) {
            error_log("Update quantity error: " . $e->getMessage());
            throw new Exception("Failed to update quantity: " . $e->getMessage());
        }
    }

    public function removeFromCart($userId, $eventId) {
        try {
            $sql = "DELETE FROM cart_items 
                    WHERE userId = ? AND eventId = ?";
                
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Query preparation failed: " . $this->conn->error);
            }

            $stmt->bind_param("ii", $userId, $eventId);
            if (!$stmt->execute()) {
                throw new Exception("Failed to remove item: " . $stmt->error);
            }

            return [
                'status' => 'success',
                'message' => 'Item removed from cart'
            ];

        } catch (Exception $e) {
            error_log("Remove from cart error: " . $e->getMessage());
            throw new Exception("Failed to remove item: " . $e->getMessage());
        }
    }
}
?>