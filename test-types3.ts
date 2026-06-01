import { createClient } from '@supabase/supabase-js';
const supabase = createClient("http://localhost", "key", {
  auth: {
    lock: async (name, acquire) => { return await acquire(); }
  }
});
