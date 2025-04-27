-- Add status column to loan table
ALTER TABLE loan ADD COLUMN status VARCHAR;

-- Set default value for existing loans
UPDATE loan SET status = 'active';

-- Make status column NOT NULL
ALTER TABLE loan ALTER COLUMN status SET NOT NULL;

-- Optional: Add constraint to restrict status values
ALTER TABLE loan ADD CONSTRAINT loan_status_check 
CHECK (status IN ('active', 'completed', 'defaulted', 'cancelled')); 