import { expect } from '@playwright/test';
import { nickname, mail, getOldPassword } from './get_user_credentials.js';

export async function login(page) {
  await expect(page).toHaveURL(/\/accounts\/sign_in*/);

  let password = getOldPassword();
  await page.getByLabel('Email').fill(mail);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL(/\/*/);

  await page.waitForLoadState("load");
  await expect(page.getByText(nickname).nth(0)).toBeVisible();

  await page.context().storageState({ path: "attachment/auth.json" });
  return await page;
}
