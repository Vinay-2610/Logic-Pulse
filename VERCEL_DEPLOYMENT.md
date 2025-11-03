# Vercel Deployment Guide for LogicPulse

## Environment Variables

Your LogicPulse application **does NOT require any mandatory environment variables** for basic functionality. However, here are the optional configurations:

### Optional Environment Variables

1. **PORT** (Optional)
   - Default: `5000`
   - Vercel automatically sets this, so you don't need to configure it
   - Used by: `server/index.ts`

2. **DATABASE_URL** (Optional - Not Currently Used)
   - The app currently uses in-memory storage (`MemStorage`)
   - Database configuration exists in `drizzle.config.ts` but is not actively used
   - Only needed if you plan to add persistent database storage in the future
   - Format: `postgresql://user:password@host:port/database`

3. **NODE_ENV** (Automatically set by Vercel)
   - Vercel sets this to `production` automatically
   - Used to determine whether to use Vite dev server or serve static files

## Vercel Configuration

Create a `vercel.json` file in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "server/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (Already done ✅)

2. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with your GitHub account

3. **Import Project**
   - Click "Add New..." → "Project"
   - Select your `Logic-Pulse` repository
   - Click "Import"

4. **Configure Project**
   - Framework Preset: **Other** (or leave as detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (should auto-detect)
   - Output Directory: `dist` (should auto-detect)
   - Install Command: `npm install` (should auto-detect)

5. **Environment Variables** (Optional)
   - You can skip this section as no variables are required
   - If you want to add database support later, add `DATABASE_URL` here

6. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (2-5 minutes)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **logic-pulse**
   - In which directory is your code located? **.**

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Build Configuration

Your `package.json` should have these scripts (already configured):

```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts"
  }
}
```

## Important Notes

### 1. **No Database Required**
Your app uses in-memory storage, so projects are stored temporarily. They will reset when the server restarts. This is fine for a demo/prototype.

### 2. **Verilog Compilation**
- The app has a **fallback JavaScript simulator** that works without `iverilog`
- Vercel serverless functions don't support `iverilog` installation
- Users will see: "Simulation completed using fallback simulator (limited Verilog support)"
- This is expected and the app will work fine for basic circuits

### 3. **File Storage**
- Temporary Verilog files are stored in `server/data/`
- These are ephemeral on Vercel (cleared between deployments)
- Sample files in `server/data/samples/` are included in the build

### 4. **Static Assets**
- Client files are built to `dist/` directory
- Served by Express in production mode
- Vercel handles this automatically

## Post-Deployment Checklist

After deployment, verify:

- ✅ Homepage loads correctly
- ✅ Visual Circuit Simulator works
- ✅ Verilog Editor loads
- ✅ Sample circuits load from dropdown
- ✅ Compilation works (with fallback simulator message)
- ✅ Simulation generates waveforms
- ✅ Project save/load works (temporary storage)

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure `npm install` works locally
- Check Vercel build logs for specific errors

### API Routes Don't Work
- Verify `vercel.json` routes configuration
- Check that API endpoints start with `/api/`
- Review Vercel function logs

### Static Files Not Loading
- Ensure `npm run build` creates `dist/` directory
- Check that `server/vite.ts` serves static files correctly
- Verify `dist/` is not in `.gitignore`

### Verilog Simulation Issues
- This is expected - fallback simulator is used
- Users will see a message about limited Verilog support
- For full support, consider deploying to a VPS with `iverilog`

## Future Enhancements

To add persistent storage:

1. **Add a Database** (PostgreSQL recommended)
   - Use Vercel Postgres or external provider (Supabase, Neon, etc.)
   - Set `DATABASE_URL` environment variable
   - Implement database storage instead of `MemStorage`

2. **Add File Storage** (for Verilog files)
   - Use Vercel Blob Storage or S3
   - Store compiled files externally

3. **Add Authentication**
   - Use NextAuth.js or similar
   - Protect project routes

## Support

For issues specific to Vercel deployment:
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

For LogicPulse issues:
- Check the main README.md
- Review TESTING.md for verification steps
