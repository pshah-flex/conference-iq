-- SQL script to set admin role for a user
-- This updates the user's metadata to include role: 'admin'

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'param@flexscale.com';

-- Verify the update
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'param@flexscale.com';

