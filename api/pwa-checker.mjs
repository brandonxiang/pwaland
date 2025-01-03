
import { get } from 'httpie';
import url from'url';

const timeout = 60;
/**
 * @type {*}
 */
let chrome;
let puppeteer;
const isAWS = !!process.env.AWS_LAMBDA_FUNCTION_VERSION;

if (isAWS) {
  // running on the Vercel platform.
  chrome = await import('chrome-aws-lambda');
  puppeteer = await import('puppeteer-core');
} else {
  // running locally.
  puppeteer = await import('puppeteer');
}


const getBrowser = async () => {
  try {
    let browser
    if(isAWS) {
      browser = await puppeteer.launch({
        args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
      });
    } else {
      browser = await puppeteer.launch();``
    }
     
    return browser;
  } catch (err) {
    console.error(err);
    return null;
  }
}


const checkPwa = async (inputLink) => {
  inputLink = 'https://' + inputLink;
  // Step 1: launch browser and open a new page.
  const browser = await getBrowser()
  const page = await browser.newPage()

  // Step 2: Go to a URL and wait for a service worker to register.

  await page.goto(inputLink)
  const swTarget = await browser.waitForTarget(target => target.type() === 'service_worker', { timeout })

  // Step 3: If a service worker is registered, print URL of SW file to the console 
  if(swTarget && swTarget._targetInfo['url']) {
    const manifest = await page.$('[rel="manifest"]');
    const manifestUrl = await manifest.evaluate(node => node.href);

    const { data } = await get(manifestUrl);

    let icon = '';

    if(!data.name) throw new Error('Name is not existed in the manifest');

    if(!data.icons || !data.icons.length) throw new Error('Icons are not existed in the manifest');

    if(!data.icons[0].src) throw new Error('The Icon is not existed in the manifest');
    
    icon = data.icons[0].src;
    const reHttps = /(http|https):\/\/([\w.]+\/?)\S*/;
    if(!reHttps.test(icon)){
      icon = url.resolve(inputLink, icon);
    } 
    // Step 4: Done. Close.
    await browser.close();

    return {
      title: data.name,
      short_name: data.short_name,
      description: data.description,
      link: inputLink,
      icon: icon
    } 
  } else {
    await browser.close()
    throw new Error('This is not a PWA');
  }
}

export default function handler(req, res) {
  console.log(req.query);
  const { url } = req.query;
  console.log('url',url);
  if(url) {
    checkPwa(url)
    .then((output) => {
      res.status(200).json(output);
    })
    .catch((err) => {
      res.status(500).json({
        message: 'This is not a PWA',
        "error-message": err.message
      });
    })
  } else {
    res.status(500).json({
      message: 'url is required'
    });
  }
}