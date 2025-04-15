<?php
class Event {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getEvents($category = null) {
        try {
            $sql = "SELECT id, name, description, DATE_FORMAT(date, '%M %d, %Y') as date, 
                    price, image, capacity, category FROM events";
            
            if ($category) {
                $sql .= " WHERE category = ?";
            }
            
            $sql .= " ORDER BY date ASC";
            
            $stmt = $this->conn->prepare($sql);
            
            if ($category) {
                $stmt->bind_param("s", $category);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();

            if (!$result) {
                throw new Exception($this->conn->error);
            }

            $events = [];
            while ($row = $result->fetch_assoc()) {
                $events[] = $row;
            }

            return [
                'status' => 'success',
                'events' => $events
            ];
        } catch (Exception $e) {
            error_log("Error fetching events: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Error fetching events'
            ];
        }
    }

    public function createEvent($data) {
        try {
            $sql = "INSERT INTO events (name, description, date, price, image, capacity) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                throw new Exception($this->conn->error);
            }

            $image = $data['image'] ?? 'default-event.jpg';
            
            $stmt->bind_param("sssdsi", 
                $data['name'],
                $data['description'],
                $data['date'],
                $data['price'],
                $image,
                $data['capacity']
            );

            if (!$stmt->execute()) {
                throw new Exception($stmt->error);
            }

            return [
                'status' => 'success',
                'message' => 'Event created successfully',
                'eventId' => $this->conn->insert_id
            ];
        } catch (Exception $e) {
            error_log("Error creating event: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Error creating event'
            ];
        }
    }

    public function validateEventData($data) {
        $errors = [];
        $requiredFields = ['name', 'description', 'date', 'price', 'capacity'];

        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                $errors[] = ucfirst($field) . " is required";
            }
        }

        if (!empty($data['price']) && !is_numeric($data['price'])) {
            $errors[] = "Price must be a number";
        }

        if (!empty($data['capacity']) && !is_numeric($data['capacity'])) {
            $errors[] = "Capacity must be a number";
        }

        if (!empty($data['date'])) {
            $date = date_parse($data['date']);
            if ($date['error_count'] > 0) {
                $errors[] = "Invalid date format";
            }
        }

        return $errors;
    }

    public function updateEvent($id, $data) {
        // TODO: Implement update functionality
        return [
            'status' => 'error',
            'message' => 'Update functionality not implemented'
        ];
    }

    public function deleteEvent($id) {
        // TODO: Implement delete functionality
        return [
            'status' => 'error',
            'message' => 'Delete functionality not implemented'
        ];
    }
}
?>