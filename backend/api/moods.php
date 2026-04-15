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

/**
 * Send a JSON error response and terminate.
 */
function jsonError(int $status, string $message): never
{
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Validate that $imageData is either null or a safe base64 data URI.
 * Keeps size under ~11 MB encoded.
 */
function validateImageData(?string $imageData): bool
{
    if ($imageData === null) {
        return true;
    }
    // Must be a data URI for an image type we accept
    if (!preg_match('/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+\/=]+$/', $imageData)) {
        return false;
    }
    // Limit encoded size to 11 MB to allow animated GIFs (8 MB raw ≈ ~10.7 MB base64)
    if (mb_strlen($imageData, '8bit') > 11534336) {
        return false;
    }
    return true;
}

// ── GET: retrieve moods for a date, or by user name ─────────────────────────

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $name = isset($_GET['name']) ? trim($_GET['name']) : '';

    // If name is provided, return all moods for that user
    if ($name !== '') {
        if (mb_strlen($name) > 100) {
            jsonError(400, 'Invalid name.');
        }
        try {
            $db   = getDB();
            $stmt = $db->prepare(
                'SELECT id, name, mood, image_data, image_type, created_at
                   FROM moods
                  WHERE name = ?
                  ORDER BY created_at DESC
                  LIMIT 50'
            );
            $stmt->execute([$name]);
            $rows = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $rows], JSON_UNESCAPED_UNICODE);
        } catch (PDOException $e) {
            error_log('[weekly-mood] DB error on GET by name: ' . $e->getMessage());
            jsonError(500, 'Database error. Please try again later.');
        }
        exit;
    }

    $date = $_GET['date'] ?? date('Y-m-d');

    // Strict date format check
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        jsonError(400, 'Invalid date format. Use YYYY-MM-DD.');
    }
    // Verify it is a real calendar date
    $parsed = DateTime::createFromFormat('Y-m-d', $date);
    if ($parsed === false || $parsed->format('Y-m-d') !== $date) {
        jsonError(400, 'Invalid date value.');
    }

    try {
        $db   = getDB();
        $stmt = $db->prepare(
            'SELECT id, name, mood, image_data, image_type, created_at
               FROM moods
              WHERE DATE(created_at) = ?
              ORDER BY created_at ASC'
        );
        $stmt->execute([$date]);
        $rows = $stmt->fetchAll();

        // Fetch reactions for all moods in one query
        $moodIds = array_column($rows, 'id');
        $reactionsByMood = [];
        if (count($moodIds) > 0) {
            $placeholders = implode(',', array_fill(0, count($moodIds), '?'));
            $rStmt = $db->prepare("
                SELECT mood_id, emoji, COUNT(*) as count, GROUP_CONCAT(user_name) as users
                FROM reactions
                WHERE mood_id IN ($placeholders)
                GROUP BY mood_id, emoji
                ORDER BY count DESC, emoji ASC
            ");
            $rStmt->execute($moodIds);
            foreach ($rStmt->fetchAll() as $r) {
                $reactionsByMood[(int) $r['mood_id']][] = [
                    'emoji' => $r['emoji'],
                    'count' => $r['count'],
                    'users' => $r['users'],
                ];
            }
        }

        foreach ($rows as &$row) {
            $row['reactions'] = $reactionsByMood[(int) $row['id']] ?? [];
        }
        unset($row);

        echo json_encode(['success' => true, 'data' => $rows], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        error_log('[weekly-mood] DB error on GET: ' . $e->getMessage());
        jsonError(500, 'Database error. Please try again later.');
    }

    exit;
}

// ── POST: submit a mood entry ────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Enforce a 13 MB request body limit (image is max ~11 MB encoded + JSON overhead)
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 13631488) {
        jsonError(413, 'Request body too large (max 13 MB).');
    }

    $raw  = file_get_contents('php://input');
    $body = json_decode((string) $raw, true);

    if (!is_array($body)) {
        jsonError(400, 'Invalid JSON body.');
    }

    // ── Extract and sanitise fields ───────────────────────────────────────

    $name      = isset($body['name'])       ? trim((string) $body['name'])       : '';
    $mood      = isset($body['mood'])       ? (int) $body['mood']                : 0;
    $imageData = isset($body['image_data']) ? (string) $body['image_data']       : null;
    $imageType = isset($body['image_type']) ? (string) $body['image_type']       : null;

    // Empty strings → null
    if ($imageData === '') { $imageData = null; }
    if ($imageType === '') { $imageType = null; }

    // ── Validation ────────────────────────────────────────────────────────

    if ($name === '' || mb_strlen($name) > 100) {
        jsonError(400, 'Name must be between 1 and 100 characters.');
    }

    if ($mood < 1 || $mood > 5) {
        jsonError(400, 'Mood must be an integer between 1 and 5.');
    }

    if ($imageType !== null && !in_array($imageType, ['drawing', 'upload'], true)) {
        jsonError(400, 'image_type must be "drawing" or "upload".');
    }

    // Ensure imageType is set if imageData is present, and vice-versa
    if ($imageData !== null && $imageType === null) {
        jsonError(400, 'image_type is required when image_data is provided.');
    }
    if ($imageType !== null && $imageData === null) {
        $imageType = null; // silently clear orphaned type
    }

    if (!validateImageData($imageData)) {
        jsonError(400, 'Invalid image_data. Must be a PNG/JPEG/GIF/WebP data URI under 11 MB.');
    }

    // ── Persist ───────────────────────────────────────────────────────────

    try {
        $db   = getDB();
        $stmt = $db->prepare(
            'INSERT INTO moods (name, mood, image_data, image_type) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$name, $mood, $imageData, $imageType]);

        $id = (int) $db->lastInsertId();
        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        error_log('[weekly-mood] DB error on POST: ' . $e->getMessage());
        jsonError(500, 'Database error. Please try again later.');
    }

    exit;
}

// ── DELETE: remove a mood entry (ownership verified by name) ────────────────

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $raw  = file_get_contents('php://input');
    $body = json_decode((string) $raw, true);

    if (!is_array($body)) {
        jsonError(400, 'Invalid JSON body.');
    }

    $id   = isset($body['id'])   ? (int) $body['id']              : 0;
    $name = isset($body['name']) ? trim((string) $body['name'])   : '';

    if ($id <= 0) {
        jsonError(400, 'Invalid id.');
    }
    if ($name === '') {
        jsonError(400, 'Name is required.');
    }

    try {
        $db   = getDB();
        $stmt = $db->prepare('DELETE FROM moods WHERE id = ? AND name = ?');
        $stmt->execute([$id, $name]);

        if ($stmt->rowCount() === 0) {
            jsonError(404, 'Mood entry not found or does not belong to you.');
        }

        echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        error_log('[weekly-mood] DB error on DELETE: ' . $e->getMessage());
        jsonError(500, 'Database error. Please try again later.');
    }

    exit;
}

// ── Unsupported method ───────────────────────────────────────────────────────
jsonError(405, 'Method not allowed.');
