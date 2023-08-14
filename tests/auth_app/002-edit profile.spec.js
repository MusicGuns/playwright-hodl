import {test, expect } from '@playwright/test';
import { UserData } from '../../helpers/user_data.js';
const { login, logout } = require('../../helpers/login_logout.js');
const {checkMail, clickLinkOnMail} = require('../../helpers/mail_process.js');

let context;
let page;

test.beforeAll( async ({browser}) => {
  context = await browser.newContext();
  page = await context.newPage();
});

test.afterAll(async () => {
  page.close();
});

test.beforeEach(async () => {
  await page.goto('.');
});

test('edit profile', async () => {
  await expect(page.getByText(UserData.getNickname())).toHaveCount(1);
  await page.locator('a[href="/edit_account"]').click();
  await page.waitForLoadState('load');

  await expect(page).toHaveURL(/\/accounts\/\w+\/edit*/);
  await page.locator('div.website > input').fill('hhtestnet.com');
  await page.locator('div.selectBoxAndOptions').click();
  await page.locator('div.optionsContainer > div').filter( { hasText: '(UTC -12:00) International Date Line West'}).click();
  await page.locator('div.about > textarea').fill('something');
  await page.locator('#account_avatar').setInputFiles('./attachment/dYQc6hevsyI.jpg');
  await page.locator('div.password > div.field.text > input').fill(UserData.getOldPassword())
  await page.getByRole('button', { name: /Save changes/ }).click();

  await expect(page).toHaveURL(new RegExp(/accounts\/\w+\/edit*/));
  await expect(page.locator('div.website > input')).toHaveValue('hhtestnet.com');
  await expect(page.locator('div.timezone > input')).toHaveValue('International Date Line West');
  await expect(page.locator('div.about > textarea')).toHaveValue('something');
  await expect(page.locator('div.avatarWrapper').getByRole('img')).toHaveCount(2);
});

test('edit mail', async () => {
  await expect(page.getByText(UserData.getNickname())).toHaveCount(1);
  await page.locator('a[href="/edit_account"]').click();
  await page.waitForLoadState('load');

  let newMail = UserData.getNewMail();
  await page.getByText('link', { exact: true } ).click();
  await page.locator('input[type="password"]').first().fill(UserData.getOldPassword());
  await page.locator('input[type="email"]').first().fill(newMail);
  await page.getByText('Submit').first().click();
  await expect(page.getByText('Changes saved. Please follow the link sent to your current email address to confirm the changes.')).toHaveCount(1);
  await page.reload();
  await expect(page.getByText(`New address ${newMail} needs confirmation, check your email`)).toHaveCount(1);

  let secondPage = await clickLinkOnMail(page, context, 'link', UserData.getOldMail());
  await secondPage.close();

  secondPage = await clickLinkOnMail(page, context, 'link', newMail);
  await expect(secondPage.getByText('The email address has been updated.')).toHaveCount(1);
  UserData.saveNewMail(newMail);

  secondPage.close();
});

test('change password when log in', async () => {
  await expect(page.getByText(UserData.getNickname())).toHaveCount(1);
  await page.getByRole('link').nth(7).click();

  let newPassword = UserData.getNewPassword();
  await page.getByText('Change password').click();
  await expect(page).toHaveURL(/\/accounts\/edit_password*/);
  for ( const inputNewPassword of await page.getByLabel('New Password').all())
    await inputNewPassword.fill(newPassword);
  await page.getByLabel('Current password').fill(UserData.getOldPassword());
  await page.getByText('Change my password').click();
  UserData.saveNewPassword(newPassword);

  await checkMail(await context.newPage(), 'Your password has been changed', UserData.getOldMail());

  await login(page);
});

test('set 2fa', async () => {
  test.setTimeout(900000)
  await page.locator('a[href="/edit_account"]').click();
  await page.getByRole('link', { name: 'Two factor authentication' }).click();
  await page.getByRole('textbox').fill(UserData.getOldPassword());
  await page.getByRole('button', { name: 'Generate 2fa code' }).click();
  let backup = await page.locator('div.codes > code').first().innerText();
  //await page.locator('.qrCodeTable').screenshot({ path: 'attachment/screenshot.png' });
  await page.getByText('enter this code manually.').click();
  let secret = await page.locator('p.secret').nth(1).innerText();
  //await checkQrCode(secret, 'attachment/screenshot.png') ? null : test.fail();
  UserData.saveSecretKey2Fa(secret, backup);
  let token = UserData.genOtpToken();

  await page.locator('input[name="account[otp]"]').fill(token);
  await page.locator('.modalDialog > .close').first().click();
  await page.getByText('Enable 2-factor auth').click();
  await expect(page.getByText('Two-factor authentication is currently enabled for your account. In order to disable it, you\'ll need to enter your current 2fa one time password.')).toHaveCount(1);
  
  await checkMail(await context.newPage(), 'Your 2fa security settings have been enabled', UserData.getOldMail());
});

test('login with 2fa', async () => {
  test.setTimeout(900000)
  await logout(page);

  await page.getByRole('link', { name: 'Log in' }).click();
  await new Promise(r => setTimeout(r, 60000));
  await login(page);
});

test('login with backup code', async () => {
  await logout(page);
  await page.getByRole('link', { name: 'Log in' }).click();
  await login(page, true);
});

test('disable 2fa', async () => {
  test.setTimeout(900000)
  await page.locator('a[href="/edit_account"]').click();
  await page.getByRole('link', { name: 'Two factor authentication' }).click();
  await new Promise(r => setTimeout(r, 60000));

  let token = UserData.genOtpToken();
  await page.locator('input[name="account[otp]"]').fill(token);
  await page.getByText('Disable 2-factor auth').click();
  await expect(page.getByText('Two-factor authentication is currently disabled for your account. You will need to enable it first by entering your password.')).toHaveCount(1);

  await checkMail(await context.newPage(), 'Your 2fa security settings have been disabled', UserData.getOldMail());
})

test('change settings notification', async () => {
  await page.locator('a[href="/edit_account"]').click();
  await page.getByRole('link', { name: 'Notification' }).click();
  for ( const checkBox of await page.locator('input[type="checkbox"]').all()){
    await checkBox.uncheck();
  }
  for ( const radioBox of await page.locator('.radiobuttonsWrapper').getByText('Off').all()){
    await radioBox.check();
  }
  page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText('Notification preferences updated successfully.')).toHaveCount(1)
  for ( const checkBox of await page.locator('input[type="checkbox"]').all()){
    expect(await checkBox.isChecked()).toBeFalsy()
  }
  for ( const radioBox of await page.locator('.radiobuttonsWrapper').getByText('Off').all()){
    await expect(radioBox).toBeChecked();
  }
});