# Chromium Font Loading Error Troubleshooting

## Error

```
Failed to launch browser: The input directory "/vercel/path0/node_modules/@sparticuz/chromium/bin" does not exist. Please provide the location of the brotli files.
```

## Root Cause

The `@sparticuz/chromium` package is trying to load/decompress font files during initialization, but the directory containing the brotli-compressed fonts doesn't exist in the Vercel serverless environment.

## Possible Solutions

### Solution 1: Downgrade @sparticuz/chromium Version

Try using an older version that doesn't require font files:
```bash
npm install @sparticuz/chromium@127
```

### Solution 2: Use chrome-aws-lambda (Alternative)

Replace `@sparticuz/chromium` with `chrome-aws-lambda`:
```bash
npm uninstall @sparticuz/chromium
npm install chrome-aws-lambda
```

Then update the code to use `chrome-aws-lambda` instead.

### Solution 3: Set Environment Variable

Try setting an environment variable in Vercel to skip font loading:
- `CHROMIUM_SKIP_FONTS=true`
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false`

### Solution 4: Use Different Browser Solution

Consider using:
- Puppeteer with a remote browser service (Browserless.io)
- Playwright with a remote browser
- A separate service/container for crawling (not serverless)

### Solution 5: Check Package Installation

Ensure `@sparticuz/chromium` is properly installed in `node_modules`. The package might not be correctly bundled for Vercel.

## Current Status

We're using `@sparticuz/chromium@^141.0.0`. This version may have font loading requirements that aren't compatible with Vercel's serverless environment.

## Next Steps

1. Try downgrading to version 127 or earlier
2. If that doesn't work, switch to `chrome-aws-lambda`
3. If still failing, consider using a remote browser service or separate crawler service

