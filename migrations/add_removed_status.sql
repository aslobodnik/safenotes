-- Add removed column to safes table
ALTER TABLE safes
ADD COLUMN removed BOOLEAN DEFAULT 0;
-- Add removed_at timestamp
ALTER TABLE safes
ADD COLUMN removed_at DATETIME;