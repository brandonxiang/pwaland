import { FastifyInstance } from 'fastify';
import { fail, success } from '../../utils';
import puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';

const isAWS = !!process.env.AWS_LAMBDA_FUNCTION_VERSION;


const getBrowser = async (): Promise<Browser | null> => {
  try {
    const browser = await puppeteer.launch();
    // if(isAWS) {
    //   browser = await puppeteer.launch({
    //     args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
    //     defaultViewport: chrome.defaultViewport,
    //     executablePath: await chrome.executablePath,
    //     headless: true,
    //     ignoreHTTPSErrors: true,
    //   });
    // } else {
    // }
     
    return browser;
  } catch (err) {
    console.error(err);
    return null;
  }
};


const checkPwa = async (inputLink: string) => {
    // Step 1: launch browser and open a new page.
    const browser = await getBrowser();
    if (!browser) {
      throw new Error('Browser could not be launched');
    }
    const page = await browser.newPage();
  
    try {
      // Step 2: Navigate to the URL and wait for page load
      await page.goto(inputLink, { waitUntil: 'networkidle0' });
  
      // Step 3: Wait for Service Worker registration and installation
      const serviceWorkerStatus = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) {
          return { registered: false, installed: false };
        }
  
        try {
          // Wait for service worker registration
          const registration = await navigator.serviceWorker.ready;
          
          // Check installation status
          const installedWorker = registration.active;
          
          return {
            registered: true,
            installed: !!installedWorker,
            state: installedWorker?.state
          };
        } catch (error) {
          return { 
            registered: false, 
            installed: false, 
            error: error.message 
          };
        }
      });

      // Step 4: Check for Web App Manifest
      const manifestLink = await page.evaluate(() => {
        const manifest = document.querySelector('link[rel="manifest"]');
        console.log(manifest, 'manifest');
        return manifest ? manifest.getAttribute('href') : null;
      });

      if (!manifestLink) {
        throw new Error('Web App Manifest not found');
      }
  
      // Step 5: Fetch and validate manifest
      const manifestUrl = new URL(manifestLink, inputLink).href;
      const manifestResponse = await fetch(manifestUrl);
      const manifestData = await manifestResponse.json();
  
      // Validate key PWA manifest properties
      if (!manifestData.name && !manifestData.short_name) {
        throw new Error('Manifest lacks required name properties');
      }
  
      if (!manifestData.icons || manifestData.icons.length === 0) {
        throw new Error('No icons defined in manifest');
      }
  
      // Step 6: Additional PWA checks
      const pwaChecks = await page.evaluate(() => ({
        offlineCapable: 'serviceWorker' in navigator,
        installable: window.matchMedia('(display-mode: standalone)').matches,
        responsive: window.innerWidth !== document.documentElement.clientWidth
      }));
  
      // Close browser to prevent resource leaks
      await browser.close();
  
      return {
        isPwa: serviceWorkerStatus.registered && serviceWorkerStatus.installed && manifestLink,
        serviceWorker: serviceWorkerStatus,
        manifest: manifestData,
        additionalChecks: pwaChecks
      };
    } catch (error) {
      // Ensure browser is closed even if an error occurs
      if (browser) await browser.close();
      throw error;
    }
};

export default (fastify: FastifyInstance, _: any, done: any) => {
  fastify.post<{
    Body: {
      url: string;
    };
  }>('/parse', { schema: {
    body: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string' }
      }
    }
  }},  async (req, res) => {

    let { url } = req.body;

    if(url) {
      url = 'https://' + url;
      const output = await checkPwa(url).catch((err) => {
        res.send(fail('This is not a PWA. ' + err.message));
      });
      if(output) {
      res.send(success(output));
      }
    } else {
      res.send(fail('url is required'));
    }
  });

  done();
};
