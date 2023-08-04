import { test, expect} from '@playwright/test';
import { nickname, mail, getNewPassword, saveNewPassword } from '../../helpers/get_user_credentials.js';
import * as proxy from '../../attachment/proxy.json'
const loginHelper = require('../../helpers/login.js');

let newPassword = getNewPassword();
const smtpUrl = 'https://smtp.accounts.review-test-playw-8zvxau.exchange.hodlex-dev.com';

test('log in', async ({page}) => {
  await page.context().clearCookies();
  await page.context().addCookies(proxy.cookies);
  
  await page.goto('.')
  await page.getByRole('link', { name: 'Log in' }).click();

  await loginHelper.login(page);
  await page.close();
});

test('log out', async ({ page }) => {
  await page.goto('.');
  await expect(page.getByText(nickname).nth(0)).toBeVisible();
  await page.getByText(nickname).click();
  await page.getByRole('link', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/accounts\/sign_in*/);
  await page.close()
});

test('change password when user logged off', async ({ browser }) => {
  let context = await browser.newContext();
  let firstPage = await context.newPage();
  await firstPage.goto('.');
  await firstPage.getByRole('link', { name: 'Log in' }).click();

  await expect(firstPage).toHaveURL(/\/accounts\/sign_in*/);
  await firstPage.getByRole('link', { name: 'Forgot your password?' }).click();

  await firstPage.getByLabel('Email').fill(mail);
  await firstPage.getByRole('button', { name: 'Send me reset password instructions' }).click();
  await expect(firstPage.getByText('If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.')).toBeVisible();

  await firstPage.goto(smtpUrl);
  await firstPage.locator('tr > td').getByText(mail).first().click();
  const pagePromise = context.waitForEvent('page');
  await firstPage.frameLocator('.body').getByRole('link', { name: 'Change my password'}).click();

  const secondPage = await pagePromise;
  await expect(secondPage).toHaveURL(/\/accounts\/password\/edit*/)
  for ( const inputNewPassword of await secondPage.getByLabel('New Password').all())
    await inputNewPassword.fill(newPassword);
  await secondPage.getByText('Change my password').click();
  saveNewPassword(newPassword);

  await firstPage.locator('tr > td').getByText(mail).first().click();
  await expect(firstPage.frameLocator('.body').getByText('Your password has been changed')).toBeVisible();
  await firstPage.close();

  await loginHelper.login(secondPage);
  await secondPage.close();
});

