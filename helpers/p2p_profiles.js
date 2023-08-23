import { expect } from '@playwright/test';
import { UserData } from './user_data.js';

export async function moderate(page, platform, decision) {
  await page.locator('table > tbody > tr > td > table > tbody > tr')
                 .filter({hasText : `${platform}:\n${UserData.nickname}`})
                 .getByRole('button', { name: decision}).click()
}

export async function checkDisplay(page, platform) {
  await expect(page.locator(`b.${platform}Value`).locator(`//a[text()="${UserData.nickname}"]`)).toHaveCount(1)
}