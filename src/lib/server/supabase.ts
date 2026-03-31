import { createClient } from '@supabase/supabase-js';

const getRequiredEnv = (name: 'SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY', env: ImportMetaEnv) => {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
};

export const getSupabaseAdminClient = (env: ImportMetaEnv) => {
  const supabaseUrl = getRequiredEnv('SUPABASE_URL', env);
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY', env);

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export const getContactInquiriesTable = (env: ImportMetaEnv) =>
  env.SUPABASE_CONTACT_INQUIRIES_TABLE?.trim() || 'contact_inquiries';
