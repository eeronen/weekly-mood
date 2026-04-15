<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config.php';

function jsonError(int $status, string $message): never
{
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// GET is no longer needed — reactions are included in the moods endpoint

// POST: Add a reaction
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode((string) $raw, true);

    if (!is_array($body)) {
        jsonError(400, 'Invalid JSON body.');
    }

    $moodId = (int) ($body['mood_id'] ?? 0);
    $emoji = trim((string) ($body['emoji'] ?? ''));
    $userName = trim((string) ($body['user_name'] ?? ''));

    if ($moodId <= 0) {
        jsonError(400, 'Invalid mood_id.');
    }
    if ($emoji === '' || mb_strlen($emoji) > 10) {
        jsonError(400, 'Emoji must be between 1 and 10 characters.');
    }
    if ($userName === '' || mb_strlen($userName) > 100) {
        jsonError(400, 'User name must be between 1 and 100 characters.');
    }

    try {
        $db = getDB();
        
        // Check if mood exists
        $stmt = $db->prepare('SELECT id FROM moods WHERE id = ?');
        $stmt->execute([$moodId]);
        if (!$stmt->fetch()) {
            jsonError(404, 'Mood entry not found.');
        }

        // Insert or ignore if already exists
        $stmt = $db->prepare('
            INSERT IGNORE INTO reactions (mood_id, emoji, user_name) 
            VALUES (?, ?, ?)
        ');
        $stmt->execute([$moodId, $emoji, $userName]);

        echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        error_log('[weekly-mood] DB error on POST reaction: ' . $e->getMessage());
        jsonError(500, 'Database error. Please try again later.');
    }
    exit;
}

// DELETE: Remove a reaction
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $raw = file_get_contents('php://input');
    $body = json_decode((string) $raw, true);

    if (!is_array($body)) {
        jsonError(400, 'Invalid JSON body.');
    }

    $moodId = (int) ($body['mood_id'] ?? 0);
    $emoji = trim((string) ($body['emoji'] ?? ''));
    $userName = trim((string) ($body['user_name'] ?? ''));

    if ($moodId <= 0) {
        jsonError(400, 'Invalid mood_id.');
    }
    if ($emoji === '') {
        jsonError(400, 'Emoji is required.');
    }
    if ($userName === '') {
        jsonError(400, 'User name is required.');
    }

    try {
        $db = getDB();
        $stmt = $db->prepare('DELETE FROM reactions WHERE mood_id = ? AND emoji = ? AND user_name = ?');
        $stmt->execute([$moodId, $emoji, $userName]);

        echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        error_log('[weekly-mood] DB error on DELETE reaction: ' . $e->getMessage());
        jsonError(500, 'Database error. Please try again later.');
    }
    exit;
}

jsonError(405, 'Method not allowed.');