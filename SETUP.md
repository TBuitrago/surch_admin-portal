# Setup Guide

## Quick Start

1. **Clone and Install**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Configure Environment Variables**

   Copy the example files and fill in your Supabase credentials:
   
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your Supabase URL and Service Role Key
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your Supabase URL and Anon Key
   ```

3. **Get Supabase Credentials**

   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy:
     - Project URL → `SUPABASE_URL` / `VITE_SUPABASE_URL`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend only)
     - `anon` key → `VITE_SUPABASE_ANON_KEY` (frontend only)

4. **Create Admin User**

   Option A - Via Supabase Dashboard:
   - Go to Authentication > Users
   - Click "Add User"
   - Enter email and password
   - Save

   Option B - Via SQL (requires password hash):
   ```sql
   -- This is a simplified example. Use Supabase dashboard for easier setup.
   ```

5. **Start Development Servers**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the Portal**

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Login with your admin credentials

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` files exist in both `backend/` and `frontend/`
- Check that all required variables are set

### "Failed to sign in"
- Verify the user exists in Supabase Authentication
- Check that email/password are correct
- Ensure Supabase project is active

### "Error fetching clients"
- Verify backend is running on port 3001
- Check Supabase connection in backend `.env`
- Ensure database tables exist

### CORS errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Default is `http://localhost:5173`

## Production Deployment

For production:

1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `cd frontend && npm run build`
3. Serve frontend build files via a static server (nginx, Vercel, etc.)
4. Update `FRONTEND_URL` in backend `.env` to production URL
5. Consider adding authentication to webhook endpoints

