import { expect } from '@playwright/test';

const smtpUrl = 'https://smtp.accounts.staging-testnet.hodlex-dev.com';

export async function checkMail(page, text, mail, indexMessage) {
  await page.goto(smtpUrl);
  await page.locator('tr > td').getByText(mail).nth(indexMessage).click();
  await expect(page.frameLocator('.body').getByText(text)).toHaveCount(1);
  await page.close();
};

export async function clickLinkOnMail(page, context, text, mail) {
  await page.goto(smtpUrl);
  await page.waitForLoadState();
  const pagePromise = context.waitForEvent('page');
  await page.locator('tr > td').getByText(mail).first().click();
  await new Promise(r => setTimeout(r, 2000));
  await page.frameLocator('.body').getByRole('link', { name: text }).click();
  const secondPage = await pagePromise;
  return secondPage
}