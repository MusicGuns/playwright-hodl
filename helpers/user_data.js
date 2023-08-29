const fs = require('fs');
const twofactor = require("node-2fa");
let generator = require('generate-password');
// import PNG from 'pngjs3';
// import jsqr from 'jsqr';
import * as authInfo from '../attachment/user_data.json';

export class UserData {

  static password = authInfo.password;
  static mail = authInfo.mail;
  static nickname = authInfo.nickname;
  static secret_key = authInfo.secret;
  static backup = authInfo.backup;
  static apiKey = authInfo.apiKey;
  static refCode = authInfo.refCode;
  
  static genOtpToken() {
    return twofactor.generateToken(this.secret_key)["token"];
  }
  
  static getNewMail() {
    return generator.generate({ numbers: true, uppercase: false }) + '+' + generator.generate({ numbers: true, uppercase: false }) + '@' + generator.generate({uppercase: false}) + ".ru"
  };

  static getNewPassword() {
    return generator.generate({
      numbers: true,
      symbols: true
    }) + 'a1';
  };

  static getNewNickname() {
    return generator.generate({
      numbers: true,
      uppercase: false
    }) + 'a1';
  }

  // async checkQrCode(secret, image_path) {
  //   let image = (await Jimp.read(image_path));
  //   let imageBase64 = await image.getBase64Async('image/png');
  //   console.log(Buffer.from( await imageBase64.slice('data:image/png;base64,'.length), 'base64'));
  //   let png = await PNG.sync.read(Buffer.from( await imageBase64.slice('data:image/png;base64,'.length), 'base64'));
  //   let code = jsqr(Uint8ClampedArray.from(png.data), png.width, png.height);
  //   return code.data.match(new RegExp(secret))[0] == "" ? false : true;
  // }
  static saveNewNickname(newNickname) {
    this.nickname = newNickname;
    authInfo["nickname"] = newNickname;
    this.saveData(authInfo);
  }

  static saveApiKey(newKey) {
    this.apiKey = newKey;
    authInfo["apiKey"] = newKey;
    this.saveData(authInfo);
  }
  
  static saveNewMail(newMail) {
    this.mail = newMail;
    authInfo["mail"] = newMail;
    this.saveData(authInfo);
  }
  
  static saveNewPassword(newPassword) {
    this.password = newPassword;
    authInfo["password"] = newPassword;
    this.saveData(authInfo);
  }
  
  static saveSecretKey2Fa(newSecret, newBackup) {
    this.backup = newBackup;
    this.secret_key = newSecret;
    authInfo["secret"] = newSecret;
    authInfo["backup"] = newBackup;
    this.saveData(authInfo);
  }
  
  static saveData(data) {
    delete data.default;
    fs.writeFileSync('attachment/user_data.json', JSON.stringify(data));
  }
}
