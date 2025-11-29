# @sparticuz/chromium Setup for Vercel

## Overview

We're using `@sparticuz/chromium` with `puppeteer-core` for optimal serverless compatibility on Vercel. This provides a pre-built, optimized Chromium binary that works in serverless environments.

## Package Changes

- ❌ Removed: `puppeteer` (includes bundled Chrome, too large for serverless)
- ✅ Added: `puppeteer-core` (no bundled browser)
- ✅ Added: `@sparticuz/chromium` (pre-built Chromium for serverless)

## How It Works

1. **Serverless (Vercel)**: Uses `@sparticuz/chromium` which provides a lightweight, pre-built Chrome binary optimized for serverless environments
2. **Local Development**: Attempts to use system Chrome/Chromium if available, or you can install regular `puppeteer` as a dev dependency

## Configuration

The crawler automatically detects the environment:
- If `VERCEL` or `AWS_LAMBDA_FUNCTION_NAME` environment variables are present → uses `@sparticuz/chromium`
- Otherwise → tries to use system Chrome

## Local Development

For local development, you have two options:

### Option 1: Install Chrome/Chromium System-Wide
- macOS: `brew install --cask google-chrome`
- Linux: `sudo apt-get install chromium-browser`

### Option 2: Use Regular Puppeteer for Local Dev
Install regular Puppeteer as a dev dependency:
```bash
npm install --save-dev puppeteer
```

Then set environment variable:
```bash
export PUPPETEER_EXECUTABLE_PATH=$(npx puppeteer browsers path chrome)
```

Or modify the code to use regular puppeteer in development mode.

## Benefits

✅ **Much smaller bundle size** - @sparticuz/chromium is optimized for serverless
✅ **Works on Vercel** - No browser installation needed
✅ **Faster cold starts** - Pre-built binary loads faster
✅ **Better compatibility** - Designed specifically for AWS Lambda/Vercel

## Testing

After deploying to Vercel:
1. Go to `/admin/crawl`
2. Enter a conference URL
3. Click "Start Crawl"

The crawler should now work without Chrome installation errors!

