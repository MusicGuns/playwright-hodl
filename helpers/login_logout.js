import { expect, test } from '@playwright/test';
import { UserData } from './user_data.js';
import { AdminData } from './admin_data.js';


export async function login(page, backup = false, admin = false) {
  await expect(page).toHaveURL(/\/accounts\/sign_in*/);
  
  await page.getByLabel('Email').fill(admin ? AdminData.mail : UserData.mail);
  await page.getByLabel('Password').fill(admin ? AdminData.password : UserData.password);

  await page.getByRole('button', { name: 'Log in' }).click();
  if (await page.$('label[for="otp_code"]')){
    await page.locator('input[name="account[otp_code]"]').fill(backup ? UserData.backup : UserData.genOtpToken());
    await page.getByRole('button', {name: 'Confirm'}).click();
  }

  await page.waitForLoadState("load");
  await expect(page.getByText(admin ? 'admin' : UserData.nickname).nth(0)).toHaveCount(1);

  await page.context().storageState(admin ? { path: "attachment/authAdmin.json" } : { path: "attachment/auth.json" });
}

export async function login_with_failure(page,  mail, password) {
  await expect(page).toHaveURL(/\/accounts\/sign_in*/);
  
  await page.getByLabel('Email').fill(mail);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Log in' }).click();
  expect(await page.getByText('Unconfirmed account or invalid email, 2fa or password.'))
}

export async function logout(page) {
  await expect(page).toHaveURL(/\/\?filters%5Bcurrency_code%*/);
  await expect(page.getByText(UserData.nickname)).toHaveCount(1);
  await page.getByText(UserData.nickname).click();
  await page.getByRole('link', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/accounts\/sign_in*/);
  return await page;
};
