# Browserless.io Setup Guide

## Overview

We're switching from local Chromium to Browserless.io for better reliability in serverless environments like Vercel. Browserless.io provides a managed headless browser service that eliminates the complexity of running browsers in serverless functions.

## Why Browserless.io?

✅ **No browser installation needed** - Runs in the cloud
✅ **Works perfectly on Vercel** - No binary path issues
✅ **Fast and reliable** - No cold start delays for browsers
✅ **Better error handling** - Managed infrastructure
✅ **Scalable** - Handles concurrent requests

## Setup Instructions

### 1. Sign Up for Browserless.io

1. Go to https://www.browserless.io/
2. Sign up for a free account (includes 6 hours/month free)
3. Get your API token from the dashboard

### 2. Add Environment Variable

Add the Browserless.io API token to your Vercel environment variables:

**Variable Name:** `BROWSERLESS_WS_ENDPOINT`
**Value:** `wss://chrome.browserless.io?token=YOUR_API_TOKEN`

Or if you prefer separate variables:
- `BROWSERLESS_TOKEN` - Your API token
- The code will construct the endpoint automatically

### 3. Environment Variables

**Required:**
- `BROWSERLESS_WS_ENDPOINT` - Full WebSocket endpoint URL (e.g., `wss://chrome.browserless.io?token=xxx`)

**Optional (alternative):**
- `BROWSERLESS_TOKEN` - Just the token, code will build the URL

### 4. How It Works

The crawler automatically detects if `BROWSERLESS_WS_ENDPOINT` is set:
- **If set**: Connects to Browserless.io cloud browser
- **If not set**: Falls back to local Chromium (for local dev)

### 5. Pricing

- **Free tier**: 6 hours/month
- **Paid plans**: Start at $75/month for more hours
- **Pay-as-you-go**: Available for occasional use

For most use cases, the free tier is sufficient for testing and moderate usage.

## Local Development

For local development, you can either:
1. Use Browserless.io (set the environment variable)
2. Install Chrome locally and use the local browser fallback
3. Use regular Puppeteer for local dev

## Testing

After setting up the environment variable, test the crawler:
1. Go to `/admin/crawl`
2. Enter a conference URL
3. Click "Start Crawl"

The crawler should now work reliably on Vercel!

