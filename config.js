// config.js
const CONFIG = {
    SUPABASE_URL: 'https://xvwntavtpofolfeqtckn.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2d250YXZ0cG9mb2xmZXF0Y2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MjgyNzMsImV4cCI6MjA4NDQwNDI3M30.6kZ2tCp7wI7hBr_7PAYAQ6trBgZKs1beKeR6majGAts',
};

var supabaseDb;
if (!supabaseDb) {
    supabaseDb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
}