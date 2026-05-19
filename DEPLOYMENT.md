# Vercel Deployment Guide

This guide walks you through deploying the Bookstore Pro v2 project to Vercel.

## Prerequisites

1. **Node.js**: Version 18+ installed locally
2. **npm** or **yarn**: Package manager
3. **Git**: Repository initialized and pushed to GitHub/GitLab/Bitbucket
4. **Vercel Account**: Create one at https://vercel.com

## Step 1: Prepare Your Repository

### 1.1 Create/Update Environment Variables File

Create a `.env` file in the root directory (for local development):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_SECRET=your-admin-secret-key
```

**Note**: Never commit the `.env` file to Git. It's already in `.gitignore` by default.

### 1.2 Use `.env.example` for Reference

The `.env.example` file is provided for team members to understand what environment variables are needed. It contains no sensitive data.

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended for Testing)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy the project**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to your Git repository
   - Select project name
   - Configure build settings (defaults are fine)
   - Add environment variables when prompted

### Option B: Using GitHub (Easiest)

1. **Push your code to GitHub**:
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project Settings**:
   - **Framework**: `Vite` (should auto-detect)
   - **Build Command**: `npm run build` ✓
   - **Output Directory**: `dist` ✓ (auto-detected)
   - **Install Command**: `npm install` ✓

4. **Add Environment Variables**:
   - In the "Environment Variables" section, add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_ADMIN_SECRET`
   - Get these values from your Supabase project settings

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

## Step 3: Get Your Supabase Credentials

### Retrieve from Supabase Dashboard:

1. Go to https://app.supabase.com
2. Select your project
3. Click "Settings" → "API"
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`

### Admin Secret:

Create a secure random string for `VITE_ADMIN_SECRET`. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Set Environment Variables in Vercel

After initial deployment:

1. **Go to Project Settings** in Vercel:
   - Dashboard → Your Project → Settings → Environment Variables

2. **Add Variables for All Environments**:
   - Add each variable for "Production", "Preview", and "Development"

3. **Environment Variable Format**:
   ```
   VITE_SUPABASE_URL=https://[your-project].supabase.co
   VITE_SUPABASE_ANON_KEY=[your-anon-key]
   VITE_ADMIN_SECRET=[your-secure-secret]
   ```

## Step 5: Configure Supabase CORS

To prevent CORS errors, configure Supabase to accept requests from your Vercel domain:

1. In Supabase Dashboard → Project Settings → API
2. Update **Allowed URLs** to include your Vercel domain:
   - `https://[your-project-name].vercel.app`
   - `https://[your-custom-domain].com` (if using a custom domain)

Also add for development/preview:
   - `http://localhost:5173`

## Step 6: Test the Deployment

After deployment:

1. **Visit your Vercel URL**: `https://[your-project-name].vercel.app`
2. **Check the store page**: `/` should load correctly
3. **Check admin login**: `/admin/login?secret=[VITE_ADMIN_SECRET]`
4. **Check database connection**: `/diagnostics`

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: Make sure all dependencies are installed:
```bash
npm install
npm run build
```

### Issue: 404 errors on page refresh

**Solution**: This is fixed by the `vercel.json` file which includes SPA rewrites:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Issue: Environment variables not being read

**Symptoms**: `import.meta.env.VITE_*` returns `undefined`

**Solution**:
1. Make sure variables are prefixed with `VITE_` (Vite requirement)
2. Verify variables are added in Vercel Project Settings
3. Redeploy after adding variables: Use "Redeploy" button in Vercel
4. Variables must exist at build time - they're embedded in the bundle

### Issue: Admin login not working

**Solution**: Make sure `VITE_ADMIN_SECRET` is set in Vercel environment variables and matches the secret you use in the URL:
```
/admin/login?secret=your-admin-secret-key
```

### Issue: Database connection errors

**Solution**:
1. Verify Supabase URL and Anon Key are correct
2. Check Supabase CORS settings include your Vercel domain
3. Ensure Supabase project is active (not paused)

## GitHub Actions Workflow (Optional Auto-Deploy)

Create `.github/workflows/deploy.yml` for automatic deployments:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Production Best Practices

1. **Use Custom Domain**: 
   - In Vercel: Settings → Domains
   - Add your custom domain (e.g., bookstore.com)

2. **Enable HTTPS**: Automatic with Vercel

3. **Monitor Performance**:
   - Use Vercel Analytics
   - Check Web Vitals

4. **Set Up Monitoring**:
   - View logs in Vercel Dashboard
   - Set up alerts for errors

5. **Regular Updates**:
   - Keep dependencies updated: `npm update`
   - Review security advisories: `npm audit`

## Rollback / Version Management

To revert to a previous deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the deployment you want to rollback to
3. Click the three dots → Promote to Production

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev
- **Supabase Docs**: https://supabase.com/docs
- **React Router Docs**: https://reactrouter.com
