const { chromium } = require('playwright');
const axios = require('axios');

// Webhook to n8n
const WEBHOOK_URL = "https://ayman777adam.app.n8n.cloud/webhook/ce48f815-2bba-4a1c-8f51-f788e2fd1740";

(async () => {
  // Launch browser in stealth mode
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
    ],
  });

  // Spoof device fingerprint
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  // --- STEP 1: Go to login ---
  await page.goto("https://pms.nazeel.net/Pages/Login.aspx", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // Ensure page loaded
  await page.waitForSelector('input[name="txtUserName"]', { timeout: 60000 });

  // Fill login fields
  await page.fill('input[name="txtUserName"]', "ayman5252");
  await page.fill('input[name="txtPassword"]', "3765255");

  // Select the current year
  const year = new Date().getFullYear().toString();
  await page.selectOption('select[name="ddlYear"]', year);

  // Login
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }),
    page.click("#btnLogin")
  ]);

  // --- STEP 2: Select company ---
  await page.waitForSelector("#CompanyListTable", { timeout: 60000 });

  const targetCompany = "إليت للشقق المخدومة - الكورنيش";
  const companyRow = page.locator(`xpath=//tr[.//*[contains(text(), "${targetCompany}")]]//a`);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }),
    companyRow.first().click()
  ]);

  // --- STEP 3: Navigate to apartments dashboard ---
  await page.goto(
    "https://pms.nazeel.net/Pages/Management/ManageApartmentsInfo.aspx?tab=ChangeStatus",
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );

  await page.waitForSelector("#ContentPlaceHolder1_divMainContent", { timeout: 60000 });

  // --- STEP 4: Full page screenshot ---
  const screenshot = await page.screenshot({ fullPage: true });

  // --- STEP 5: Send screenshot to webhook ---
  await axios.post(
    WEBHOOK_URL,
    { image: screenshot.toString("base64") },
    { headers: { "Content-Type": "application/json" } }
  );

  console.log("Screenshot sent to n8n successfully.");

  await browser.close();
})();
