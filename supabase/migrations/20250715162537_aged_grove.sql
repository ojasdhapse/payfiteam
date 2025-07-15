/*
  # Add donor name and wallet fields to contributions

  1. Changes
    - Add `donor_name` column to contributions table
    - Add `donor_wallet` column to contributions table
    - These fields store the donor's display name and wallet address for the Hall of Fame

  2. Security
    - No changes to RLS policies needed
    - Fields are optional and can be null
*/

-- Add donor fields to contributions table
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS donor_name text;
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS donor_wallet text;