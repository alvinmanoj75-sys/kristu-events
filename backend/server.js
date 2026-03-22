require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  'https://oavsobirgztjmsuvekft.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdnNvYmlyZ3p0am1zdXZla2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjU5ODAsImV4cCI6MjA4OTc0MTk4MH0.6Pn8z8NXb2x0lAoTDbb3hM7O8lNOz3fqjvl6xFKCIuw',
  { db: { schema: 'public' } }
);

// ===== GET ALL APPROVED EVENTS =====
app.get('/api/events', async (req, res) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('approved', true)
    .order('date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ===== GET ALL EVENTS (ADMIN) =====
app.get('/api/admin/events', async (req, res) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ===== SUBMIT NEW EVENT =====
app.post('/api/events', async (req, res) => {
  const { title, date, description } = req.body;
  if (!title || !date || !description)
    return res.status(400).json({ error: 'All fields are required' });

  const { data, error } = await supabase
    .from('events')
    .insert([{ title, date, description, approved: false }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Event submitted successfully!' });
});

// ===== APPROVE EVENT (ADMIN) =====
app.patch('/api/admin/events/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('events')
    .update({ approved: true })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Event approved!' });
});

// ===== DELETE EVENT (ADMIN) =====
app.delete('/api/admin/events/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Event deleted!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
