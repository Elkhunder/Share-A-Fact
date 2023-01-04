import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xbbczrvjilrvumcislzz.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiYmN6cnZqaWxydnVtY2lzbHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI2ODg0MTQsImV4cCI6MTk4ODI2NDQxNH0.VGYvSlX6XOEnoJ5o3J_TDEualQRnkVFRDtngIur6T94';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
