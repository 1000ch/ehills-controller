import process from 'node:process';
import puppeteer from 'puppeteer';
import type {Page, WaitForOptions} from 'puppeteer';

type VisitorRegistrationInput = {
  visitorName: string;
  visitorCompany: string;
  visitorCount: string;
  visitDatetime: Date;
  registerDivision: string;
  registerName: string;
};

export async function registerVisitor(input: VisitorRegistrationInput): Promise<string | undefined> {
  const waitUntilLoadCompletion: WaitForOptions = {
    waitUntil: ['load', 'networkidle2'],
  };

  const extraHttpHeaders: Record<string, string> = {
    'Accept-Language': 'ja-JP',
  };

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--lang=ja'],
  });

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(extraHttpHeaders);

    // Go to the login page, input id/pw and submit to login
    await page.goto('https://www.ehills.co.jp/sso/dfw/EHILLS/login/index.php', waitUntilLoadCompletion);
    await page.type('input[name=PLAIN_ACCOUNTUID]', process.env.EHILLS_ID!);
    await page.type('input[name=PASSWORD]', process.env.EHILLS_PASSWORD!);

    await Promise.all([
      // Wait until the link of the page appeared after login
      page.waitForSelector('.container li a'),
      // Submit login form
      page.click('button[type=submit]'),
    ]);

    const [newPage] = await Promise.all([
      // Wait until the page opened after clicking visitor registration
      new Promise<Page>(resolve => {
        page.on('popup', resolve);
      }),
      // Click menu to open popup of visitor registration
      page.click('.container li a'),
    ]);

    // Wait until the link of the page opened
    await newPage.waitForSelector('a');
    await newPage.setExtraHTTPHeaders(extraHttpHeaders);

    await Promise.all([
      // Wait until the form of visitor registration displayed
      newPage.waitForNavigation(waitUntilLoadCompletion),
      // Click menu to go to the form of visitor registration
      newPage.click('a'),
    ]);

    // Input visitor information
    await newPage.type('input[name=kigyou]', input.visitorCompany);
    await newPage.type('input[name=daihyou]', input.visitorName);
    await newPage.type('input[name=ninzu]', input.visitorCount);

    // When visitor comes
    await newPage.select('select[name=year1]', `${input.visitDatetime.getFullYear()}`);
    await newPage.select('select[name=month1]', `${input.visitDatetime.getMonth() + 1}`);
    await newPage.select('select[name=day1]', `${input.visitDatetime.getDate()}`);
    await newPage.select('select[name=hour1]', `${input.visitDatetime.getHours()}`);
    await newPage.select('select[name=min1]', `${input.visitDatetime.getMinutes()}`);

    // Who/where visitor visits
    await newPage.$eval('input[name=hname]', element => {
      element.value = '';
    });
    await newPage.type('input[name=hname]', input.registerName);
    await newPage.$eval('input[name=hbusho]', element => {
      element.value = '';
    });
    await newPage.type('input[name=hbusho]', input.registerDivision);
    await newPage.$eval('input[name=htelephone]', element => {
      element.value = '';
    });
    await newPage.type('input[name=htelephone]', '03-6427-2862');
    await newPage.$eval('input[name=iname]', element => {
      element.value = '';
    });
    await newPage.type('input[name=iname]', input.registerName);
    await newPage.$eval('input[name=ibusho]', element => {
      element.value = '';
    });
    await newPage.type('input[name=ibusho]', input.registerDivision);
    await newPage.$eval('input[name=itelephone]', element => {
      element.value = '';
    });
    await newPage.type('input[name=itelephone]', '03-6427-2862');

    await Promise.all([
      // Wait until the confirmation page of inputted visitor registration displayed
      newPage.waitForNavigation(waitUntilLoadCompletion),
      // Go to the confirmation page of inputted visitor registration
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      await newPage.click('img[name=btn17]'),
    ]);

    await Promise.all([
      // Wait until the page displayed after the form submittion
      newPage.waitForNavigation(waitUntilLoadCompletion),
      // Submit the form data of visitor registration
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      await newPage.click('img[name=btn08]'),
    ]);

    await newPage.waitForSelector('.reservenumber');
    const p = await newPage.$('.reservenumber');
    const text = await newPage.evaluate(element => element?.textContent, p);

    return text === null ? undefined : text;
  } finally {
    await browser.close();
  }
}
