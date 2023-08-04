const fs = require('fs');
import * as authInfo from '../attachment/password.json';
let oldPassword = authInfo.password;
export let mail = 'battcamm@mail.ru';
export let nickname = 'musicgun';


export function getNewPassword() {
  let generator = require('generate-password');
  
  return generator.generate({
    numbers: true,
    symbols: true
  }) + 'a1';
};

export function getOldPassword() {
  return oldPassword;
};

export function saveNewPassword(newPassword) {
  oldPassword = newPassword;
  authInfo["password"] = newPassword;
  delete authInfo.default;
  fs.writeFileSync('attachment/password.json', JSON.stringify(authInfo));
}
