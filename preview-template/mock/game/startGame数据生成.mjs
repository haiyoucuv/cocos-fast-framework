// export enum ESpType {
//   bag_silver = "sp_bag_silver",           // 银福袋
//   revival_card = "sp_revival_card",       // 复活卡
//   shield_card = "sp_shield_card",         // 护盾卡
//   agility_card = "sp_agility_card",       // 移速卡
//   experience_card = "sp_experience_card", // 双倍卡
//   add_length = "sp_add_length",           // 加长卡
//   decoration_1 = "sp_decoration_1",       // 蛇皮肤
// }

import * as fs from "fs";
import CryptoJS from "crypto-js";
import "crypto-js/aes.js";
import "crypto-js/pad-zeropadding.js";

const { AES, enc, mode, pad } = CryptoJS;

const getOptions = (iv) => {
  return {
    iv: enc.Utf8.parse(iv),
    mode: mode.CBC,
    padding: pad.ZeroPadding,
  };
};

/** 加密 */
const AESEncrypt = (str, key, iv) => {

  const options = getOptions(iv);

  return AES.encrypt(str, enc.Utf8.parse(key), options).toString();
};
/** 解密 */
const AESDecrypt = (cipherText, key, iv) => {

  const options = getOptions(iv);

  return AES.decrypt(cipherText, enc.Utf8.parse(key), options)
    .toString(enc.Utf8)
    .trim()
    .replace(//g, "")
    .replace(//g, "")
    .replace(/\v/g, "")
    .replace(/\x00/g, "");
};

const startInfo = {
  barrierFlag: true,      // 本局游戏难度是否上升
  firstGameFlag: true,     // 本局是否第一局，为true则有一，二，无尽模式三个阶段的区别
  accumulateLuckNum: 3,     // 当局累计获得福袋数量
  initScore: 50,     // 当局初始分数值
  limitLuckNum: 5,     // 当日上限可获得福袋数
  downArea: [3, 2, 1],     // 掉落分布，集合，比如每日上限6个，这里配置返回1、2、3
  currentAcquireNum: 5,     // 当局剩余可获得福袋数，不包含accumulateLuckNum，当局累计获得福袋数量
  currentStage: 3,     // 当前应该进入的阶段(1-一阶段 2-二阶段 3-无尽模式)
  spCardList: [ // 道具卡集合
    { spId: "sp_bag_silver", num: 1 },
    { spId: "sp_revival_card", num: 2 },
    { spId: "sp_shield_card", num: 13 },
    { spId: "sp_agility_card", num: 9 },
    { spId: "sp_experience_card", num: 5 },
    { spId: "sp_add_length", num: 6 },
    { spId: "sp_decoration_1", num: 1 },
  ],

  // sp_decoration_default装扮默认皮肤，sp_skin_snake_year装扮蛇皮肤
  currentDressUp: "sp_decoration_default",
  // currentDressUp: "sp_skin_snake_year",

  startId: 12312,    // 游戏记录ID
  slideScore: 100,    // 校验滑块的分数值

};

const encrypt = AESEncrypt(JSON.stringify(startInfo), "6FDCE02EBB43C3A8", "cDOiBC1n2QrkAY2P");

const json = {
  success: true,
  code: "",
  message: "",
  data: encrypt
};

fs.writeFileSync("./startGame.do.json", JSON.stringify(json, null, 4));