import { createClient } from '@supabase/supabase-js';

// Supabase anon key는 공개용(publishable)이므로 코드에 직접 포함해도 안전합니다.
// RLS 정책으로 서버측에서 접근이 제어됩니다.
const SUPABASE_URL = 'https://evxgitndgulmtyyueavr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4CfX_HbeHNVilqlGxq0SjA_I0RsaU_i';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
