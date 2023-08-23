import {test, expect } from '@playwright/test';
import { UserData } from '../../helpers/user_data.js';
const { login, logout, login_with_failure } = require('../../helpers/login_logout.js');
const {checkMail, clickLinkOnMail} = require('../../helpers/mail_process.js');
import * as proxy from '../../attachment/proxy.json'
import * as authAdmin from '../../attachment/authAdmin.json'
import { sleep, upFirstLetter } from '../../helpers/default_helpers.js';
import { AdminData } from '../../helpers/admin_data.js';

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

test.describe('edit main information', () => {
  let oldMail = UserData.mail

  test('edit profile', async () => {
    await expect(page.getByText(UserData.nickname)).toHaveCount(1);
    await page.locator('a[href="/edit_account"]').click();
    await page.waitForLoadState('load');
  
    await expect(page).toHaveURL(/\/accounts\/\w+\/edit*/);
    await page.locator('div.website > input').fill('hhtestnet.com');
    await page.locator('div.selectBoxAndOptions').click();
    await page.locator('div.optionsContainer > div').filter( { hasText: '(UTC -12:00) International Date Line West'}).click();
    await page.locator('div.about > textarea').fill('something');
    await page.locator('#account_avatar').setInputFiles('./attachment/dYQc6hevsyI.jpg');
    await page.locator('div.password > div.field.text > input').fill(UserData.password)
    await page.getByRole('button', { name: /Save changes/ }).click();
  
    await expect(page.getByText('Your account has been updated successfully.')).toHaveCount(1)
    await expect(page).toHaveURL(new RegExp(/accounts\/\w+\/edit*/));
    await expect(page.locator('div.website > input')).toHaveValue('hhtestnet.com');
    await expect(page.locator('div.timezone > input')).toHaveValue('International Date Line West');
    await expect(page.locator('div.about > textarea')).toHaveValue('something');
    await expect(page.locator('div.avatarWrapper').getByRole('img')).toHaveCount(2);

    await page.goto('.')
    await page.getByText(UserData.nickname).click()
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page.getByText('Website: hhtestnet.com')).toHaveCount(1)
    await expect(page.getByText('Description:\nsomething')).toHaveCount(1)
  });
  
  test('edit mail', async () => {
    await expect(page.getByText(UserData.nickname)).toHaveCount(1);
    await page.locator('a[href="/edit_account"]').click();
    await page.waitForLoadState('load');
  
    let newMail = UserData.getNewMail();
    await page.getByText('link', { exact: true } ).click();
    await page.locator('input[type="password"]').first().fill(UserData.password);
    await page.locator('input[type="email"]').first().fill(newMail);
    await page.getByText('Submit').first().click();
    await expect(page.getByText('Changes saved. Please follow the link sent to your current email address to confirm the changes.')).toHaveCount(1);
    await page.reload();
    await expect(page.getByText(`New address ${newMail} needs confirmation, check your email`)).toHaveCount(1);
  
    let secondPage = await clickLinkOnMail(page, context, 'link', UserData.mail);
    await expect(secondPage.getByText('Change has been confirmed. Please go to your new email address to activate the account.')).toHaveCount(1);

    await secondPage.close();
  
    secondPage = await clickLinkOnMail(page, context, 'link', newMail);
    await expect(secondPage.getByText('The email address has been updated.')).toHaveCount(1);
    UserData.saveNewMail(newMail);
  
    secondPage.close();
  });

  test('check log in with old and new mails', async () => {
    await logout(page)
    await login_with_failure(page, oldMail, UserData.password)
    await login(page)
  })
})

test.describe('change password', () => {
  let oldPassword = UserData.password;

  test('change password when log in', async () => {
    await expect(page.getByText(UserData.nickname)).toHaveCount(1);
    await page.getByRole('link').nth(7).click();
  
    let newPassword = UserData.getNewPassword();
    await page.getByText('Change password').click();
    await expect(page).toHaveURL(/\/accounts\/edit_password*/);
    for ( const inputNewPassword of await page.getByLabel('New Password').all())
      await inputNewPassword.fill(newPassword);
    await page.getByLabel('Current password').fill(UserData.password);
    await page.getByText('Change my password').click();
    await expect(page.getByText('Password has been successfully updated!')).toHaveCount(1);
    UserData.saveNewPassword(newPassword);
  
    await checkMail(await context.newPage(), 'Your password has been changed', UserData.mail, 0);
  });

  test('check log in with old and new passwords', async () => {
    await page.getByRole('link', { name: 'Log in' }).click();
    await login_with_failure(page, UserData.mail, oldPassword)
    await login(page)
  })
})

test.describe('2fa process', () => {

  test('set 2fa', async () => {
    await page.locator('a[href="/edit_account"]').click();
    await page.getByRole('link', { name: 'Two factor authentication' }).click();
    await page.waitForLoadState('load');
    await page.getByRole('textbox').fill(UserData.password);
    await page.getByRole('button', { name: 'Generate 2fa code' }).click();

    await expect(page.getByText('Two factor authentication codes were successfull generated! One more step: you\'ll need to enable it now.')).toHaveCount(1);
    await page.waitForLoadState('load');
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
    await expect(page.getByText('Two factor authentication for your account has been enabled.')).toHaveCount(1);
    await expect(page.getByText('Two-factor authentication is currently enabled for your account. In order to disable it, you\'ll need to enter your current 2fa one time password.')).toHaveCount(1);
    await checkMail(await context.newPage(), 'Your 2fa security settings have been enabled', UserData.mail, 0);
  });
  
  test('login with 2fa', async () => {
    test.setTimeout(600000)
    await logout(page);
  
    await page.getByRole('link', { name: 'Log in' }).click();
    await sleep(30000)
    await login(page);
  });
  
  test('login with backup code', async () => {
    await logout(page);
    await page.getByRole('link', { name: 'Log in' }).click();
    await login(page, true);
  });
  
  test('disable 2fa', async () => {
    test.setTimeout(600000)
    await page.locator('a[href="/edit_account"]').click();
    await page.getByRole('link', { name: 'Two factor authentication' }).click();
    await sleep(30000)
  
    let token = UserData.genOtpToken();
    await page.locator('input[name="account[otp]"]').fill(token);
    await page.getByText('Disable 2-factor auth').click();
    await expect(page.getByText('Two factor authentication for your account has been disabled.')).toHaveCount(1);
    await expect(page.getByText('Two-factor authentication is currently disabled for your account. You will need to enable it first by entering your password.')).toHaveCount(1);
    await checkMail(await context.newPage(), 'Your 2fa security settings have been disabled', UserData.mail, 0);
  })
})

test.describe('notification', () => {
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
})

test.describe('API', () => {
  const {checkApi} = require('../../helpers/api_process.js');
  
  test('enable API access', async () => {
    test.setTimeout(600000)
    await page.locator('a[href="/edit_account"]').click();
    await page.getByRole('link', { name: 'API access' }).click();
    await page.locator('input[type="password"]').nth(1).fill(UserData.password);
    await page.getByRole('button', {name: 'Enable API access'}).click();
    let apiKey = await page.locator('#APIKeyInput').innerText();
    UserData.saveApiKey(apiKey);
    await sleep(10000)
  });
  
  test('check API access', async ({request}) => {
    await checkApi(request);
  })
  
  test('change API key', async ({request}) => {
    await page.locator('a[href="/edit_account"]').click();
    await page.getByRole('link', { name: 'API access' }).click();
    let oldApiKey = await page.locator('#APIKeyInput').innerText();
    let oldSigKey = await page.locator('#APISignatureKeyInput').innerText();
    await page.locator('input[type="password"]').nth(1).fill(UserData.password);
    await page.getByRole('button', {name: 'Change API key'}).click();
    
    let apiKey = await page.locator('#APIKeyInput').innerText()
    expect(apiKey != oldApiKey).toBeTruthy();
    expect(await page.locator('#APISignatureKeyInput').innerText() != oldSigKey).toBeTruthy();
    await sleep(10000)
    await checkApi(request, true)
    UserData.saveApiKey(apiKey);
    
    await checkApi(request);
  });
  
  test('disable API access', async () => {
    await page.locator('a[href="/edit_account"]').click();
    await page.getByRole('link', { name: 'API access' }).click();
    await page.locator('input[type="password"]').nth(1).fill(UserData.password);
    await page.getByRole('button', {name: 'Disable API access'}).click();
  
    await expect(page.getByText('API access is currently disabled, insert your password below in order to enable the access.')).toHaveCount(1)
  });
})

test.describe('P2P profiles', () => {
  const { moderate, checkDisplay} = require('../../helpers/p2p_profiles.js');
  let adminContext;
  let adminPage;
  let adminNickname = AdminData.nickname
  let adminMail = AdminData.mail

  let platforms = ['agoradesk', 'localmonero','paxful', 'localbitcoins']

  test.beforeAll( async ({browser}) => {
    adminContext = await browser.newContext();
    adminPage = await adminContext.newPage();
    await adminPage.context().clearCookies();
    await adminPage.context().addCookies(proxy.cookies);

    await adminPage.goto('.');
    await adminPage.getByRole('link', { name: 'Log in' }).click();
    await login(adminPage, false, true);
  });

  test.beforeEach(async () => {
    await adminPage.goto('.');
    await page.goto('.');
  });

  test.afterAll(async () => {
    adminPage.close();
  });

  test('send profile to moderate', async () => {
    
    await page.locator('a[href="/edit_account"]').click();
    await page.getByRole('link', { name: 'P2P Profiles' }).click();
    for ( const profileInput of await page.locator('div.profiles').locator('input').all()){
      await profileInput.fill(UserData.nickname)
    };
    await page.getByRole('button', { name: 'Save'}).click()

    await expect(page.getByText('Moderation')).toHaveCount(4);
    for (let i = 0; i < platforms.length; i++) {
      await checkMail(await context.newPage(), `New ${upFirstLetter(platforms[i])} profile added`, adminMail, i);
    }
  })

  test('verify and decline profiles', async () => {
    await adminPage.getByText(adminNickname).click();
    await adminPage.getByRole('link', { name: 'Dashboard' }).click();
    await adminPage.getByRole('link', { name: 'Dashboard' }).click();
    await adminPage.getByText('Users Awaiting P2P Profile Verification').click();

    await page.locator('a[href="/edit_account"]').click();
    await page.getByRole('link', { name: 'P2P Profiles' }).click();
    for (let i = 0; i < platforms.length; i++) {
      await moderate(adminPage, upFirstLetter(platforms[i]), i < 2 ? 'Verify' : 'Decline')
      await page.reload();
      await expect(page.locator(`div.${platforms[i]}`).getByText(i < 2 ? 'Verified' : 'Declined')).toHaveCount(1);
      await checkMail(await context.newPage(), `${upFirstLetter(platforms[i])} profile ${ i < 2 ? 'verified' : 'declined'}`, UserData.mail, 0);
    }

    await page.goto('.');
    await page.getByText(UserData.nickname).click();
    await page.getByRole('link', { name: 'Profile' }).click();

    for ( const platform of platforms.slice(0, 2)) {
      await checkDisplay(page, platform)
    }
  })

  test('remove profiles', async () => {
    await page.locator('a[href="/edit_account"]').click();
    await page.getByRole('link', { name: 'P2P Profiles' }).click();
    let removeButton = await page.locator('div.profiles').getByRole('button', {name: 'Remove'})
    for ( let i = 0; i < platforms.length; i++){
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      })
      await removeButton.first().click()
    }
  })

})