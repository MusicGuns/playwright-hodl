import { expect } from '@playwright/test';
import { UserData } from './user_data.js';


export async function login(page, backup = false) {
  await expect(page).toHaveURL(/\/accounts\/sign_in*/);
  
  let mail = UserData.getOldMail();
  let password = UserData.getOldPassword();
  await page.getByLabel('Email').fill(mail);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Log in' }).click();
  if (await page.$('label[for="otp_code"]')){
    await page.locator('input[name="account[otp_code]"]').fill(backup ? UserData.getBackup() : UserData.genOtpToken());
    await page.getByRole('button', {name: 'Confirm'}).click();
  }

  await page.waitForLoadState("load");
  await expect(page.getByText(UserData.getNickname()).nth(0)).toHaveCount(1);

  await page.context().storageState({ path: "attachment/auth.json" });
  return await page;
}

export async function logout(page) {
  await expect(page).toHaveURL(/\/\?filters%5Bcurrency_code%*/);
  await expect(page.getByText(UserData.getNickname())).toHaveCount(1);
  await page.getByText(UserData.getNickname()).click();
  await page.getByRole('link', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/accounts\/sign_in*/);
  return await page;
};
