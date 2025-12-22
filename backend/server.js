import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error('Missing required environment variables:', missingEnv.join(', '));
  process.exit(1);
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helpers
const frontendOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

function handleError(res, status, message, details) {
  return res.status(status).json({ error: message, details });
}

function safeJsonParse(value) {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (err) {
    return value;
  }
}

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || frontendOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Clients
app.get('/api/clients', async (req, res) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients', error);
    return handleError(res, 500, 'Failed to fetch clients', error.message);
  }

  return res.json(data || []);
});

app.post('/api/clients', async (req, res) => {
  const { name, website, status = 'active', n8n_webhook_url = null } = req.body || {};

  if (!name || !website) {
    return handleError(res, 400, 'Name and website are required');
  }

  const payload = {
    name,
    website,
    status,
    n8n_webhook_url,
  };

  const { data, error } = await supabase.from('clients').insert(payload).select().single();

  if (error) {
    console.error('Error creating client', error);
    const isDuplicate = error.code === '23505';
    return handleError(
      res,
      isDuplicate ? 409 : 500,
      isDuplicate ? 'Client already exists' : 'Failed to create client',
      error.message
    );
  }

  return res.status(201).json(data);
});

app.get('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching client', error);
    return handleError(res, 404, 'Client not found', error.message);
  }

  return res.json(data);
});

app.put('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { status, n8n_webhook_url } = req.body || {};

  const updates = {};
  if (status) updates.status = status;
  updates.n8n_webhook_url = n8n_webhook_url ?? null;

  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client', error);
    return handleError(res, 400, 'Failed to update client', error.message);
  }

  return res.json(data);
});

app.delete('/api/clients/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from('clients').delete().eq('id', id);

  if (error) {
    console.error('Error deleting client', error);
    return handleError(res, 400, 'Failed to delete client', error.message);
  }

  return res.status(204).send();
});

app.post('/api/clients/:id/trigger-automation', async (req, res) => {
  const { id } = req.params;

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !client) {
    console.error('Error fetching client for automation', error);
    return handleError(res, 404, 'Client not found', error?.message);
  }

  if (client.status !== 'active') {
    return handleError(res, 400, 'Client must be active to trigger automation');
  }

  if (!client.n8n_webhook_url) {
    return handleError(res, 400, 'Client does not have a webhook URL configured');
  }

  try {
    const response = await fetch(client.n8n_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: client.id,
        name: client.name,
        website: client.website,
        triggered_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Webhook responded with ${response.status}: ${text || 'No body'}`);
    }

    return res.json({ status: 'triggered' });
  } catch (err) {
    console.error('Error triggering automation', err);
    return handleError(res, 502, 'Failed to trigger automation', err.message);
  }
});

// Scrapes
app.get('/api/clients/:id/scrapes', async (req, res) => {
  const { id } = req.params;

  const { data: scrapes, error } = await supabase
    .from('scrapes')
    .select('*')
    .eq('client_id', id)
    .order('scrape_date', { ascending: false });

  if (error) {
    console.error('Error fetching scrapes', error);
    return handleError(res, 500, 'Failed to fetch scrapes', error.message);
  }

  // Enrich with intelligence counts if possible
  let responseScrapes = scrapes || [];
  const scrapeIds = responseScrapes.map((s) => s.id).filter(Boolean);
  if (scrapeIds.length > 0) {
    const { data: intelligenceRows, error: intelligenceError } = await supabase
      .from('client_intelligence')
      .select('id, scrape_id')
      .in('scrape_id', scrapeIds);

    if (!intelligenceError && intelligenceRows) {
      const counts = intelligenceRows.reduce((acc, row) => {
        acc[row.scrape_id] = (acc[row.scrape_id] || 0) + 1;
        return acc;
      }, {});
      responseScrapes = responseScrapes.map((scrape) => ({
        ...scrape,
        intelligence_count: counts[scrape.id] || 0,
      }));
    }
  }

  return res.json(responseScrapes);
});

app.get('/api/scrapes/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase.from('scrapes').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching scrape', error);
    return handleError(res, 404, 'Scrape not found', error.message);
  }

  return res.json(data);
});

app.get('/api/scrapes/:id/intelligence', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('client_intelligence')
    .select('*')
    .eq('scrape_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching intelligence for scrape', error);
    return handleError(res, 500, 'Failed to fetch intelligence', error.message);
  }

  return res.json(data || []);
});

// Intelligence
app.get('/api/clients/:id/intelligence', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('client_intelligence')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching intelligence', error);
    return handleError(res, 500, 'Failed to fetch intelligence', error.message);
  }

  return res.json(data || []);
});

app.get('/api/clients/:id/intelligence/:type', async (req, res) => {
  const { id, type } = req.params;

  const { data, error } = await supabase
    .from('client_intelligence')
    .select('*')
    .eq('client_id', id)
    .eq('intelligence_type', type)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching intelligence by type', error);
    return handleError(res, 500, 'Failed to fetch intelligence', error.message);
  }

  return res.json(data || []);
});

// Content Ideas
app.get('/api/clients/:id/content-ideas', async (req, res) => {
  const { id } = req.params;

  // Try to fetch related scrape/intelligence if FK relationships exist; fallback otherwise
  let ideas = [];
  let ideaError = null;

  const { data, error } = await supabase
    .from('content_ideas')
    .select('*, scrape:scrapes(*), intelligence:client_intelligence(*)')
    .eq('client_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    ideaError = error;
  } else {
    ideas = data || [];
  }

  if (ideaError) {
    // Fallback to base query without relationships
    const { data: baseData, error: baseError } = await supabase
      .from('content_ideas')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    if (baseError) {
      console.error('Error fetching content ideas', baseError);
      return handleError(res, 500, 'Failed to fetch content ideas', baseError.message);
    }

    ideas = baseData || [];
  }

  // Normalize JSON fields to objects/arrays
  const normalized = ideas.map((idea) => ({
    ...idea,
    metadata: safeJsonParse(idea.metadata),
    research_context: safeJsonParse(idea.research_context),
    content_ideas: safeJsonParse(idea.content_ideas),
  }));

  return res.json(normalized);
});

// Delivery Settings
app.get('/api/clients/:id/delivery-settings', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('delivery_settings')
    .select('*')
    .eq('client_id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
      return res.json(null);
    }
    console.error('Error fetching delivery settings', error);
    return handleError(res, 500, 'Failed to fetch delivery settings', error.message);
  }

  return res.json(data);
});

app.put('/api/clients/:id/delivery-settings', async (req, res) => {
  const { id } = req.params;
  const { recipients = [], frequency = 'weekly', is_active = true } = req.body || {};

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return handleError(res, 400, 'At least one recipient email is required');
  }

  const cleanRecipients = recipients.filter((email) => email && email.trim() !== '');
  if (cleanRecipients.length === 0) {
    return handleError(res, 400, 'At least one recipient email is required');
  }

  const payload = {
    client_id: id,
    recipients: cleanRecipients,
    frequency,
    is_active,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('delivery_settings')
    .upsert(payload, { onConflict: 'client_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving delivery settings', error);
    return handleError(res, 500, 'Failed to save delivery settings', error.message);
  }

  return res.json(data);
});

// Emails
app.get('/api/clients/:id/emails', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('client_id', id)
    .order('sent_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching emails', error);
    return handleError(res, 500, 'Failed to fetch emails', error.message);
  }

  const normalized = (data || []).map((email) => ({
    ...email,
    recipient: safeJsonParse(email.recipient),
    metadata: safeJsonParse(email.metadata),
  }));

  return res.json(normalized);
});

// Webhooks (for n8n integration)
app.post('/api/webhooks/scrapes', async (req, res) => {
  const {
    client_id,
    scrape_date = new Date().toISOString(),
    urls_scraped = [],
    data_extracted = {},
    status = 'completed',
  } = req.body || {};

  if (!client_id) {
    return handleError(res, 400, 'client_id is required');
  }

  const payload = {
    client_id,
    scrape_date,
    urls_scraped,
    data_extracted,
    status,
  };

  const { data, error } = await supabase.from('scrapes').insert(payload).select().single();

  if (error) {
    console.error('Error inserting scrape', error);
    return handleError(res, 500, 'Failed to save scrape', error.message);
  }

  return res.status(201).json(data);
});

app.post('/api/webhooks/intelligence', async (req, res) => {
  const {
    client_id,
    intelligence_type,
    content,
    metadata = {},
    version = 1,
    scrape_id = null,
  } = req.body || {};

  if (!client_id || !intelligence_type) {
    return handleError(res, 400, 'client_id and intelligence_type are required');
  }

  const payload = {
    client_id,
    intelligence_type,
    content,
    metadata,
    version,
    scrape_id,
  };

  const { data, error } = await supabase
    .from('client_intelligence')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error inserting intelligence', error);
    return handleError(res, 500, 'Failed to save intelligence', error.message);
  }

  return res.status(201).json(data);
});

app.post('/api/webhooks/emails', async (req, res) => {
  const {
    client_id,
    recipient,
    subject,
    body,
    email_type = 'newsletter',
    status = 'sent',
    metadata = {},
    sent_at = new Date().toISOString(),
  } = req.body || {};

  if (!client_id || !recipient) {
    return handleError(res, 400, 'client_id and recipient are required');
  }

  const payload = {
    client_id,
    recipient,
    subject,
    body,
    email_type,
    status,
    metadata,
    sent_at,
  };

  const { data, error } = await supabase.from('emails').insert(payload).select().single();

  if (error) {
    console.error('Error inserting email', error);
    return handleError(res, 500, 'Failed to save email', error.message);
  }

  return res.status(201).json(data);
});

// Serve static files from frontend/dist when present (for Hostinger Node app)
// Try multiple possible paths for the frontend build
const possiblePaths = [
  // Standard structure (local development)
  path.join(__dirname, '..', 'frontend', 'dist'),
  // Hostinger structure
  path.join(process.cwd(), 'frontend', 'dist'),
  // Absolute path from repository root (Hostinger)
  '/public_html/.builds/source/repository/frontend/dist',
  // Alternative Hostinger paths
  path.join(process.cwd(), '..', 'frontend', 'dist'),
  path.join(process.cwd(), '..', '..', 'frontend', 'dist'),
  // Custom path from environment variable
  process.env.FRONTEND_DIST_PATH || null,
].filter(Boolean);

let frontendPath = null;
let frontendIndex = null;
let hasFrontendBuild = false;

// Try to find the frontend build in any of the possible paths
for (const testPath of possiblePaths) {
  const testIndex = path.join(testPath, 'index.html');
  if (fs.existsSync(testIndex)) {
    frontendPath = testPath;
    frontendIndex = testIndex;
    hasFrontendBuild = true;
    break;
  }
}

// Log for debugging
console.log('=== Frontend Configuration ===');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Possible paths tested:', possiblePaths);
console.log('Frontend path found:', frontendPath);
console.log('Frontend index:', frontendIndex);
console.log('Frontend build exists:', hasFrontendBuild);
if (hasFrontendBuild && frontendPath) {
  console.log('Frontend dist directory exists');
  try {
    const files = fs.readdirSync(frontendPath);
    console.log('Files in dist:', files);
  } catch (err) {
    console.error('Error reading dist directory:', err.message);
  }
} else {
  console.log('⚠️  Frontend dist directory NOT found in any of the tested paths');
}
console.log('=============================');

if (hasFrontendBuild) {
  // Serve static files (CSS, JS, images, etc.)
  app.use(express.static(frontendPath, {
    maxAge: '1d',
    etag: true
  }));

  // Serve frontend for all non-API routes (SPA fallback)
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.resolve(frontendIndex), (err) => {
      if (err) {
        console.error('Error serving frontend:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
} else {
  console.error('⚠️  WARNING: frontend/dist not found at:', frontendPath);
  console.error('   Current working directory:', process.cwd());
  console.error('   __dirname:', __dirname);
  console.error('   Make sure to build the frontend before deploying!');
  
  // Provide a helpful error message
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.status(404).json({
      error: 'Frontend not found',
      message: 'The frontend build is missing. Please build the frontend with: cd frontend && npm run build',
      path: frontendPath
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
