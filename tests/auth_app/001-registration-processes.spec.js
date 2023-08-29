import { test, expect} from '@playwright/test';
import { UserData } from '../../helpers/user_data.js';
import * as proxy from '../../attachment/proxy.json'
const { login, logout } = require('../../helpers/login_logout.js');
const {checkMail, clickLinkOnMail} = require('../../helpers/mail_process.js');

let context, page;
export const user = new UserData;

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

test('registration', async () => {
  await page.getByRole('link', { name: 'Sign up' }).first().click();

  await page.waitForLoadState('load');
  let mail = UserData.getNewMail()
  let password = UserData.getNewPassword()
  let nickname = UserData.getNewNickname()
  await page.locator('input[name="account\\[email\\]"]').fill(mail);
  await page.locator('input[name="account\\[login\\]"]').fill(nickname);
  await page.locator('input[name="account\\[password\\]"]').fill(password);
  await page.locator('input[name="account\\[password_confirmation\\]"]').fill(password);
  //await page.locator('input[name="account\\[referrer_code\\]"]').fill(UserData.refCode);
  let bounds = await page.getByText('I agree to ').boundingBox();
  await page.mouse.click(bounds.x, bounds.y);
  UserData.saveNewMail(mail)
  UserData.saveNewPassword(password)
  UserData.saveNewNickname(nickname)
  
  await page.getByRole('button', { name: 'Sign up' }).click();
  await checkMail(await context.newPage(), 'Confirm my account', UserData.mail, 0);
})

test('again receive confirmation instructions and confirm account', async () => {
  await page.getByRole('link', { name: 'Log in' }).click();

  await page.getByText('Didn\'t receive confirmation instructions?').click()
  await page.getByLabel(' Email').fill(UserData.mail)
  await page.getByRole('button', { name: 'Resend instructions' }).click();
  await expect(page.getByText('If your email address exists in our database, you will receive an email with instructions for how to confirm your email address in a few minutes.')).toHaveCount(1)

  let secondPage = await clickLinkOnMail(page, context, 'Confirm my account', UserData.mail);
  await expect(secondPage.getByText('Your email address has been successfully confirmed.')).toHaveCount(1)
  await expect(secondPage.getByText(UserData.nickname)).toHaveCount(2)
  await secondPage.close();
})

test('log out', async () => {
  await logout(page);
});

test('log in', async () => {
  await page.getByRole('link', { name: 'Log in' }).click();
  await login(page);
});

test('change password when UserData logged off', async () => {
  await logout(page);

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
