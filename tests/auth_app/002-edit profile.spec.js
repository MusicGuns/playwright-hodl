import {test, expect } from '@playwright/test';
import { getNewPassword, getOldPassword, mail, nickname, saveNewPassword } from '../../helpers/get_user_credentials.js';
const loginHelper = require('../../helpers/login.js');
const smtpUrl = 'https://smtp.accounts.review-test-playw-8zvxau.exchange.hodlex-dev.com';

let oldPassword = getOldPassword();
let newPassword = getNewPassword();

test('edit profile', async ({ browser }) => {
  let context = await browser.newContext();
  let page = await context.newPage();
  await page.goto('.');
  await expect(page.getByText(nickname).nth(0)).toBeVisible();
  await page.getByRole('link').nth(7).click();
  await page.waitForLoadState('load');

  await expect(page).toHaveURL(/\/accounts\/\w+\/edit*/);
  await page.locator('div.website > input').fill('hhtestnet.com');
  await page.locator('div.selectBoxAndOptions').click();
  await page.locator('div.optionsContainer > div').filter( { hasText: '(UTC -12:00) International Date Line West'}).click();
  await page.locator('div.about > textarea').fill('something');
  await page.locator('#account_avatar').setInputFiles('./attachment/dYQc6hevsyI.jpg');
  await page.locator('div.password > div.field.text > input').fill(oldPassword)
  await page.getByRole('button', { name: /Save changes/ }).click();

  await expect(page).toHaveURL(new RegExp(/accounts\/\w+\/edit*/));
  await expect(page.locator('div.website > input')).toHaveValue('hhtestnet.com');
  await expect(page.locator('div.timezone > input')).toHaveValue('International Date Line West');
  await expect(page.locator('div.about > textarea')).toHaveValue('something');
  await expect(page.locator('div.avatarFields > div.removeAvatar').getByRole('img')).toBeVisible();
  await page.close();
});

test('change password when log in', async ({ browser }) => {
  let context = await browser.newContext();
  let firstPage = await context.newPage();
  await firstPage.goto('.')
  await expect(firstPage.getByText(nickname).nth(0)).toBeVisible();
  await firstPage.getByRole('link').nth(7).click();

  await firstPage.getByText('Change password').click();
  await expect(firstPage).toHaveURL(/\/accounts\/edit_password*/);
  for ( const inputNewPassword of await firstPage.getByLabel('New Password').all())
    await inputNewPassword.fill(newPassword);
  await firstPage.getByLabel('Current password').fill(oldPassword);
  await firstPage.getByText('Change my password').click();
  saveNewPassword(newPassword);

  const secondPage = await context.newPage();
  secondPage.goto(smtpUrl)
  await secondPage.locator('tr > td').getByText(mail).first().click();
  await expect(secondPage.frameLocator('.body').getByText('Your password has been changed')).toBeVisible();
  await secondPage.close();

  await loginHelper.login(firstPage);
  await firstPage.close();
});
