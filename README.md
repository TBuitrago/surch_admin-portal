# Surch Admin Portal

Internal admin portal for managing clients, viewing scrape history, AI intelligence, and email logs.

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **UI**: Modern admin-style interface

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project with database tables already created

### Environment Variables

Create `.env` files in both `backend` and `frontend` directories:

**backend/.env:**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

**frontend/.env:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
```

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` and backend at `http://localhost:3001`.

## Features

- **Client Management**: Create and view clients
- **Scrape History**: View website scraping results
- **AI Intelligence**: View AI-generated client profiles
- **Email Logs**: Track automated emails sent to clients

## API Endpoints

### Webhooks (for n8n integration)

- `POST /api/webhooks/scrapes` - Receive scrape results
- `POST /api/webhooks/intelligence` - Receive AI intelligence
- `POST /api/webhooks/emails` - Receive email send confirmations

## Authentication

Admin-only access via Supabase Auth. 

### Creating Your First Admin User

You can create your first admin user in one of two ways:

1. **Via Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Users
   - Click "Add User" and create a user with email/password

2. **Via Supabase SQL Editor:**
   ```sql
   -- Insert a user directly (you'll need to set password via dashboard or auth API)
   INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
   VALUES ('admin@example.com', crypt('your-password', gen_salt('bf')), now(), now(), now());
   ```

After creating the user, you can log in at `http://localhost:5173/login`.

## Webhook Integration (n8n)

The portal provides webhook endpoints for n8n to send data. No authentication is required for v1, but endpoints are structured to allow adding authentication later.

### Webhook Endpoints

#### POST /api/webhooks/scrapes
Receive scrape results from n8n.

**Payload:**
```json
{
  "client_id": "uuid",
  "scrape_date": "2024-01-01T00:00:00Z",
  "urls_scraped": ["https://example.com/page1", "https://example.com/page2"],
  "data_extracted": {},
  "status": "completed"
}
```

#### POST /api/webhooks/intelligence
Receive AI-generated intelligence.

**Payload:**
```json
{
  "client_id": "uuid",
  "intelligence_type": "profile",
  "content": "Client description text...",
  "metadata": {
    "clientDescription": "...",
    "valueProposition": "...",
    "brandTone": "...",
    "primaryFocusAreas": ["area1", "area2"],
    "services": [{"title": "...", "description": "..."}],
    "idealContentAngles": ["angle1", "angle2"]
  },
  "version": 1
}
```

#### POST /api/webhooks/emails
Receive email send confirmations.

**Payload:**
```json
{
  "client_id": "uuid",
  "recipient": "client@example.com",
  "subject": "Email Subject",
  "body": "Email body content",
  "email_type": "newsletter",
  "status": "sent",
  "metadata": {}
}
```

## Project Structure

```
surch_admin-portal/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── lib/          # Utilities (API, Supabase)
│   │   ├── pages/        # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## Database Schema

The portal expects the following Supabase tables (already created):

- `clients` - Client information
- `scrapes` - Website scraping history
- `client_intelligence` - AI-generated client intelligence
- `emails` - Email send logs

See the requirements document for full schema details.
