# Vercel Environment Variables for Browserless.io

## Required Environment Variable

You should have added ONE of these to Vercel:

### Option 1: Full WebSocket Endpoint (Recommended)
**Variable Name:** `BROWSERLESS_WS_ENDPOINT`  
**Value:** `wss://chrome.browserless.io?token=2TVfDrddOcZPCvBcf5b0c02b15fc57bf016297120e0ee5b46`

### Option 2: Token Only
**Variable Name:** `BROWSERLESS_TOKEN`  
**Value:** `2TVfDrddOcZPCvBcf5b0c02b15fc57bf016297120e0ee5b46`

The code will automatically construct the endpoint from the token if you use Option 2.

## Verification

After adding the environment variable to Vercel:
1. Vercel will automatically redeploy with the new environment variable
2. Test the crawler at `/admin/crawl`
3. The crawler should now connect to Browserless.io successfully

## What Happens Next

When the crawler runs:
- It will detect the `BROWSERLESS_WS_ENDPOINT` or `BROWSERLESS_TOKEN` environment variable
- Connect to Browserless.io cloud browser
- Perform the crawl using the managed browser service
- No more local Chromium binary errors!

## Testing

Once Vercel redeploys:
1. Go to `/admin/crawl`
2. Enter a conference URL
3. Click "Start Crawl"
4. Should work without errors! 🎉

