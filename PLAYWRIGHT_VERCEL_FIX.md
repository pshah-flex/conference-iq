# Fixing Playwright on Vercel

## Problem
Playwright browsers are too large (~300MB) for Vercel's serverless functions, which have size limits. The browsers need to be available at runtime but aren't being preserved.

## Solution Options

### Option 1: Use External Browser Service (Recommended)
Move crawling to a separate service or use a browser-as-a-service like Browserless.io.

### Option 2: Use Puppeteer (Easier for Serverless)
Switch to Puppeteer which is more serverless-friendly and smaller.

### Option 3: Increase Function Size (Current Attempt)
Try to install browsers during build and ensure they're available at runtime.

## Current Changes Made

1. **Updated `vercel.json`**: Added browser installation to installCommand
2. **Updated `package.json`**: Added postinstall script to install browsers
3. **Updated `base-crawler.ts`**: Added serverless-friendly Chromium args
4. **Increased timeout**: Set API route timeout to 300 seconds

## Next Steps

If this still doesn't work, we should:
1. Switch to Puppeteer (recommended)
2. Use an external browser service
3. Move crawler to a separate service (not serverless)

