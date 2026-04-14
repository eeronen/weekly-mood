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
