import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnvmuaxuxaurjcsskxqs.supabase.co';
const supabaseKey = 'sb_publishable_iFUwAsKqFfUtEewOfEbL6g_wWU1b_9w';

export const supabase = createClient(supabaseUrl, supabaseKey);
