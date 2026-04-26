-- Vibeshelf · build-process notes
-- "How they built it" — optional fields makers can fill in to share process.

ALTER TABLE apps ADD COLUMN IF NOT EXISTS hours_to_ship numeric;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS key_prompt text;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS gotcha text;
