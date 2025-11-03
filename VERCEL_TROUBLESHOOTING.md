# Vercel Deployment Troubleshooting

## Recent Fix Applied ✅

The `ERR_MODULE_NOT_FOUND` error has been fixed by:
1. Refactoring the app to separate Express app creation from server listening
2. Creating a proper Vercel serverless function entry point
3. Updating the build process to work with Vercel's serverless architecture

## How to Redeploy

### Option 1: Automatic Redeploy (Recommended)
Since you've pushed the fix to GitHub, Vercel should automatically redeploy:
1. Go to your Vercel dashboard
2. Check the "Deployments" tab
3. Wait for the new deployment to complete (2-5 minutes)
4. The latest commit should show: "Fix Vercel deployment: Refactor for serverless functions"

### Option 2: Manual Redeploy
If automatic deployment doesn't trigger:
1. Go to your Vercel project dashboard
2. Click on the three dots menu (⋯) next to your latest deployment
3. Click "Redeploy"
4. Select "Use existing Build Cache" (unchecked) for a fresh build
5. Click "Redeploy"

### Option 3: Redeploy via CLI
```bash
vercel --prod --force
```

## What Changed

### Before (Broken)
- Vercel tried to run `server/index.ts` directly as a TypeScript file
- Module imports failed because TypeScript wasn't compiled
- Server tried to listen on a port (not allowed in serverless)

### After (Fixed)
- Build process compiles TypeScript to JavaScript
- Express app is created without starting a server
- Vercel serverless function wraps the Express app
- All routes work through the `/api` endpoint

## Verify Deployment

After redeployment, test these URLs (replace with your Vercel URL):

1. **Homepage**: `https://your-app.vercel.app/`
   - Should load the LogicPulse interface

2. **API Health Check**: `https://your-app.vercel.app/api/status`
   - Should return: `{"status":"ok","message":"LogicPulse server running"}`

3. **Simulator Page**: `https://your-app.vercel.app/simulator`
   - Should load the visual circuit builder

4. **Verilog Editor**: `https://your-app.vercel.app/verilog`
   - Should load the code editor

## Common Issues After Fix

### Issue: 404 on all routes
**Cause**: Build didn't complete or static files missing
**Solution**: 
- Check Vercel build logs for errors
- Ensure `dist/public` directory was created
- Redeploy with fresh build (no cache)

### Issue: API routes work but pages don't load
**Cause**: Static file serving issue
**Solution**:
- Check that `vite build` completed successfully
- Verify `dist/public/index.html` exists in build output
- Check Vercel function logs for errors

### Issue: "Cannot find module" errors
**Cause**: Missing dependencies or build issue
**Solution**:
```bash
# Locally test the build
npm run build
npm start

# If it works locally, redeploy to Vercel
vercel --prod --force
```

### Issue: Verilog simulation doesn't work
**Expected Behavior**: This is normal!
- Vercel doesn't support `iverilog` installation
- The app uses a JavaScript fallback simulator
- Users will see: "Simulation completed using fallback simulator (limited Verilog support)"
- Basic circuits will work, complex Verilog may not

## Build Configuration

Your `vercel.json` should look like this:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

## Check Build Logs

To see what went wrong:
1. Go to Vercel Dashboard → Your Project
2. Click on the failed deployment
3. Click "Building" or "View Function Logs"
4. Look for error messages

Common error patterns:
- `ERR_MODULE_NOT_FOUND` → Fixed by this update
- `Cannot find module` → Missing dependency in package.json
- `ENOENT: no such file` → Build output missing
- `Timeout` → Function taking too long (increase maxDuration)

## Environment Variables (None Required)

Your app doesn't need any environment variables, but Vercel automatically sets:
- `NODE_ENV=production`
- `PORT` (handled by Vercel)
- `VERCEL=1`
- `VERCEL_ENV=production`

## Performance Notes

### Cold Starts
- First request after inactivity may take 1-3 seconds
- This is normal for serverless functions
- Subsequent requests will be fast

### Memory Limits
- Default: 1024 MB (configured in vercel.json)
- Should be sufficient for this app
- If you see memory errors, increase to 2048 MB

### Timeout
- Default: 10 seconds (configured in vercel.json)
- Verilog compilation may take a few seconds
- If simulations timeout, increase maxDuration to 30

## Alternative: Deploy to a VPS

If you need full Verilog support with `iverilog`:

### Recommended Platforms:
1. **Railway** - Easy deployment, supports Docker
2. **Render** - Free tier available, supports native builds
3. **DigitalOcean App Platform** - $5/month, full control
4. **Heroku** - Classic PaaS, supports buildpacks

### For VPS Deployment:
```bash
# Install iverilog
apt-get install iverilog

# Run the app
npm install
npm run build
npm start
```

## Getting Help

If issues persist:
1. Check Vercel function logs (real-time)
2. Test the build locally: `npm run build && npm start`
3. Review the error messages in Vercel dashboard
4. Check that all files are committed to GitHub
5. Try deploying from a fresh clone of your repo

## Success Checklist

After deployment, verify:
- ✅ Homepage loads
- ✅ `/api/status` returns OK
- ✅ Visual simulator works
- ✅ Verilog editor loads
- ✅ Sample circuits load
- ✅ Compilation works (with fallback message)
- ✅ Waveforms display
- ✅ No console errors

## Next Steps

Once deployed successfully:
1. Test all features thoroughly
2. Share the Vercel URL
3. Monitor function logs for errors
4. Consider adding analytics
5. Set up custom domain (optional)
