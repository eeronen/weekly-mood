-- Weekly Mood — database schema
-- Applied automatically by Docker when the container first starts.

CREATE DATABASE IF NOT EXISTS weekly_mood
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE weekly_mood;

CREATE TABLE IF NOT EXISTS moods (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)              NOT NULL,
    mood        TINYINT UNSIGNED          NOT NULL COMMENT '1 (very bad) to 5 (great)',
    image_data  MEDIUMTEXT                NULL COMMENT 'base64-encoded data URI',
    image_type  ENUM('drawing', 'upload') NULL,
    created_at  TIMESTAMP                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reactions (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mood_id     INT UNSIGNED          NOT NULL,
    emoji       VARCHAR(10)           NOT NULL COLLATE utf8mb4_bin,
    user_name   VARCHAR(100)          NOT NULL,
    created_at  TIMESTAMP             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mood_id) REFERENCES moods(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_emoji_per_mood (mood_id, emoji, user_name),
    INDEX idx_mood_id (mood_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
