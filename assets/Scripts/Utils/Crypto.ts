import CryptoJS from "crypto-js/core.js";
import "crypto-js/aes.js";
import "crypto-js/pad-zeropadding.js";

const {AES, enc, mode, pad} = CryptoJS;

const getOptions = (iv) => {
    return {
        iv: enc.Utf8.parse(iv),
        mode: mode.CBC,
        padding: pad.ZeroPadding,
    };
}

/** 加密 */
export const AESEncrypt = (str, key, iv) => {

    const options = getOptions(iv);

    return AES.encrypt(str, enc.Utf8.parse(key), options).toString();
};
/** 解密 */
export const AESDecrypt = (cipherText, key, iv) => {

    const options = getOptions(iv);

    return AES.decrypt(cipherText, enc.Utf8.parse(key), options)
        .toString(enc.Utf8)
        .trim()
        .replace(//g, '')
        .replace(//g, '')
        .replace(/\v/g, '')
        .replace(/\x00/g, '');
};

