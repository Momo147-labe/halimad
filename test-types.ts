import { createClient } from '@supabase/supabase-js';
const supabase = createClient("http://localhost", "key", {
  auth: {
    // testing completion
  }
});
