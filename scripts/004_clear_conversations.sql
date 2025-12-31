-- Clear all conversations from the database
DELETE FROM conversations;

-- Optional: Reset the sequences if using serial IDs
-- TRUNCATE TABLE conversations RESTART IDENTITY CASCADE;
