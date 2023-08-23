import { test, expect} from '@playwright/test';
import { UserData } from '../../helpers/user_data.js';
import * as proxy from '../../attachment/proxy.json'
const { login, logout } = require('../../helpers/login_logout.js');
const {checkMail, clickLinkOnMail} = require('../../helpers/mail_process.js');

let context, page;

test.beforeAll( async ({browser}) => {
  context = await browser.newContext();
  page = await context.newPage();
  await page.context().clearCookies();
  await page.context().addCookies(proxy.cookies);
});

test.beforeEach(async () => {
  await page.goto('.');
});

test.afterAll(async () => {
  page.close();
});

test('log in', async () => {
  await page.getByRole('link', { name: 'Log in' }).click();
  await login(page);
});

test('log out', async () => {
  await logout(page);
});

test('change password when user logged off', async () => {
  await page.getByRole('link', { name: 'Log in' }).click();

  await expect(page).toHaveURL(/\/accounts\/sign_in*/);
  await page.getByRole('link', { name: 'Forgot your password?' }).click();

  await page.getByLabel('Email').fill(UserData.mail);
  await page.getByRole('button', { name: 'Send me reset password instructions' }).click();
  await expect(page.getByText('If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.')).toHaveCount(1);

  let newPassword = UserData.getNewPassword();
  const secondPage = await clickLinkOnMail(page, context, 'Change my password', UserData.mail);;
  await expect(secondPage).toHaveURL(/\/accounts\/password\/edit*/)
  for ( const inputNewPassword of await secondPage.getByLabel('New Password').all())
    await inputNewPassword.fill(newPassword);
  await secondPage.getByText('Change my password').click();
  UserData.saveNewPassword(newPassword);

  await checkMail(page, 'Your password has been changed', UserData.mail, 0);

  await login(secondPage);
  await secondPage.close();
});
