-- Increase image column size to support longer URLs
ALTER TABLE equipments MODIFY COLUMN image TEXT;