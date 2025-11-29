/**
 * Base Crawler Class
 * 
 * Provides common functionality for web crawlers with ethical settings,
 * robots.txt checking, and proper error handling.
 * 
 * Uses Puppeteer Core with @sparticuz/chromium for serverless compatibility on Vercel.
 */

import puppeteer, { Browser, Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import robotsParser from 'robots-parser';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

export interface CrawlOptions {
  timeout?: number;
  waitFor?: number;
  userAgent?: string;
  headers?: Record<string, string>;
  respectRobotsTxt?: boolean;
}

export interface CrawlResult {
  url: string;
  html: string;
  statusCode: number;
  error?: string;
  timestamp: Date;
}

export interface RobotsCheckResult {
  allowed: boolean;
  reason?: string;
}

export abstract class BaseCrawler {
  protected browser: Browser | null = null;
  protected defaultUserAgent: string;
  protected defaultTimeout: number = 30000; // 30 seconds
  protected defaultWaitFor: number = 2000; // 2 seconds after page load

  constructor() {
    // Use a realistic user agent string
    this.defaultUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Initialize the browser instance with ethical settings
   * Configured for serverless environments (like Vercel)
   * Uses @sparticuz/chromium which provides a pre-built Chrome binary for serverless
   */
  protected async initBrowser(): Promise<void> {
    if (this.browser) {
      return; // Already initialized
    }

    try {
      // Check if we're in a serverless environment (Vercel, AWS Lambda, etc.)
      const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
      
      // Configure Chromium for serverless environments
      if (isServerless) {
        // Use @sparticuz/chromium for serverless (optimized for Vercel/Lambda)
        this.browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        });
      } else {
        // Local development - try to use system Chrome
        // Note: For local development, you may need to install regular 'puppeteer' 
        // or have Chrome installed in a standard location
        
        // Try common Chrome/Chromium paths
        const possiblePaths = [
          process.env.PUPPETEER_EXECUTABLE_PATH,
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
          '/usr/bin/google-chrome', // Linux
          '/usr/bin/chromium-browser', // Linux
          '/usr/bin/chromium', // Linux
        ].filter(Boolean) as string[];
        
        let executablePath: string | undefined;
        for (const chromePath of possiblePaths) {
          if (chromePath && fs.existsSync(chromePath)) {
            executablePath = chromePath;
            break;
          }
        }
        
        this.browser = await puppeteer.launch({
          headless: true,
          executablePath,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--single-process',
            '--disable-software-rasterizer',
            '--disable-features=IsolateOrigins,site-per-process',
          ],
        });
      }
    } catch (error: any) {
      throw new Error(
        `Failed to launch browser: ${error.message}\n` +
        `Ensure @sparticuz/chromium is installed for serverless environments.`
      );
    }
  }

  /**
   * Close the browser instance
   */
  protected async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Check robots.txt to see if crawling is allowed
   */
  protected async checkRobotsTxt(url: string, userAgent?: string): Promise<RobotsCheckResult> {
    try {
      const parsedUrl = new URL(url);
      const robotsUrl = `${parsedUrl.origin}/robots.txt`;
      const ua = userAgent || this.defaultUserAgent;

      // Fetch robots.txt
      const response = await fetch(robotsUrl, {
        headers: {
          'User-Agent': ua,
        },
      });

      if (!response.ok) {
        // If robots.txt doesn't exist or is inaccessible, assume crawling is allowed
        return { allowed: true, reason: 'robots.txt not found or inaccessible' };
      }

      const robotsText = await response.text();
      const robots = robotsParser(robotsUrl, robotsText);

      // Check if the URL path is allowed
      const allowed = robots.isAllowed(url, ua);
      
      if (!allowed) {
        return {
          allowed: false,
          reason: 'Blocked by robots.txt',
        };
      }

      // Check crawl delay
      const crawlDelay = robots.getCrawlDelay(ua);
      if (crawlDelay && crawlDelay > 0) {
        // Note: We return allowed=true but log the delay for the caller to respect
        return {
          allowed: true,
          reason: `Allowed with crawl delay of ${crawlDelay}s`,
        };
      }

      return { allowed: true };
    } catch (error: any) {
      // If robots.txt check fails, assume allowed but log the error
      console.warn(`Failed to check robots.txt for ${url}:`, error.message);
      return {
        allowed: true,
        reason: `robots.txt check failed: ${error.message}`,
      };
    }
  }

  /**
   * Fetch a URL and return the HTML content
   */
  protected async fetchPage(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
    await this.initBrowser();

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const {
      timeout = this.defaultTimeout,
      waitFor = this.defaultWaitFor,
      respectRobotsTxt = true,
      headers = {},
      userAgent = this.defaultUserAgent,
    } = options;

    try {
      // Check robots.txt if required
      if (respectRobotsTxt) {
        const robotsCheck = await this.checkRobotsTxt(url, userAgent);
        if (!robotsCheck.allowed) {
          return {
            url,
            html: '',
            statusCode: 403,
            error: robotsCheck.reason || 'Blocked by robots.txt',
            timestamp: new Date(),
          };
        }

        // Respect crawl delay if specified
        if (robotsCheck.reason?.includes('crawl delay')) {
          const delayMatch = robotsCheck.reason.match(/(\d+)s/);
          if (delayMatch) {
            const delaySeconds = parseInt(delayMatch[1], 10);
            console.log(`Respecting crawl delay of ${delaySeconds}s for ${url}`);
            await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
          }
        }
      }

      // Create a new page
      const page = await this.browser.newPage();

      try {
        // Set user agent
        await page.setUserAgent(userAgent);

        // Set viewport
        await page.setViewport({ width: 1920, height: 1080 });

        // Set additional headers if provided (default + custom)
        const defaultHeaders = {
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        };
        
        await page.setExtraHTTPHeaders({
          ...defaultHeaders,
          ...headers,
        });

        // Navigate to the URL with timeout
        const response = await page.goto(url, {
          waitUntil: 'networkidle2', // Puppeteer uses 'networkidle2' instead of 'networkidle'
          timeout,
        });

        if (!response) {
          throw new Error('No response from page');
        }

        const statusCode = response.status(); // In Puppeteer, status() is a method

        // Wait for additional time to ensure page is fully loaded
        // Note: waitForTimeout was removed in newer Puppeteer versions, use Promise-based delay instead
        if (waitFor > 0) {
          await new Promise(resolve => setTimeout(resolve, waitFor));
        }

        // Get the HTML content
        const html = await page.content();

        return {
          url,
          html,
          statusCode,
          timestamp: new Date(),
        };
      } finally {
        // Always close the page
        await page.close();
      }
    } catch (error: any) {
      return {
        url,
        html: '',
        statusCode: 0,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    await this.closeBrowser();
  }

  /**
   * Abstract method that subclasses must implement
   */
  abstract crawl(url: string, options?: CrawlOptions): Promise<any>;
}

