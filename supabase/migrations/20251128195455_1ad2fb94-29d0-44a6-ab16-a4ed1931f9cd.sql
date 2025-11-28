-- Fix verify_invite_token function type mismatch
-- magic_link_token is TEXT, not UUID

-- Drop old function with wrong signature
DROP FUNCTION IF EXISTS public.verify_invite_token(uuid, text);

-- Recreate with correct types (text, text)
CREATE OR REPLACE FUNCTION public.verify_invite_token(
  p_token text,  -- Changed from uuid to text to match magic_link_token column
  p_invite_code text
)
RETURNS TABLE (
  id uuid,
  key_code text,
  recipient_email text,
  recipient_name text,
  role app_role,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ik.id,
    ik.key_code,
    ik.recipient_email,
    ik.recipient_name,
    ik.role,
    (ik.is_active = true 
     AND ik.used_by IS NULL 
     AND (ik.expires_at IS NULL OR ik.expires_at > now())
    ) as is_valid
  FROM invite_keys ik
  WHERE ik.magic_link_token = p_token
    AND ik.key_code = p_invite_code;
END;
$$;

-- Grant permissions with correct signature (text, text)
GRANT EXECUTE ON FUNCTION public.verify_invite_token(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_invite_token(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_invite_token(text, text) TO service_role;