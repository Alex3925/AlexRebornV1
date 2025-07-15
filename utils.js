// @ts-check
/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/

import MusicTheory from "./handlers/music-theory-js.js";
import fs from "fs";
import axios from "axios";
import similarity from "string-similarity";

class FileControl {
  constructor(path, options = { strict: false, sync: true }) {
    this.path = path;
    this.strict = options.strict;
    this.sync = options.sync;
  }

  content(encoding) {
    if (this.sync) {
      return this.contentSync(encoding);
    }
    return new Promise((resolve, reject) => {
      fs.promises
        .readFile(this.path, encoding || "utf-8")
        .then(resolve)
        .catch((error) => {
          if (this.strict) {
            reject(error);
          } else {
            resolve(null);
          }
        });
    });
  }

  contentSync(encoding) {
    try {
      return fs.readFileSync(this.path, encoding || "utf-8");
    } catch (error) {
      if (this.strict) {
        throw error;
      } else {
        return null;
      }
    }
  }

  write(content, encoding) {
    if (this.sync) {
      return this.writeSync(content, encoding);
    }
    return new Promise((resolve, reject) => {
      fs.promises
        .writeFile(this.path, content, encoding || "utf-8")
        .then(resolve)
        .catch((error) => {
          if (this.strict) {
            reject(error);
          } else {
            resolve(null);
          }
        });
    });
  }

  writeSync(content, encoding) {
    try {
      return fs.writeFileSync(this.path, content, encoding || "utf-8");
    } catch (error) {
      if (this.strict) {
        throw error;
      } else {
        return null;
      }
    }
  }

  exists() {
    try {
      return fs.existsSync(this.path);
    } catch (error) {
      if (this.strict) {
        throw error;
      } else {
        return false;
      }
    }
  }

  delete() {
    try {
      fs.unlinkSync(this.path);
      return true;
    } catch (error) {
      if (this.strict) {
        throw error;
      } else {
        return false;
      }
    }
  }

  isDirectory() {
    try {
      return fs.statSync(this.path).isDirectory();
    } catch (error) {
      if (this.strict) {
        throw error;
      } else {
        return false;
      }
    }
  }

  files() {
    if (this.sync) {
      return this.filesSync();
    }
    return new Promise((resolve, reject) => {
      if (this.isDirectory()) {
        fs.promises
          .readdir(this.path)
          .then(resolve)
          .catch((error) => {
            if (this.strict) {
              reject(error);
            } else {
              resolve(null);
            }
          });
      } else {
        resolve([]);
      }
    });
  }

  filesSync() {
    try {
      if (this.isDirectory()) {
        return fs.readdirSync(this.path);
      } else {
        return [];
      }
    } catch (error) {
      if (this.strict) {
        throw error;
      } else {
        return null;
      }
    }
  }

  create() {
    if (this.sync) {
      return this.createSync();
    }
    return new Promise((resolve, reject) => {
      try {
        if (this.exists()) {
          resolve();
        } else {
          if (this.isDirectory()) {
            fs.promises
              .mkdir(this.path, { recursive: true })
              .then(resolve)
              .catch(reject);
          } else {
            fs.promises
              .mkdir(this.path, { recursive: true })
              .then(() => fs.promises.writeFile(this.path, ""))
              .then(resolve)
              .catch(reject);
          }
        }
      } catch (error) {
        if (this.strict) {
          reject(error);
        } else {
          resolve(null);
        }
      }
    });
  }

  createSync() {
    try {
      if (this.exists()) {
        return;
      }
      if (this.isDirectory()) {
        fs.mkdirSync(this.path, { recursive: true });
      } else {
        fs.mkdirSync(this.path, { recursive: true });
        fs.writeFileSync(this.path, "");
      }
    } catch (error) {
      if (this.strict) {
        throw error;
      }
    }
  }
}

function stringArrayProxy(optionalArray) {
  const arr = optionalArray ? optionalArray : [];

  return new Proxy(arr, {
    get(target, prop, _receiver) {
      const val = target[prop] || "";
      symbolCheck: {
        if (typeof prop === "symbol") {
          break symbolCheck;
        }
        //console.log(`[proxy] - ${prop} - ${JSON.stringify(val)}`);
      }
      return val;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  });
}

class Toggle {
  constructor() {
    this.offStates = {};
    this.funcs = {};
  }
  on(key, callback = function () {}) {
    if (key in this.offStates) {
      delete this.offStates[key];
      return callback(this.offStates);
    }
  }
  off(key, callback = function () {}) {
    this.offStates[key] = true;
    return callback(this.offStates);
  }
  test(key, callback = function () {}) {
    if (key in this.offStates && !this.offStates[key]) {
      callback(this.offStates);
      return true;
    }
    return false;
  }
  async testAsync(key, callback = async function () {}) {
    if (key in this.offStates && !this.offStates[key]) {
      await callback(this.offStates);
      return true;
    }
    return false;
  }
  setSpawn(key, func) {
    if (!this.funcs[key]) {
      this.funcs[key] = [];
    }
    this.funcs[key].push(func);
  }
  async spawn(key, delay = 0) {
    if (delay) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    let returns = [];
    if (this.funcs[key] && !this.offStates[key]) {
      for (const func of this.funcs[key]) {
        returns.push(await func());
      }
    }
    return returns;
  }
  isFree(key) {
    return !!this.funcs[key];
  }
  swap(key) {
    if (!this.test(key)) {
      this.on(key);
    } else if (this.test(key)) {
      this.off(key);
    }
    return this.test(key);
  }
  nextFree() {
    let num = 0;
    while (this.funcs[num]) {
      num++;
    }
    return num;
  }
}

function classMaker(className, options) {
  const {
    constructor = function () {},
    nonConstructor = function () {},
    constants = [],
    statics = [],
    nonEnums = [],
    ...methods
  } = options;

  const boundMethods = {};
  const staticMethods = {};

  for (const [key, value] of Object.entries(methods)) {
    if (statics.includes(key)) {
      if (typeof value !== "function") {
        staticMethods[key] = value;
      } else {
        staticMethods[key] = value.bind(null);
      }
    } else {
      if (typeof value !== "function") {
        boundMethods[key] = value;
      } else {
        boundMethods[key] = value.bind(null);
      }
    }
  }

  for (const constant of [...constants, ...nonEnums]) {
    Object.defineProperty(boundMethods, constant, {
      value: boundMethods[constant],
      writable: false,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(staticMethods, constant, {
      value: staticMethods[constant],
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }

  Object.assign(className.prototype, boundMethods);
  Object.assign(className, staticMethods);
  className.name = className;

  function Class(...args) {
    if (!(this instanceof Class)) {
      return nonConstructor.apply(this, args);
    }
    constructor.apply(this, args);
  }

  return Class;
}
function ClassExtra(Class) {
  const { constants } = Class;
  if (!Class?.prototype) {
    throw new Error(`Class ${Class.name} has no prototype!`);
  }
  for (const method in constants) {
    if (!Class.prototype[method]) {
      throw new TypeError(
        `Class ${Class.name} added ${method} to constants but its falsy!`
      );
    }
    Object.defineProperty(Class.prototype[method], method, {
      value: Class.prototype[method],
      writable: false,
      enumerable: false,
      configurable: true,
    });
  }
  const oldConstructor = Class.prototype.constructor;
  Class.prototype.constructor = function (...args) {
    if (!(this instanceof Class)) {
      if (Class.prototype.nonConstructor) {
        const result = Class.prototype.nonConstructor.apply(this, args);
        if (!result) {
          return Class;
        } else {
          return result;
        }
      } else {
        return new Class(...args);
      }
    } else {
      return oldConstructor.apply(this, args);
    }
  };
}

async function absoluteImport(url) {
  const data = await import(`./${url}`);
  return {
    ...(data.default || {}),
    ...data,
  };
}

class Cooldown {
  constructor() {
    this.cooldowns = {};
    console.log(`[ Cooldown ] - Loaded!`);
  }

  push(seconds = 5, key, isMilliseconds = false) {
    this.cooldowns[key] = {
      startTime: Date.now(),
      duration: isMilliseconds ? seconds : seconds * 1000,
    };
  }

  remainingTime(key) {
    const cooldown = this.cooldowns[key];

    if (!cooldown || cooldown.duration <= 0) {
      delete this.cooldowns[key];
      return false;
    }

    const elapsedTime = Date.now() - cooldown.startTime;
    return Math.max(0, (cooldown.duration - elapsedTime) / 1000).toFixed(3);
  }

  isActive(key) {
    const cooldown = this.cooldowns[key];

    if (!cooldown || Date.now() - cooldown.startTime >= cooldown.duration) {
      delete this.cooldowns[key];
      return false;
    }

    return true;
  }
}

function SpecialFunc({ index, ...obj }) {
  const modifiedIndex = index;

  try {
    Object.keys(obj).forEach((key) => {
      modifiedIndex[key] = obj[key];
    });
  } catch (error) {
    console.error("Error occurred while assigning properties:", error);
  }

  return modifiedIndex;
}
function ClassV({ constructor, ...methods }) {
  return function (...args) {
    const instance = {
      ...methods,
      _constructor: constructor,
    };

    if (constructor) {
      constructor.apply(instance, args);
    }

    return instance;
  };
}

function delay(ms = 500) {
  return new Promise((r) => setTimeout(r, ms));
}
function getUTY(player) {
  let result = {};
  const files = fs.readdirSync("handlers/database/uty");
  const special = JSON.parse(
    fs.readFileSync("handlers/database/uty.json", "utf8")
  );
  result = {
    ...special,
  };
  files.forEach((file) => {
    try {
      let data = JSON.parse(
        fs.readFileSync(`handlers/database/uty/${file}`, "utf8")
      );
      if (file.includes(".geno") && player.lv > 1 && player.getFun() < 0) {
        result = {
          ...result,
          ...data,
        };
      } else if (
        file.includes(".paci") &&
        player.lv == 1 &&
        player.getFun() >= 0
      ) {
        result = {
          ...result,
          ...data,
        };
      } else if (!file.includes(".geno") && !file.includes(".paci")) {
        result = {
          ...result,
          ...data,
        };
      }
    } catch (err) {
      console.log(err);
    }
  });
  return result;
}
const defaults = {
  home: "",
  NAME: "Nobody",
  HP: 0,
  AT: 0,
  DF: 0,
  EXP: 0,
  GOLD: 0,
  TYPE: "not monster",
  Acts: ["Check"],
  attacks: {
    null: null,
  },
  winningAct: [],
  flavorText: {
    check: "Nobody is here.",
    act: {},
    afterAct: {
      Check: ["What are you checking?"],
    },
    encounter: ["But nobody came."],
    neutral: ["Nothing happened."],
  },
  quotes: {
    afterAct: {},
    lowHP: [],
    neutral: ["..."],
  },
};

const defaultItems = {
  weapons: {
    stick: {
      dmg: 3,
      name: "Stick",
      info: "Weapon AT {dmg}, just a useless stick.",
    },
  },
  currentWeapon: "stick",
};
function convertWeapons(item) {
  const { name, flavorText, atk } = weapon;
  return {
    dmg: atk,
    name,
    info: flavorText,
  };
}
const defaultMagic = {
  heal_prayer: {
    name: "✨ Heal Prayer",
    info: "Heals your HP.",
    tp: 32,
    heal: 35,
    flavor: [`You casted a heal prayer. Gained some HP`],
  },
  pacify: {
    name: "💤 Pacify",
    info: "Spares tired enemy.",
    tp: 16,
    index(_, battle) {
      return battle.pacify();
    },
  },
  x_slash: {
    name: "⚔️ X-Slash",
    info: "Deals critical damage.",
    tp: 50,
    index(player, battle) {
      const dmg = player.getAT() * 4;
      const attack = battle.attackThis(dmg);
      return `You used X-Slash and dealt ${attack} amount of damage! Her HP is now ${battle.getHP()}/${battle.getMaxHP()}`;
    },
  },
  wild_blast: {
    name: "💛 Wild Blast",
    info: "Damages the opponent with a justice-powered blast.",
    tp: 40,
    index(player, battle) {
      const dmg = player.getAT() * 4.5;
      const attack = battle.attackThis(dmg, {
        cutOff: 1,
      });
      return `CLOVER BLAST!! You blasted the opponent with a justice-powered blast and dealt ${attack} amount of damage! Her HP is now ${battle.getHP()}/${battle.getMaxHP()}`;
    },
  },
};
function useGeno(obj) {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    obj[key] = obj[`geno:${key}`] ?? obj[key];
    if (typeof obj[key] === "object") {
      obj[key] = useGeno(obj[key]);
    }
  }
  return obj;
}
function usePref(obj, pref) {
  for (const key in obj) {
    const value = obj[key];
    if (obj[pref + key]) {
      obj[key] = obj[pref + key];
    }
    if (typeof value === "object") {
      obj[key] = useGeno(value, pref);
    }
  }
  return obj;
}
class UTYPlayer {
  #tp = 0;
  constructor({
    item,
    exp = 0,
    gold = 0,
    progress,
    kills = 0,
    spares = 0,
    entryMagic,
    name = "Chara",
    ...other
  }) {
    let magic = entryMagic || ["heal_prayer", "pacify", "x_slash"];
    Object.assign(this, {
      item,
      exp,
      gold,
      progress,
      spares,
      name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      get kills() {
        return kills >= 5 ? kills : null;
      },
      other: { ...other },
    });
    this.magic = {};
    this.item ??= defaultItems;
    if (this.isClover) {
      this.magic = magic.filter((item) => item !== "x_slash");
      magic.push("wild_blast");
    }
    for (const spell of magic) {
      this.magic[spell] = defaultMagic[spell];
    }
  }
  get TP() {
    return this.#tp;
  }

  set TP(tp) {
    if (tp >= 100) {
      this.#tp = 100;
    } else if (tp <= 0) {
      this.#tp = 0;
    } else {
      this.#tp = tp;
    }
  }
  get heart() {
    if (this.isClover) {
      return "💛";
    }
    return "❤️";
  }
  get isClover() {
    return this.name.toLowerCase() === "clover";
  }
  yellowing(str) {
    if (!this.isClover) {
      return str;
    }
    let result = str;
    result = result.replace(new RegExp("⚔️", "g"), "🔫");
    result = result.replace(new RegExp("❤️", "g"), "💛");
    result = result.replace(/you are/gi, "Clover is");
    result = result.replace(/your/gi, "Clover's");
    result = result.replace(/you're/gi, "Clover is");
    result = result.replace(/you/gi, "Clover");
    return result;
  }

  gainTP(tp) {
    this.TP += tp;
  }
  useTP(tp) {
    this.TP -= tp;
  }

  canTP(val) {
    return this.TP >= val;
  }

  getLV() {
    return getLv(this.exp);
  }

  defend(dmg) {
    const calc = this.calcDmg(dmg);
    const randomDecimal = (Math.random() * 4) / 10;
    const newDmg = calc - Math.floor(calc * randomDecimal);
    return {
      damage: newDmg,
      calc,
      diff: calc - newDmg,
      TP: this.TP + 16,
    };
  }
  getMagicList() {
    let num = 1;
    let result = Object.keys(this.magic).map((key) => {
      const val = this.magic[key];
      return `${num++}. ${val.name || "Unknown Spell"} (${val.tp || "??"} TP)
* ${val.info ?? "No Info."}`;
    });
    result = result.join("\n\n");
    result += `

Reply with the number of the magic you want to use.`;
    return result;
  }
  getMagic(number) {
    let num = parseInt(number);
    return this.magic[Object.keys(this.magic)[num - 1]];
  }
  isMagicTP(number) {
    const { tp } = this.getMagic(number);
    return this.canTP(tp);
  }

  calcDmg(dmg, noTP = false) {
    const criticalChance = 0.25;
    const weakChance = 0.12;
    const penetrateChance = 0.25;
    const randomChance = Math.random();

    let finalDamage = dmg;

    if (randomChance <= criticalChance) {
      const extraDamagePercent = Math.random() * 0.25;
      finalDamage += Math.round(dmg * extraDamagePercent);
    } else if (randomChance <= criticalChance + weakChance) {
      const lessDamagePercent = Math.random() * 0.12;
      finalDamage -= Math.round(dmg * lessDamagePercent);
    }
    if (randomChance <= penetrateChance) {
      finalDamage += Math.round(this.getDF() * 0.25);
    }

    finalDamage -= this.getDF();
    finalDamage = Math.max(finalDamage, 0);
    return Math.floor(finalDamage);
  }
  getRemainExp() {
    return getRemainExp(this.exp);
  }

  get lv() {
    return getLv(this.exp);
  }

  getHP() {
    if (this.getLV() >= 20) {
      return 99;
    }
    return 16 + 4 * this.getLV();
  }

  getATBonus() {
    if (this.getLV() >= 20) {
      return 30;
    }
    return -2 + 2 * this.lv + 4;
  }

  get dmgBonus() {
    return this.getAT();
  }

  get hp() {
    return this.getHP();
  }

  getWeapon() {
    const weapons = this.item.weapons;
    const currentWeaponKey =
      this.item.currentWeapon || Object.keys(this.item.weapons)[0];
    const currentWeapon = weapons[currentWeaponKey];

    const defaultWeaponKey = Object.keys(this.item.weapons)[0];
    const defaultWeapon = weapons[defaultWeaponKey];

    return currentWeapon || defaultWeapon;
  }
  toJSON() {
    return {
      lv: this.getLV(),
      hp: this.getHP(),
      name: this.name,
      exp: this.exp,
      df: this.getDF(),
      kills: this.kills,
      spares: this.spares,
      gold: this.gold,
      at: this.getAT(),
    };
  }

  getAT(battle) {
    let pen = 1;
    if (battle) {
      pen = battle.getDF();
    }
    /*if (this.getLV() >= 20) {
      return ((this.getWeapon().dmg ?? 2) + this.getATBonus()) ** 2;
    }*/
    //return (this.getWeapon().dmg ?? 2) + this.getATBonus();
    return (this.getWeapon().dmg ?? 2) * this.getATBonus() + pen;
  }

  get dmg() {
    return this.getAT();
  }

  getDF() {
    if (this.getLV() >= 20) {
      return 30;
    }
    return Math.floor((this.lv - 1) / 4);
  }
  getRoute() {
    if (this.exp == 0) {
      return "Pacifist";
    }
    if (/*this.spares == 0*/ this.getFun() < 0 && this.kills > 20) {
      return "Genocide";
    }
    return "Neutral";
  }
  getFun() {
    return this.spares - this.kills;
  }
  addExternalMethod(key, func) {
    const newFunc = func.bind(this);
    this[key] = newFunc;
  }
}
const expRequired = {
  1: 10,
  2: 20,
  3: 40,
  4: 50,
  5: 80,
  6: 100,
  7: 200,
  8: 300,
  9: 400,
  10: 500,
  11: 800,
  12: 1000,
  13: 1500,
  14: 2000,
  15: 3000,
  16: 5000,
  17: 10000,
  18: 25000,
  19: 49999,
};
function getRemainExp(exp) {
  let nextLv = getLv(exp);
  let nextLvExp = expRequired[nextLv];
  if (!nextLvExp) {
    return 0;
  }
  return nextLvExp - exp;
}

function getLv(exp) {
  let lv = 1;
  while (exp >= expRequired[lv] && lv < 20) {
    lv++;
  }

  return lv;
}

class UTYBattle {
  constructor(infoObj, p1 = new UTYPlayer()) {
    this.monster = { ...defaults, ...infoObj };
    this.isWinningActSatisfied = false;
    this.p1 = p1;
    if (p1.getFun() < -10) {
      this.monster = useGeno({ ...defaults, ...infoObj });
    }
    if (this.monster.TYPE == "monster" && p1.getAT() > this.monster.HP) {
      this.monster.HP += Math.floor(p1.getAT() * 1.5);
    }
    this.monster.maxHP = this.monster.HP;
    this.isOver = false;
    this.actSeq = [];
    this.orders = {};
    this.monster.GOLD *= 5;
  }

  attackThis(dmg = 7, options = {}) {
    if (this.monster.dodge) {
      return 0;
    }
    const criticalChance = 0.25;
    const weakChance = 0.12;
    const penetrateChance = 0.25;
    const randomChance = Math.random();

    let finalDamage = dmg;

    if (randomChance <= criticalChance) {
      if (this.monster.dodge) {
        return 0;
      }
      const extraDamagePercent = Math.random() * 0.25;
      finalDamage += Math.round(dmg * extraDamagePercent);
    } else if (randomChance <= criticalChance + weakChance) {
      const lessDamagePercent = Math.random() * 0.12;
      finalDamage -= Math.round(dmg * lessDamagePercent);
    }
    if (randomChance <= penetrateChance) {
      finalDamage += Math.round(this.monster.DF * 0.25);
    }
    if (this.p1 && this.p1.getLV() >= 20) {
      finalDamage += this.getDF();
      finalDamage += Math.floor(this.getMaxHP() * 0.2);
    }

    finalDamage -= this.monster.DF;

    finalDamage = Math.max(finalDamage, 0);

    if (this.isYellow()) {
      const damage =
        this.monster.maxHP +
        Math.floor(Math.random() * this.monster.maxHP ** 2);
      finalDamage = damage;
    }

    if (finalDamage > this.getHP() && options.cutOff) {
      this.monster.HP = options.cutOff;
    } else {
      this.monster.HP -= Math.max(finalDamage, 0);
    }
    if (false) {
      this.isWinningActSatisfied = true;
    } else {
      this.isWinningActSatisfied = false;
    }
    return finalDamage;
  }
  getName() {
    return this.monster.NAME;
  }
  getHP() {
    return this.monster.HP;
  }
  getMaxHP() {
    return this.monster.maxHP;
  }

  getAT() {
    if (Array.isArray(this.monster.KR)) {
      const { KR } = this.monster;
      return Math.floor(Math.random() * (KR[1] - KR[0]) + KR[0]);
    }
    return this.monster.AT;
  }

  getDF() {
    return this.monster.DF;
  }

  getEXP() {
    return this.monster.EXP;
  }

  getGold() {
    return this.monster.GOLD;
  }

  getType() {
    return this.monster.TYPE;
  }

  getActs() {
    return this.monster.Acts;
  }
  getUI(data) {
    return `* ${this.getFlavor()}`;
  }

  getActList() {
    return this.monster.Acts.map((act) => `* ${act}`).join("\n");
  }
  getMercyList() {
    return `${this.isYellow() ? "* 𝗦𝗽𝗮𝗿𝗲" : "* Spare"}\n${
      this.monster.TYPE === "monster" ? "* Flee" : ""
    }`;
  }
  hasFlee() {
    return this.monster.TYPE === "monster";
  }
  getRandomAttack(isWin) {
    const attacks = Object.keys(this.monster.attacks);
    const randomIndex = Math.floor(Math.random() * attacks.length);
    const randomAttack = attacks[randomIndex];
    if (this.isWinningActSatisfied) {
      return {
        attack: null,
        direction: null,
        attacks: null,
      };
    }
    return {
      attack: randomAttack,
      direction: this.monster.attacks[randomAttack],
      attacks: Object.values(this.monster.attacks),
    };
  }

  getAttack(key) {
    return this.monster.attacks[key];
  }

  isYellow() {
    return this.isWinningActSatisfied;
  }

  act(action) {
    const flavorText =
      this.monster.flavorText?.act?.[action] || this.monster.flavorText.neutral;
    const quote =
      this.monster.quotes.afterAct?.[action] || this.monster.quotes.neutral;
    this.actSeq.push(action);
    const startIndex = this.actSeq.indexOf(this.monster.winningAct[0]);

    const IsWin = () => {
      let currentIndex = 0;
      for (const act of this.actSeq) {
        if (act === this.monster.winningAct?.[currentIndex]) {
          currentIndex++;
          if (currentIndex === this.monster.winningAct?.length) {
            return true;
          }
        }
      }
      return false;
    };
    const isWin = IsWin();

    if (flavorText && quote) {
      let myFlav = flavorText[Math.floor(Math.random() * flavorText.length)];
      if (action === "Check") {
        myFlav = `${this.getName().toUpperCase()}
HP ${this.getHP()} ATK ${
          this.monster.KR ? 1 : this.getAT()
        } DF ${this.getDF()}\n${this.monster.flavorText.check}`;
      }
      const { actEffect = {} } = this.monster;
      if (actEffect[action]) {
        const effect = actEffect[action];
        this.monster.DF += effect.def || 0;
        this.monster.AT += effect.atk || 0;
      }
      if (false) {
        return {
          flavorText: myFlav,
          quote: `...`,
        };
      }
      if (/*action === this.monster.winningAct[0]*/ isWin) {
        this.isWinningActSatisfied = true;
      } else {
        //this.isWinningActSatisfied = false;
      }
      return {
        flavorText: myFlav,
        quote: this.getIndex(quote, action),
        afterAct: this.getIndex(
          this.monster.flavorText?.afterAct?.[action] ||
            this.monster.flavorText?.neutral,
          action
        ),
        effect: actEffect[action] || {},
        isWin,
      };
    }
    return false;
  }
  getIndex(arr, key) {
    if (arr[0] === ":order") {
      if (this.orders[key]) {
        this.orders[key]++;
        const val = arr[this.orders[key]] || arr[arr.length - 1];
        return val;
      } else {
        this.orders[key] = 1;
        return arr[1];
      }
    } else {
      return randArrValue(arr);
    }
  }

  getFlavor() {
    const neutralFlavors = this.monster.flavorText.neutral;
    return this.getIndex(neutralFlavors, "neutral");
  }

  getEncounter() {
    return this.getIndex(this.monster.flavorText.encounter, "encounter");
  }

  getQuote() {
    const currentHP = this.monster.HP;
    const maxHP = this.monster.maxHP;

    if (currentHP < 0.5 * maxHP) {
      return this.getRandomLowHPQuote();
    } else {
      return this.getRandomNeutralQuote();
    }
  }

  getRandomLowHPQuote() {
    const lowHPQuotes =
      this.monster.quotes.lowHP || this.monster.quotes.neutral;
    return this.getIndex(lowHPQuotes, "lowHP");
  }

  getFightQuote() {
    const fightQuotes =
      this.monster.quotes.onFight || this.monster.quotes.neutral;
    return this.getIndex(fightQuotes, "onFight");
  }

  getRandomNeutralQuote() {
    const neutralQuotes = this.monster.quotes.neutral;
    return this.getIndex(neutralQuotes, "neutralQuote");
  }
  isDead() {
    if (this.monster.HP <= 0) {
      this.isOver = true;
      return `You won!
You earned ${this.monster.EXP} 𝗘𝗫𝗣 and ${this.monster.GOLD} 𝗚𝗢𝗟𝗗.`;
    } else {
      return false;
    }
  }
  spare(dmg = 0) {
    if (this.isYellow()) {
      this.isOver = true;
      return `You won!
You earned 0 𝗘𝗫𝗣 and ${this.monster.GOLD} 𝗚𝗢𝗟𝗗.`;
    } else {
      return false;
    }
  }
  get isPacify() {
    return this.p1.getAT() > this.monster.HP && !this.monster.KR;
  }
  pacify() {
    if (this.isPacify) {
      this.isOver = true;
      return `You casted pacify.

You won!
You earned 0 𝗘𝗫𝗣 and ${this.monster.GOLD} 𝗚𝗢𝗟𝗗.`;
    } else {
      return `You casted pacify, but ${this.monster.NAME} isn't 𝗧𝗜𝗥𝗘𝗗!`;
    }
  }
  addExternalMethod(key, func) {
    const newFunc = func.bind(this);
    this[key] = newFunc;
  }
}

class Tiles {
  constructor({
    sizeX = 5,
    sizeY = 5,
    tileIcon = "🟨",
    bombIcon = "💣",
    coinIcon = "💰",
    emptyIcon = "⬜",
  }) {
    this.size = [Number(sizeX), Number(sizeY)];
    this.tileIcon = tileIcon;
    this.emptyIcon = emptyIcon;
    this.bombIcon = bombIcon;
    this.coinIcon = coinIcon;
    this.board = this.generateFirstBoard();
    this.state = this.generateEmptyBoard();
  }

  randomTile() {
    const types = [
      this.emptyIcon,
      this.bombIcon,
      this.coinIcon,
      this.bombIcon,
      this.coinIcon,
      //this.emptyIcon,
      //this.bombIcon,
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  generateFirstBoard() {
    const board = [];
    for (let i = 0; i < this.size[0]; i++) {
      for (let j = 0; j < this.size[1]; j++) {
        board.push(this.randomTile());
      }
    }
    return board;
  }

  generateEmptyBoard() {
    const board = [];
    for (let i = 0; i < this.size[0]; i++) {
      for (let j = 0; j < this.size[1]; j++) {
        board.push(this.tileIcon);
      }
    }
    return board;
  }
  range() {
    return [1, this.board.length];
  }
  reveal() {
    for (let index in this.board) {
      this.state[index] = this.board[index];
    }
  }
  isEnd() {
    return !this.state.includes(this.tileIcon);
  }

  choose(num) {
    if (this.isOutRange(num)) {
      return "OUT_OF_RANGE";
    }
    if (!this.isFree(num)) {
      return "ALREADY_CHOSEN";
    }
    if (this.isBomb(num)) {
      this.state[num - 1] = this.bombIcon;
      return "BOMB";
    }
    if (this.isCoin(num)) {
      this.state[num - 1] = this.coinIcon;
      return "COIN";
    }
    if (this.isEmpty(num)) {
      this.state[num - 1] = this.emptyIcon;
      return "EMPTY";
    }
    return "UNKNOWN_ERROR";
  }

  isBomb(num) {
    return this.board[num - 1] === this.bombIcon;
  }

  isOutRange(num) {
    return !this.board[num - 1];
  }

  isEmpty(num) {
    return this.board[num - 1] === this.emptyIcon;
  }

  isCoin(num) {
    return this.board[num - 1] === this.coinIcon;
  }

  isFree(num) {
    const types = [this.emptyIcon, this.bombIcon, this.coinIcon];
    return !types.includes(this.state[num - 1]);
  }
  toStringOld() {
    let result = "";
    for (let i = 0; i < this.size[0]; i++) {
      result += this.state
        .slice(i * this.size[1], (i + 1) * this.size[1])
        .join("");
      result += "\n";
    }
    return result;
  }
  toString() {
    let result = "";
    //result += this.emptyIcon;
    /*for (let i = 0; i < this.size[1]; i++) {
      result += Tiles.numberTile(i + 1);
    }
    result += "\n";*/

    for (let i = 0; i < this.size[0]; i++) {
      result += Tiles.numberTile((i + 1) * this.size[1] - (this.size[1] - 1));
      result += this.state
        .slice(i * this.size[1], (i + 1) * this.size[1])
        .join("");
      result += Tiles.numberTile((i + 1) * this.size[1]);
      result += "\n";
    }
    return result;
  }
  static numberTile(number) {
    const map = [
      " 0 ",
      " 1 ",
      " 2 ",
      " 3 ",
      " 4 ",
      " 5 ",
      " 6 ",
      " 7 ",
      " 8 ",
      " 9 ",
    ];
    const numberStr = String(number);
    let result = "";
    if (number < 10) {
      result += map[0];
    }
    for (let digit of numberStr) {
      digit = Number(digit);
      if (digit >= 0 && digit <= 9) {
        result += map[digit];
      } else {
        result += "❓";
      }
    }

    return result;
  }
}

function ExtendClass(
  key,
  func,
  Target = Object,
  options = { writable: true, configurable: false, enumerable: false }
) {
  Object.defineProperty(func, "_cass_extends", {
    value: true,
    writable: options.writable ?? false,
    configurable: options.configurable ?? false,
    enumerable: options.enumerable ?? false,
  });
  Object.defineProperty(Target.prototype, key, {
    value: func,
    writable: options.writable ?? true,
    configurable: options.configurable ?? false,
    enumerable: options.enumerable ?? false,
  });
}
const LiaSystem = new Proxy(Object.prototype, {
  get(target, prop) {
    return target[prop];
  },
  set(target, prop, value) {
    ExtendClass(prop, value);
    return true;
  },
});

function createSafeProxy(obj) {
  const handler = {
    get: function (target, prop) {
      if (!(prop in target)) {
        throw new Error(`Property '${prop}' does not exist.`);
      }
      return target[prop];
    },
  };

  return new Proxy(obj, handler);
}

class File {
  constructor(pathname) {
    this.pathname = pathname;
  }

  exists() {
    return fs.existsSync(this.pathname);
  }

  isDirectory() {
    try {
      const stats = fs.statSync(this.pathname);
      return stats.isDirectory();
    } catch (err) {
      return false;
    }
  }

  isFile() {
    try {
      const stats = fs.statSync(this.pathname);
      return stats.isFile();
    } catch (err) {
      return false;
    }
  }

  createNewFile() {
    try {
      fs.writeFileSync(this.pathname, "");
      return true;
    } catch (err) {
      return false;
    }
  }
  jsCreateNewFile(content) {
    try {
      fs.writeFileSync(this.pathname, content);
      return true;
    } catch (err) {
      return false;
    }
  }
  jsGetContent(callback = (a) => a) {
    try {
      const file = fs.readFileSync(this.pathname, "utf8");
      return callback(file);
    } catch (err) {
      return false;
    }
  }

  mkdir() {
    try {
      fs.mkdirSync(this.pathname);
      return true;
    } catch (err) {
      return false;
    }
  }

  mkdirs() {
    try {
      fs.mkdirSync(this.pathname, { recursive: true });
      return true;
    } catch (err) {
      return false;
    }
  }

  delete() {
    try {
      fs.unlinkSync(this.pathname);
      return true;
    } catch (err) {
      return false;
    }
  }

  renameTo(dest) {
    try {
      fs.renameSync(this.pathname, dest.pathname);
      return true;
    } catch (err) {
      return false;
    }
  }

  getName() {
    const pathArray = this.pathname.split("/");
    return pathArray[pathArray.length - 1];
  }

  getAbsolutePath() {
    return fs.realpathSync(this.pathname);
  }

  getParent() {
    const pathArray = this.pathname.split("/");
    pathArray.pop();
    return pathArray.join("/");
  }

  listFiles() {
    try {
      return fs
        .readdirSync(this.pathname)
        .map((filename) => new File(`${this.pathname}/${filename}`));
    } catch (err) {
      return [];
    }
  }

  length() {
    try {
      const stats = fs.statSync(this.pathname);
      return stats.size;
    } catch (err) {
      return 0;
    }
  }

  lastModified() {
    try {
      const stats = fs.statSync(this.pathname);
      return stats.mtime;
    } catch (err) {
      return null;
    }
  }
}

class Prob {
  static get might() {
    return Math.random() < 0.2;
  }
  static get likely() {
    return Math.random() < 0.7;
  }
  static get unlikely() {
    return Math.random() < 0.1;
  }
  static get possibly() {
    return Math.random() < 0.9;
  }
  static get maybe() {
    return Math.random() < 0.5;
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randArrIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}
function randArrValue(arr) {
  return arr[randArrIndex(arr)];
}

function divideArray(arr, divisor) {
  const result = [];
  for (let i = 0; i < arr.length; i += divisor) {
    result.push(arr.slice(i, i + divisor));
  }
  return result;
}

// async function getStreamFromURL(url) {
//   try {
//     const response = await axios.get(url, {
//       responseType: "stream",
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }
class PythonDict {
  constructor(obj = {}) {
    this._data = obj;
    this._proxy = new Proxy(this, {
      set(target, prop, value) {
        if (PythonDict.prototype.hasOwnProperty(prop)) {
          throw new Error(`Cannot override built-in method '${prop}'`);
        } else {
          target._data[prop] = value;
          return true;
        }
      },
    });
  }

  keys() {
    return Object.keys(this._data);
  }

  values() {
    return Object.values(this._data);
  }

  items() {
    return Object.entries(this._data);
  }

  clear() {
    this._data = {};
  }

  has_key(key) {
    return key in this._data;
  }

  get(key) {
    return this._data[key];
  }

  set(key, value) {
    this._data[key] = value;
  }

  delete(key) {
    delete this._data[key];
  }

  update(obj) {
    Object.assign(this._data, obj);
  }

  copy() {
    return new PythonDict(Object.assign({}, this._data));
  }

  pop(key, defaultValue = undefined) {
    if (this.has_key(key)) {
      const value = this._data[key];
      delete this._data[key];
      return value;
    } else {
      return defaultValue;
    }
  }

  pop_item() {
    const keys = this.keys();
    if (keys.length > 0) {
      const key = keys[0];
      const value = this.get(key);
      this.delete(key);
      return [key, value];
    } else {
      throw new Error("pop_Item(): dictionary is empty");
    }
  }

  get_keys() {
    return this.keys();
  }

  get_values() {
    return this.values();
  }

  get_items() {
    return this.items();
  }

  set_default(key, defaultValue = undefined) {
    if (!this.has_key(key)) {
      this.set(key, defaultValue);
    }
    return this.get(key);
  }

  pop_value(value, defaultValue = undefined) {
    const keys = this.keys();
    for (const key of keys) {
      if (this.get(key) === value) {
        this.delete(key);
        return value;
      }
    }
    return defaultValue;
  }

  from_keys(iterable, defaultValue = undefined) {
    const newDict = new PythonDict();
    for (const key of iterable) {
      newDict.set(key, defaultValue);
    }
    return newDict;
  }

  from_items(iterable) {
    const newDict = new PythonDict();
    for (const [key, value] of iterable) {
      newDict.set(key, value);
    }
    return newDict;
  }

  set_items(iterable) {
    for (const [key, value] of iterable) {
      this.set(key, value);
    }
  }

  update_from_iterable(iterable) {
    for (const [key, value] of iterable) {
      if (this.has_key(key)) {
        this.set(key, value);
      }
    }
  }

  get_data() {
    return this._data;
  }
}

class Integer {
  constructor(value) {
    if (isNaN(value)) {
      throw new Error("Invalid value: value must be a number");
    }
    this.value = Math.floor(value);
  }

  static parseInt(str, radix = 10) {
    return parseInt(str, radix);
  }

  static valueOf(value) {
    return new Integer(value);
  }

  static toString(value, radix = 10) {
    return value.toString(radix);
  }

  static max(...values) {
    return Math.max(...values);
  }

  static min(...values) {
    return Math.min(...values);
  }

  static sum(...values) {
    return values.reduce((acc, val) => acc + val, 0);
  }

  static compare(x, y) {
    return Math.sign(x - y);
  }

  intValue() {
    return this.value | 0;
  }

  doubleValue() {
    return this.value * 1.0;
  }

  floatValue() {
    return this.value * 1.0;
  }

  longValue() {
    return BigInt(this.value);
  }

  equals(obj) {
    return obj instanceof Integer && this.value === obj.value;
  }

  compareTo(obj) {
    if (!(obj instanceof Integer)) {
      throw new Error("Comparison only allowed between Integer objects");
    }
    return this.value - obj.value;
  }

  toString(radix = 10) {
    return this.value.toString(radix);
  }
}

function syncCall(func, ...args) {}

class CassFile extends File {
  constructor(pathname) {
    super(pathname);
  }
  static quickJson(pathname) {
    const instance = new CassFile(pathname);
    const content = instance.jsGetContent();
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }
  static quickRead(pathname) {
    const instance = new File(pathname);
    return instance.jsGetContent();
  }
  static quickWrite(pathname, content) {
    const instance = new File(pathname);
    return instance.jsCreateNewFile(content);
  }

  exist() {
    return this.exists();
  }

  json() {
    return JSON.parse(this.jsGetContent());
  }

  content(callback = (a) => a) {
    return this.jsGetContent(callback);
  }

  write(data, callback = () => {}) {
    return this.jsWriteContent(data, callback);
  }
}

class MathNum extends Number {
  constructor(...args) {
    super(...args);
  }
  raiseTo(power = 1) {
    return Math.pow(this.valueOf, power);
  }
  root(root = 2) {
    return Math.pow(this.valueOf, 1 / root);
  }
  factorial(f = 1) {
    return Math.factorial(this.valueOf, f);
  }
  dividedBy(val = 1) {
    if (val == 0 && this.valueOf != 0) {
      throw new Error("Cannot divide by zero");
    }
    return this.valueOf / val;
  }
  asDivisorTo(val = 1) {
    if (this.valueOf == 0 && val != 0) {
      throw new Error("Cannot divide by zero");
    }
    return val / this.valueOf;
  }
  remainder(val = 1) {
    return this.valueOf % val;
  }
  remainderWith(val = 1) {
    return val % this.valueOf;
  }
}
function chance(percent = 100) {
  return Math.random() * 100 < percent;
}
function apply(text, fontMap) {
  let result = [];
  Array.from(text).forEach((char) => {
    if (char in fontMap) {
      result.push(fontMap[char]);
    } else {
      result.push(char);
    }
  });
  return result.join("");
}

const origin = {
  "𝗮": "a",
  "𝗯": "b",
  "𝗰": "c",
  "𝗱": "d",
  "𝗲": "e",
  "𝗳": "f",
  "𝗴": "g",
  "𝗵": "h",
  "𝗶": "i",
  "𝗷": "j",
  "𝗸": "k",
  "𝗹": "l",
  "𝗺": "m",
  "𝗻": "n",
  "𝗼": "o",
  "𝗽": "p",
  "𝗾": "q",
  "𝗿": "r",
  "𝘀": "s",
  "𝘁": "t",
  "𝘂": "u",
  "𝘃": "v",
  "𝘄": "w",
  "𝘅": "x",
  "𝘆": "y",
  "𝘇": "z",
  "𝗔": "A",
  "𝗕": "B",
  "𝗖": "C",
  "𝗗": "D",
  "𝗘": "E",
  "𝗙": "F",
  "𝗚": "G",
  "𝗛": "H",
  "𝗜": "I",
  "𝗝": "J",
  "𝗞": "K",
  "𝗟": "L",
  "𝗠": "M",
  "𝗡": "N",
  "𝗢": "O",
  "𝗣": "P",
  "𝗤": "Q",
  "𝗥": "R",
  "𝗦": "S",
  "𝗧": "T",
  "𝗨": "U",
  "𝗩": "V",
  "𝗪": "W",
  "𝗫": "X",
  "𝗬": "Y",
  "𝗭": "Z",
  "𝖺": "a",
  "𝖻": "b",
  "𝖼": "c",
  "𝖽": "d",
  "𝖾": "e",
  "𝖿": "f",
  "𝗀": "g",
  "𝗁": "h",
  "𝗂": "i",
  "𝗃": "j",
  "𝗄": "k",
  "𝗅": "l",
  "𝗆": "m",
  "𝗇": "n",
  "𝗈": "o",
  "𝗉": "p",
  "𝗊": "q",
  "𝗋": "r",
  "𝗌": "s",
  "𝗍": "t",
  "𝗎": "u",
  "𝗏": "v",
  "𝗐": "w",
  "𝗑": "x",
  "𝗒": "y",
  "𝗓": "z",
  "𝖠": "A",
  "𝖡": "B",
  "𝖢": "C",
  "𝖣": "D",
  "𝖤": "E",
  "𝖥": "F",
  "𝖦": "G",
  "𝖧": "H",
  "𝖨": "I",
  "𝖩": "J",
  "𝖪": "K",
  "𝖫": "L",
  "𝖬": "M",
  "𝖭": "N",
  "𝖮": "O",
  "𝖯": "P",
  "𝖰": "Q",
  "𝖱": "R",
  "𝖲": "S",
  "𝖳": "T",
  "𝖴": "U",
  "𝖵": "V",
  "𝖶": "W",
  "𝖷": "X",
  "𝖸": "Y",
  "𝖹": "Z",
  "𝟬": 0,
  "𝟭": 1,
  "𝟮": 2,
  "𝟯": 3,
  "𝟰": 4,
  "𝟱": 5,
  "𝟲": 6,
  "𝟳": 7,
  "𝟴": 8,
  "𝟵": 9,
  "𝟢": 0,
  "𝟣": 1,
  "𝟤": 2,
  "𝟥": 3,
  "𝟦": 4,
  "𝟧": 5,
  "𝟨": 6,
  "𝟩": 7,
  "𝟪": 8,
  "𝟫": 9,
};

const sans = {
  a: "𝖺",
  b: "𝖻",
  c: "𝖼",
  d: "𝖽",
  e: "𝖾",
  f: "𝖿",
  g: "𝗀",
  h: "𝗁",
  i: "𝗂",
  j: "𝗃",
  k: "𝗄",
  l: "𝗅",
  m: "𝗆",
  n: "𝗇",
  o: "𝗈",
  p: "𝗉",
  q: "𝗊",
  r: "𝗋",
  s: "𝗌",
  t: "𝗍",
  u: "𝗎",
  v: "𝗏",
  w: "𝗐",
  x: "𝗑",
  y: "𝗒",
  z: "𝗓",
  A: "𝖠",
  B: "𝖡",
  C: "𝖢",
  D: "𝖣",
  E: "𝖤",
  F: "𝖥",
  G: "𝖦",
  H: "𝖧",
  I: "𝖨",
  J: "𝖩",
  K: "𝖪",
  L: "𝖫",
  M: "𝖬",
  N: "𝖭",
  O: "𝖮",
  P: "𝖯",
  Q: "𝖰",
  R: "𝖱",
  S: "𝖲",
  T: "𝖳",
  U: "𝖴",
  V: "𝖵",
  W: "𝖶",
  X: "𝖷",
  Y: "𝖸",
  Z: "𝖹",
  0: "𝟢",
  1: "𝟣",
  2: "𝟤",
  3: "𝟥",
  4: "𝟦",
  5: "𝟧",
  6: "𝟨",
  7: "𝟩",
  8: "𝟪",
  9: "𝟫",
};

const bold = {
  a: "𝗮",
  b: "𝗯",
  c: "𝗰",
  d: "𝗱",
  e: "𝗲",
  f: "𝗳",
  g: "𝗴",
  h: "𝗵",
  i: "𝗶",
  j: "𝗷",
  k: "𝗸",
  l: "𝗹",
  m: "𝗺",
  n: "𝗻",
  o: "𝗼",
  p: "𝗽",
  q: "𝗾",
  r: "𝗿",
  s: "𝘀",
  t: "𝘁",
  u: "𝘂",
  v: "𝘃",
  w: "𝘄",
  x: "𝘅",
  y: "𝘆",
  z: "𝘇",
  A: "𝗔",
  B: "𝗕",
  C: "𝗖",
  D: "𝗗",
  E: "𝗘",
  F: "𝗙",
  G: "𝗚",
  H: "𝗛",
  I: "𝗜",
  J: "𝗝",
  K: "𝗞",
  L: "𝗟",
  M: "𝗠",
  N: "𝗡",
  O: "𝗢",
  P: "𝗣",
  Q: "𝗤",
  R: "𝗥",
  S: "𝗦",
  T: "𝗧",
  U: "𝗨",
  V: "𝗩",
  W: "𝗪",
  X: "𝗫",
  Y: "𝗬",
  Z: "𝗭",
  0: "𝟬",
  1: "𝟭",
  2: "𝟮",
  3: "𝟯",
  4: "𝟰",
  5: "𝟱",
  6: "𝟲",
  7: "𝟳",
  8: "𝟴",
  9: "𝟵",
};

class fonts {
  static sans(text) {
    return apply(text, sans);
  }
  static bold(text) {
    return apply(text, bold);
  }
  static origin(text) {
    return apply(text, origin);
  }
  static auto(text) {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const fancyRegex = /<<(.*?)>>/g;
    return text
      .replace(boldRegex, (_, text) => apply(text, bold))
      .replace(fancyRegex, (_, text) => apply(text, sans));
  }
}

function deepClone(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  } else if (typeof obj === "object" && obj !== null) {
    const clonedObj = {};
    Object.keys(obj).forEach((key) => {
      clonedObj[key] = deepClone(obj[key]);
    });
    return clonedObj;
  } else {
    return obj;
  }
}
function range(min, max, format = (i) => i) {
  const result = [];
  for (let i = min; i <= max; i++) {
    result.push({ [format(i)]: i });
  }
  return result.filter((obj) => typeof obj[Object.keys(obj)[0]] === "number");
}

function type(any) {
  if (any === null) {
    return "Null";
  }
  if (typeof any === "object") {
    return any.constructor.name;
  }
  switch (typeof any) {
    case "string":
      return "String";
    case "boolean":
      return "Boolean";
    case "number":
      return "Number";
    case "bigint":
      return "BigInt";
    case "symbol":
      return "Symbol";
    case "undefined":
      return "Undefined";
  }
  return typeof any;
}
const True = true;
const False = false;
const None = undefined;

function randObjValue(obj) {
  return obj[Math.floor(Math.random() * Object.keys(obj).length)];
}

function randObjKey(obj) {
  return Object.keys(obj)[Math.floor(Math.random() * Object.keys(obj).length)];
}

class FuncUtil extends Function {
  constructor(func) {
    super();
    this.func = func;
  }
  static toAsync(func, onError) {
    const result = async function (...args) {
      try {
        await func(...args);
      } catch (err) {
        if (onError) {
          onError(err);
        } else {
          throw err;
        }
      }
    };
    return result;
  }
}

class XYZ {
  constructor({ limX, limY, limZ, endLimX, endLimY, endLimZ }) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    Object.assign(this, {
      limX,
      limY,
      limZ,
      endLimX,
      endLimY,
      endLimZ,
    });
  }

  limit() {
    if (this.x < this.limX) {
      this.x = this.limX;
    }
    if (this.y < this.limY) {
      this.y = this.limY;
    }
    if (this.z < this.limZ) {
      this.z = this.limZ;
    }
    if (this.x > this.endLimX) {
      this.x = this.endLimX;
    }
    if (this.y > this.endLimY) {
      this.y = this.endLimY;
    }
    if (this.z > this.endLimZ) {
      this.z = this.endLimZ;
    }
  }
  move(x = 0, y = 0, z = 0) {
    this.x += x || 0;
    this.y += y || 0;
    this.z += z || 0;
    this.limit();
  }
  teleport(x = this.x, y = this.y, z = this.z) {
    this.x = x || this.x;
    this.y = y || this.y;
    this.z = z || this.z;
    this.limit();
  }
  get array() {
    return [this.x, this.y, this.z];
  }
  set array([x, y, z]) {
    this.teleport(x, y, z);
  }
  toString() {
    return `XYZ(${this.x}, ${this.y}, ${this.z})`;
  }
  toObject() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
    };
  }
  toJSON() {
    return this.toObject();
  }
  getJson() {
    return JSON.stringify(this.toObject());
  }
  clone() {
    return new XYZ(...this);
  }
}

function objIndex(obj, index) {
  const i = parseInt(index);
  if (isNaN(i)) {
    return obj[index];
  }
  return obj[Object.keys(obj)[i]] || obj[i];
}

function isArray(arr) {
  return Array.isArray(arr);
}

function isNumber(num) {
  return typeof num === "number" && !isNaN(num);
}

function calcChiSquare(observed, expected) {
  if (!isArray(expected)) {
    const mean = observed.reduce((a, b) => a + b) / observed.length;
    expected = Array(observed.length).fill(mean);
  }

  if (!isArray(observed) || !isArray(expected)) {
    throw new Error(`Observed and Expected must be arrays.`);
  }

  if (observed.length !== expected.length) {
    throw new Error(`Observed and Expected arrays must have the same length.`);
  }

  for (const num of [...observed, ...expected]) {
    if (!isNumber(num)) {
      throw new Error(`Observed and Expected values must be numbers.`);
    }
  }

  const chiSquare = observed.reduce((sum, obs, index) => {
    const diff = obs - expected[index];
    return sum + (diff * diff) / expected[index];
  }, 0);

  return chiSquare;
}
function reverseKeyValue(obj) {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("Input must be an object.");
  }

  const reversedObj = {};
  for (const key in obj) {
    const value = obj[key];
    reversedObj[value] = key;
  }
  return reversedObj;
}
const ObjectX = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop in Object) {
        return Object[prop].bind(target);
      } else if (prop in Array.prototype) {
        return function (targetObject, ...args) {
          const keys = Object.keys(targetObject);
          const result = Array.prototype[prop].apply(keys, args);
          return result instanceof Array
            ? result.reduce((acc, key) => {
                acc[key] = targetObject[key];
                return acc;
              }, {})
            : result;
        };
      } else {
        throw new Error(`Method ${prop} is not supported.`);
      }
    },
  }
);
function pearsonsR(arrayA, arrayB) {
  if (arrayA.length !== arrayB.length) {
    throw new Error("Arrays must have the same length");
  }

  const meanA = arrayA.reduce((acc, val) => acc + val, 0) / arrayA.length;
  const meanB = arrayB.reduce((acc, val) => acc + val, 0) / arrayB.length;

  let numerator = 0;
  let denominatorA = 0;
  let denominatorB = 0;

  for (let i = 0; i < arrayA.length; i++) {
    const deviationA = arrayA[i] - meanA;
    const deviationB = arrayB[i] - meanB;

    numerator += deviationA * deviationB;
    denominatorA += Math.pow(deviationA, 2);
    denominatorB += Math.pow(deviationB, 2);
  }

  const correlation = numerator / Math.sqrt(denominatorA * denominatorB);

  return correlation;
}

async function compareCode(code1, code2, callback = async () => {}) {
  const axios = require("axios");

  async function fetchCode(rawLink) {
    try {
      const response = await axios.get(rawLink);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching code from ${rawLink}: ${error.message}`);
    }
  }

  if (code1.startsWith("http")) {
    code1 = await fetchCode(code1);
  }
  if (code2.startsWith("http")) {
    code2 = await fetchCode(code2);
  }

  const lines1 = code1.split("\n");
  const lines2 = code2.split("\n");

  let diffString = "";
  let status = "unchanged";
  let unchangedCount = 0;

  for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
    const line1 = lines1[i]?.trim().split(/\s+/);
    const line2 = lines2[i]?.trim().split(/\s+/);

    if (line1?.join("") === line2?.join("")) {
      unchangedCount++;
      if (status === "added") {
        diffString += "-----------------\n";
        status = "unchanged";
      }
    } else {
      if (status === "unchanged") {
        if (unchangedCount > 0) {
          diffString += `...${unchangedCount} unchanged lines\n`;
        }
        unchangedCount = 0;
        status = "added";
        diffString += "----ADDED----\n";
      }
      if (line1?.join("") !== undefined) {
        diffString += `${lines1[i].trim()}\n`;
      }
    }
  }

  if (unchangedCount > 0) {
    diffString += `...${unchangedCount} unchanged lines\n`;
  }

  const removedLines = lines1
    .slice(lines2.length)
    .filter((line) => line.trim());
  if (removedLines.length > 0) {
    diffString += "--REMOVED--\n";
    removedLines.forEach((line) => {
      diffString += `${line.trim()}\n`;
    });
  }

  await callback(status, diffString);
  return { status, diffString };
}
function formatBits(size) {
  const units = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let index = 0;
  let formattedSize = size;

  while (formattedSize >= 1024 && index < units.length - 1) {
    formattedSize /= 1024;
    index++;
  }

  return `${formattedSize.toFixed(2)} ${units[index]}`;
}
function deformatBits(sizeStr) {
  const units = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const unitRegex = new RegExp(
    `^\\s*([0-9]+(?:\\.[0-9]+)?)\\s*(${units.join("|")})\\s*$`,
    "i"
  );
  const match = sizeStr.match(unitRegex);

  if (!match) {
    throw new Error("Invalid size format");
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const unitIndex = units.indexOf(unit);

  if (unitIndex === -1) {
    throw new Error("Invalid unit");
  }

  return Math.round(value * Math.pow(1024, unitIndex));
}
// issue: advanced 9 hours and 18 minutes
function formatTimeDiff(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  const remainingDays = days % 30;
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  return {
    years,
    months,
    days: remainingDays,
    hours: remainingHours,
    minutes: remainingMinutes,
    seconds: remainingSeconds,
  };
}
const betterLog = (initialContent) => {
  // Define replaceLog function inside betterLog to encapsulate currentContent
  const replaceLog = (newContent) => {
    let currentContent = initialContent;

    const contentLength = currentContent.length;

    process.stdout.write(`\u001b[${contentLength}A`);

    for (let i = 0; i < contentLength; i++) {
      process.stdout.write("\r\x1b[K");
    }

    process.stdout.write(newContent + "\n");

    // Update currentContent for this instance
    currentContent = newContent;
  };

  // Log initial content
  replaceLog(initialContent);

  return replaceLog;
};

function minimizeErrStack(stack) {
  const stackLines = stack.split("\n");
  const numHiddenStacks = Math.max(0, stackLines.length - 7);
  if (numHiddenStacks > 0) {
    stackLines.splice(
      1,
      numHiddenStacks,
      `(and ${numHiddenStacks} hidden stacks...)`
    );
  }
  for (let i = 1; i < stackLines.length - numHiddenStacks; i++) {
    const line = stackLines[i];
    const fileNameIndex = line.lastIndexOf("/");
    const lastFolderIndex = line.lastIndexOf("/", fileNameIndex - 1);
    const lineColumnIndex = line.lastIndexOf(":");
    const folder = line.substring(lastFolderIndex + 1, fileNameIndex);
    const fileName = line.substring(fileNameIndex + 1, lineColumnIndex);
    const functionIndex = line.lastIndexOf("at ") + 3;
    const functionName = line.substring(functionIndex, lineColumnIndex);
    stackLines[i] = `${folder}/${fileName} (${functionName})${line.substring(
      lineColumnIndex
    )}`;
  }
  return stackLines.join("\n");
}
class UserSorter {
  constructor({ users, limit = null, sortBy = "money", defaultValue = 0 }) {
    this.users = users;
    this.limit = limit;
    this.sortBy = sortBy;
    this.defaultValue = defaultValue;
  }

  sortUsers() {
    let result = {};
    let sortedKeys = Object.keys(this.users).sort(
      (a, b) =>
        Number(this.users[b][this.sortBy] ?? this.defaultValue) -
        Number(this.users[a][this.sortBy] ?? this.defaultValue)
    );

    if (this.limit) {
      sortedKeys = sortedKeys.slice(0, this.limit);
    }

    for (const key of sortedKeys) {
      result[key] = this.users[key];
    }

    return result;
  }

  getTop(id) {
    const sorted = this.sortUsers();
    return Object.keys(sorted).findIndex((key) => key === id) + 1;
  }
}

function parseCurrency(num) {
  num = num > 1e9 ? BigInt(Math.floor(num)) : Number(num);
  let result1 = String(num).split(".");
  let integerPart = result1[0];

  if (typeof num === "bigint") {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  let result =
    result1.length > 1 ? integerPart + "." + result1[1] : integerPart;
  return result;
}

function isNumberUnsafe(num) {
  return !!(
    isNaN(num) ||
    !isFinite(num) ||
    num < 0 ||
    num > Number.MAX_SAFE_INTEGER
  );
}
function representObject(obj, depth = 0) {
  const indent = "=> ".repeat(depth);
  let result = "";

  Object.keys(obj).forEach((key, index, keys) => {
    const value = obj[key];

    // Top level representation
    if (depth === 0) {
      result += `${indent}key: "${key}"\n`;
      result += `${indent}value: `;
    } else {
      // Inner level representation
      if (Array.isArray(obj)) {
        result += `${indent}index(${key}): `;
      } else {
        result += `${indent}key: ${key}: `;
      }
    }

    if (Array.isArray(value)) {
      result += `Array(${value.length})\n`;
      value.forEach((item, idx) => {
        if (typeof item === "object" && item !== null) {
          result += representObject(item, depth + 1); // Recursive representation
        } else {
          result += `${indent}==> index(${idx}): `;
          result += typeof item === "string" ? `'${item}'\n` : `${item}\n`; // Single quotes around strings
        }
      });
    } else if (typeof value === "object" && value !== null) {
      result += "Object\n";
      result += representObject(value, depth + 1); // Recursive representation
    } else {
      result += typeof value === "string" ? `'${value}'\n` : `${value}\n`; // Single quotes around strings
    }

    if (depth === 0 && index < keys.length - 1) {
      result += "\n"; // Extra line between top-level key-value pairs
    }
  });

  return result;
}
function convertTimeSentence({ years, months, days, hours, minutes, seconds }) {
  const parts = [];

  if (years !== 0) {
    parts.push(`${years} year${years !== 1 ? "s" : ""}`);
  }
  if (months !== 0) {
    parts.push(`${months} month${months !== 1 ? "s" : ""}`);
  }
  if (days !== 0) {
    parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  }
  if (hours !== 0) {
    parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  }
  if (minutes !== 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  }
  if (seconds !== 0) {
    parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
  }

  return parts.join(", ");
}
function generateCaptchaCode(length = 6) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    captcha += characters[randomIndex];
  }

  return captcha;
}

const StylerGlobal = require("./handlers/styler.js/main.js");

// gbot
const cheerio = require("cheerio");
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
const moment = require("moment-timezone");
const mimeDB = require("mime-db");
const _ = require("lodash");
const word = [
  "A",
  "Á",
  "À",
  "Ả",
  "Ã",
  "Ạ",
  "a",
  "á",
  "à",
  "ả",
  "ã",
  "ạ",
  "Ă",
  "Ắ",
  "Ằ",
  "Ẳ",
  "Ẵ",
  "Ặ",
  "ă",
  "ắ",
  "ằ",
  "ẳ",
  "ẵ",
  "ặ",
  "Â",
  "Ấ",
  "Ầ",
  "Ẩ",
  "Ẫ",
  "Ậ",
  "â",
  "ấ",
  "ầ",
  "ẩ",
  "ẫ",
  "ậ",
  "B",
  "b",
  "C",
  "c",
  "D",
  "Đ",
  "d",
  "đ",
  "E",
  "É",
  "È",
  "Ẻ",
  "Ẽ",
  "Ẹ",
  "e",
  "é",
  "è",
  "ẻ",
  "ẽ",
  "ẹ",
  "Ê",
  "Ế",
  "Ề",
  "Ể",
  "Ễ",
  "Ệ",
  "ê",
  "ế",
  "ề",
  "ể",
  "ễ",
  "ệ",
  "F",
  "f",
  "G",
  "g",
  "H",
  "h",
  "I",
  "Í",
  "Ì",
  "Ỉ",
  "Ĩ",
  "Ị",
  "i",
  "í",
  "ì",
  "ỉ",
  "ĩ",
  "ị",
  "J",
  "j",
  "K",
  "k",
  "L",
  "l",
  "M",
  "m",
  "N",
  "n",
  "O",
  "Ó",
  "Ò",
  "Ỏ",
  "Õ",
  "Ọ",
  "o",
  "ó",
  "ò",
  "ỏ",
  "õ",
  "ọ",
  "Ô",
  "Ố",
  "Ồ",
  "Ổ",
  "Ỗ",
  "Ộ",
  "ô",
  "ố",
  "ồ",
  "ổ",
  "ỗ",
  "ộ",
  "Ơ",
  "Ớ",
  "Ờ",
  "Ở",
  "Ỡ",
  "Ợ",
  "ơ",
  "ớ",
  "ờ",
  "ở",
  "ỡ",
  "ợ",
  "P",
  "p",
  "Q",
  "q",
  "R",
  "r",
  "S",
  "s",
  "T",
  "t",
  "U",
  "Ú",
  "Ù",
  "Ủ",
  "Ũ",
  "Ụ",
  "u",
  "ú",
  "ù",
  "ủ",
  "ũ",
  "ụ",
  "Ư",
  "Ứ",
  "Ừ",
  "Ử",
  "Ữ",
  "Ự",
  "ư",
  "ứ",
  "ừ",
  "ử",
  "ữ",
  "ự",
  "V",
  "v",
  "W",
  "w",
  "X",
  "x",
  "Y",
  "Ý",
  "Ỳ",
  "Ỷ",
  "Ỹ",
  "Ỵ",
  "y",
  "ý",
  "ỳ",
  "ỷ",
  "ỹ",
  "ỵ",
  "Z",
  "z",
  " ",
];

const regCheckURL =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

class CustomError extends Error {
  constructor(obj) {
    if (typeof obj === "string") obj = { message: obj };
    if (typeof obj !== "object" || obj === null)
      throw new TypeError("Object required");
    obj.message ? super(obj.message) : super();
    Object.assign(this, obj);
  }
}

function lengthWhiteSpacesEndLine(text) {
  let length = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] == " ") length++;
    else break;
  }
  return length;
}

function lengthWhiteSpacesStartLine(text) {
  let length = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] == " ") length++;
    else break;
  }
  return length;
}

function setErrorUptime() {
  global.statusAccountBot = "block spam";
  global.responseUptimeCurrent = global.responseUptimeError;
}
const defaultStderrClearLine = process.stderr.clearLine;

function convertTime(
  miliSeconds,
  replaceSeconds = "s",
  replaceMinutes = "m",
  replaceHours = "h",
  replaceDays = "d",
  replaceMonths = "M",
  replaceYears = "y",
  notShowZero = false
) {
  if (typeof replaceSeconds == "boolean") {
    notShowZero = replaceSeconds;
    replaceSeconds = "s";
  }
  const second = Math.floor((miliSeconds / 1000) % 60);
  const minute = Math.floor((miliSeconds / 1000 / 60) % 60);
  const hour = Math.floor((miliSeconds / 1000 / 60 / 60) % 24);
  const day = Math.floor((miliSeconds / 1000 / 60 / 60 / 24) % 30);
  const month = Math.floor((miliSeconds / 1000 / 60 / 60 / 24 / 30) % 12);
  const year = Math.floor(miliSeconds / 1000 / 60 / 60 / 24 / 30 / 12);
  let formattedDate = "";

  const dateParts = [
    { value: year, replace: replaceYears },
    { value: month, replace: replaceMonths },
    { value: day, replace: replaceDays },
    { value: hour, replace: replaceHours },
    { value: minute, replace: replaceMinutes },
    { value: second, replace: replaceSeconds },
  ];

  for (let i = 0; i < dateParts.length; i++) {
    const datePart = dateParts[i];
    if (datePart.value) formattedDate += datePart.value + datePart.replace;
    else if (formattedDate != "") formattedDate += "00" + datePart.replace;
    else if (i == dateParts.length - 1) formattedDate += "0" + datePart.replace;
  }

  if (formattedDate == "") formattedDate = "0" + replaceSeconds;

  if (notShowZero) formattedDate = formattedDate.replace(/00\w+/g, "");

  return formattedDate;
}

class TaskQueue {
  constructor(callback) {
    this.queue = [];
    this.running = null;
    this.callback = callback;
  }
  push(task) {
    this.queue.push(task);
    if (this.queue.length == 1) this.next();
  }
  next() {
    if (this.queue.length > 0) {
      const task = this.queue[0];
      this.running = task;
      this.callback(task, async (err, result) => {
        this.running = null;
        this.queue.shift();
        this.next();
      });
    }
  }
  length() {
    return this.queue.length;
  }
}

function formatNumber(number) {
  const regionCode = global.GoatBot.config.language;
  if (isNaN(number))
    throw new Error("The first argument (number) must be a number");

  number = Number(number);
  return number.toLocaleString(regionCode || "en-US");
}

function getExtFromAttachmentType(type) {
  switch (type) {
    case "photo":
      return "png";
    case "animated_image":
      return "gif";
    case "video":
      return "mp4";
    case "audio":
      return "mp3";
    default:
      return "txt";
  }
}

function getExtFromMimeType(mimeType = "") {
  return mimeDB[mimeType]
    ? (mimeDB[mimeType].extensions || [])[0] || "unknow"
    : "unknow";
}

function getExtFromUrl(url = "") {
  if (!url || typeof url !== "string")
    throw new Error("The first argument (url) must be a string");
  const reg =
    /(?<=https:\/\/cdn.fbsbx.com\/v\/.*?\/|https:\/\/video.xx.fbcdn.net\/v\/.*?\/|https:\/\/scontent.xx.fbcdn.net\/v\/.*?\/).*?(\/|\?)/g;
  const fileName = url.match(reg)[0].slice(0, -1);
  return fileName.slice(fileName.lastIndexOf(".") + 1);
}

function getPrefix(threadID) {
  if (!threadID || isNaN(threadID))
    throw new Error("The first argument (threadID) must be a number");
  threadID = String(threadID);
  let prefix = global.Cassidy.config.PREFIX;
  const threadData = global.db.allThreadData.find(
    (t) => t.threadID == threadID
  );
  if (threadData) prefix = threadData.data.prefix || prefix;
  return prefix;
}

function getTime(timestamps, format) {
  if (!format && typeof timestamps == "string") {
    format = timestamps;
    timestamps = undefined;
  }
  return moment(timestamps).tz("Asia/Manila").format(format);
}

/**
 * @param {any} value
 * @returns {("Null" | "Undefined" | "Boolean" | "Number" | "String" | "Symbol" | "Object" | "Function" | "AsyncFunction" | "Array" | "Date" | "RegExp" | "Error" | "Map" | "Set" | "WeakMap" | "WeakSet" | "Int8Array" | "Uint8Array" | "Uint8ClampedArray" | "Int16Array" | "Uint16Array" | "Int32Array" | "Uint32Array" | "Float32Array" | "Float64Array" | "BigInt" | "BigInt64Array" | "BigUint64Array")}
 */
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

function isNumber(value) {
  return !isNaN(parseFloat(value));
}
function randomString(max, onlyOnce = false, possible) {
  if (!max || isNaN(max)) max = 10;
  let text = "";
  possible =
    possible ||
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < max; i++) {
    let random = Math.floor(Math.random() * possible.length);
    if (onlyOnce) {
      while (text.includes(possible[random]))
        random = Math.floor(Math.random() * possible.length);
    }
    text += possible[random];
  }
  return text;
}

function randomNumber(min, max) {
  if (!max) {
    max = min;
    min = 0;
  }
  if (min == null || min == undefined || isNaN(min))
    throw new Error("The first argument (min) must be a number");
  if (max == null || max == undefined || isNaN(max))
    throw new Error("The second argument (max) must be a number");
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function removeHomeDir(fullPath) {
  if (!fullPath || typeof fullPath !== "string")
    throw new Error("The first argument (fullPath) must be a string");
  while (fullPath.includes(process.cwd()))
    fullPath = fullPath.replace(process.cwd(), "");
  return fullPath;
}

function splitPage(arr, limit) {
  const allPage = _.chunk(arr, limit);
  return {
    totalPage: allPage.length,
    allPage,
  };
}

async function translateAPI(text, lang) {
  try {
    const res = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(
        text
      )}`
    );
    return res.data[0][0][0];
  } catch (err) {
    throw new CustomError(err.response ? err.response.data : err);
  }
}

async function downloadFile(url = "", path = "") {
  if (!url || typeof url !== "string")
    throw new Error(`The first argument (url) must be a string`);
  if (!path || typeof path !== "string")
    throw new Error(`The second argument (path) must be a string`);
  let getFile;
  try {
    getFile = await axios.get(url, {
      responseType: "arraybuffer",
    });
  } catch (err) {
    throw new CustomError(err.response ? err.response.data : err);
  }
  fs.writeFileSync(path, Buffer.from(getFile.data));
  return path;
}

async function findUid(link) {
  try {
    const response = await axios.post(
      "https://seomagnifier.com/fbid",
      new URLSearchParams({
        facebook: "1",
        sitelink: link,
      }),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          Cookie: "PHPSESSID=0d8feddd151431cf35ccb0522b056dc6",
        },
      }
    );
    const id = response.data;
    if (isNaN(id)) {
      const html = await axios.get(link);
      const $ = cheerio.load(html.data);
      const el = $('meta[property="al:android:url"]').attr("content");
      if (!el) {
        throw new Error("UID not found");
      }
      const number = el.split("/").pop();
      return number;
    }
    return id;
  } catch (error) {
    throw new Error("An unexpected error occurred. Please try again.");
  }
}

async function getStreamsFromAttachment(attachments) {
  const streams = [];
  for (const attachment of attachments) {
    const url = attachment.url;
    const ext = goatbotUtils.getExtFromUrl(url);
    const fileName = `${goatbotUtils.randomString(10)}.${ext}`;
    streams.push({
      pending: axios({
        url,
        method: "GET",
        responseType: "stream",
      }),
      fileName,
    });
  }
  for (let i = 0; i < streams.length; i++) {
    const stream = await streams[i].pending;
    stream.data.path = streams[i].fileName;
    streams[i] = stream.data;
  }
  return streams;
}

async function getStreamFromURL(url = "", pathName = "", options = {}) {
  if (!options && typeof pathName === "object") {
    options = pathName;
    pathName = "";
  }
  try {
    if (!url || typeof url !== "string")
      throw new Error(`The first argument (url) must be a string`);
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      ...options,
    });
    if (!pathName)
      pathName =
        goatbotUtils.randomString(10) +
        (response.headers["content-type"]
          ? "." +
            goatbotUtils.getExtFromMimeType(response.headers["content-type"])
          : ".noext");
    response.data.path = pathName;
    return response.data;
  } catch (err) {
    throw err;
  }
}

async function translate(text, lang) {
  if (typeof text !== "string")
    throw new Error(`The first argument (text) must be a string`);
  if (!lang) lang = "en";
  if (typeof lang !== "string")
    throw new Error(`The second argument (lang) must be a string`);
  const wordTranslate = [""];
  const wordNoTranslate = [""];
  const wordTransAfter = [];
  let lastPosition = "wordTranslate";

  if (word.indexOf(text.charAt(0)) == -1) wordTranslate.push("");
  else wordNoTranslate.splice(0, 1);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (word.indexOf(char) !== -1) {
      // is word
      const lengWordNoTranslate = wordNoTranslate.length - 1;
      if (
        wordNoTranslate[lengWordNoTranslate] &&
        wordNoTranslate[lengWordNoTranslate].includes("{") &&
        !wordNoTranslate[lengWordNoTranslate].includes("}")
      ) {
        wordNoTranslate[lengWordNoTranslate] += char;
        continue;
      }
      const lengWordTranslate = wordTranslate.length - 1;
      if (lastPosition == "wordTranslate") {
        wordTranslate[lengWordTranslate] += char;
      } else {
        wordTranslate.push(char);
        lastPosition = "wordTranslate";
      }
    } else {
      // is no word
      const lengWordNoTranslate = wordNoTranslate.length - 1;
      const twoWordLast = wordNoTranslate[lengWordNoTranslate]?.slice(-2) || "";
      if (lastPosition == "wordNoTranslate") {
        if (twoWordLast == "}}") {
          wordTranslate.push("");
          wordNoTranslate.push(char);
        } else wordNoTranslate[lengWordNoTranslate] += char;
      } else {
        wordNoTranslate.push(char);
        lastPosition = "wordNoTranslate";
      }
    }
  }

  for (let i = 0; i < wordTranslate.length; i++) {
    const text = wordTranslate[i];
    if (!text.match(/[^\s]+/)) wordTransAfter.push(text);
    else wordTransAfter.push(goatbotUtils.translateAPI(text, lang));
  }

  let output = "";

  for (let i = 0; i < wordTransAfter.length; i++) {
    let wordTrans = await wordTransAfter[i];
    if (wordTrans.trim().length === 0) {
      output += wordTrans;
      if (wordNoTranslate[i] != undefined) output += wordNoTranslate[i];
      continue;
    }

    wordTrans = wordTrans.trim();
    const numberStartSpace = lengthWhiteSpacesStartLine(wordTranslate[i]);
    const numberEndSpace = lengthWhiteSpacesEndLine(wordTranslate[i]);

    wordTrans =
      " ".repeat(numberStartSpace) +
      wordTrans.trim() +
      " ".repeat(numberEndSpace);

    output += wordTrans;
    if (wordNoTranslate[i] != undefined) output += wordNoTranslate[i];
  }
  return output;
}

async function shortenURL(url) {
  try {
    const result = await axios.get(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
    );
    return result.data;
  } catch (err) {
    let error;
    if (err.response) {
      error = new Error();
      Object.assign(error, err.response.data);
    } else error = new Error(err.message);
  }
}

async function uploadImgbb(file /* stream or image url */) {
  let type = "file";
  try {
    if (!file)
      throw new Error(
        "The first argument (file) must be a stream or a image url"
      );
    if (regCheckURL.test(file) == true) type = "url";
    if (
      (type != "url" &&
        !(
          typeof file._read === "function" &&
          typeof file._readableState === "object"
        )) ||
      (type == "url" && !regCheckURL.test(file))
    )
      throw new Error(
        "The first argument (file) must be a stream or an image URL"
      );

    const res_ = await axios({
      method: "GET",
      url: "https://imgbb.com",
    });

    const auth_token = res_.data.match(/auth_token="([^"]+)"/)[1];
    const timestamp = Date.now();

    const res = await axios({
      method: "POST",
      url: "https://imgbb.com/json",
      headers: {
        "content-type": "multipart/form-data",
      },
      data: {
        source: file,
        type: type,
        action: "upload",
        timestamp: timestamp,
        auth_token: auth_token,
      },
    });

    return res.data;
    // {
    // 	"status_code": 200,
    // 	"success": {
    // 		"message": "image uploaded",
    // 		"code": 200
    // 	},
    // 	"image": {
    // 		"name": "Banner-Project-Goat-Bot",
    // 		"extension": "png",
    // 		"width": 2560,
    // 		"height": 1440,
    // 		"size": 194460,
    // 		"time": 1688352855,
    // 		"expiration": 0,
    // 		"likes": 0,
    // 		"description": null,
    // 		"original_filename": "Banner Project Goat Bot.png",
    // 		"is_animated": 0,
    // 		"is_360": 0,
    // 		"nsfw": 0,
    // 		"id_encoded": "D1yzzdr",
    // 		"size_formatted": "194.5 KB",
    // 		"filename": "Banner-Project-Goat-Bot.png",
    // 		"url": "https://i.ibb.co/wdXBBtc/Banner-Project-Goat-Bot.png",  // => this is url image
    // 		"url_viewer": "https://ibb.co/D1yzzdr",
    // 		"url_viewer_preview": "https://ibb.co/D1yzzdr",
    // 		"url_viewer_thumb": "https://ibb.co/D1yzzdr",
    // 		"image": {
    // 			"filename": "Banner-Project-Goat-Bot.png",
    // 			"name": "Banner-Project-Goat-Bot",
    // 			"mime": "image/png",
    // 			"extension": "png",
    // 			"url": "https://i.ibb.co/wdXBBtc/Banner-Project-Goat-Bot.png",
    // 			"size": 194460
    // 		},
    // 		"thumb": {
    // 			"filename": "Banner-Project-Goat-Bot.png",
    // 			"name": "Banner-Project-Goat-Bot",
    // 			"mime": "image/png",
    // 			"extension": "png",
    // 			"url": "https://i.ibb.co/D1yzzdr/Banner-Project-Goat-Bot.png"
    // 		},
    // 		"medium": {
    // 			"filename": "Banner-Project-Goat-Bot.png",
    // 			"name": "Banner-Project-Goat-Bot",
    // 			"mime": "image/png",
    // 			"extension": "png",
    // 			"url": "https://i.ibb.co/tHtQQRL/Banner-Project-Goat-Bot.png"
    // 		},
    // 		"display_url": "https://i.ibb.co/tHtQQRL/Banner-Project-Goat-Bot.png",
    // 		"display_width": 2560,
    // 		"display_height": 1440,
    // 		"delete_url": "https://ibb.co/D1yzzdr/<TOKEN>",
    // 		"views_label": "lượt xem",
    // 		"likes_label": "thích",
    // 		"how_long_ago": "mới đây",
    // 		"date_fixed_peer": "2023-07-03 02:54:15",
    // 		"title": "Banner-Project-Goat-Bot",
    // 		"title_truncated": "Banner-Project-Goat-Bot",
    // 		"title_truncated_html": "Banner-Project-Goat-Bot",
    // 		"is_use_loader": false
    // 	},
    // 	"request": {
    // 		"type": "file",
    // 		"action": "upload",
    // 		"timestamp": "1688352853967",
    // 		"auth_token": "a2606b39536a05a81bef15558bb0d61f7253dccb"
    // 	},
    // 	"status_txt": "OK"
    // }
  } catch (err) {
    throw new CustomError(err.response ? err.response.data : err);
  }
}

async function uploadZippyshare(stream) {
  const res = await axios({
    method: "POST",
    url: "https://api.zippysha.re/upload",
    httpsAgent: agent,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: {
      file: stream,
    },
  });

  const fullUrl = res.data.data.file.url.full;
  const res_ = await axios({
    method: "GET",
    url: fullUrl,
    httpsAgent: agent,
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.43",
    },
  });

  const downloadUrl = res_.data.match(
    /id="download-url"(?:.|\n)*?href="(.+?)"/
  )[1];
  res.data.data.file.url.download = downloadUrl;

  return res.data;
}
const goatbotUtils = {
  CustomError,
  TaskQueue,

  convertTime,
  defaultStderrClearLine,
  formatNumber,
  getExtFromAttachmentType,
  getExtFromMimeType,
  getExtFromUrl,
  getPrefix,
  getTime,
  getType,
  isNumber,

  randomString,
  randomNumber,
  removeHomeDir,
  splitPage,
  translateAPI,
  // async functions
  downloadFile,
  findUid,
  getStreamsFromAttachment,
  getStreamFromURL,
  getStreamFromUrl: getStreamFromURL,
  translate,
  shortenURL,
  uploadZippyshare,
  uploadImgbb,
};
import * as xaviaUtils from "./CommandFiles/modules/XaviaSupport/utils";

/**
 * @satisfies {globalThis["utils"]}
 */
const def = {
  ...goatbotUtils,
  xaviaUtils,
  ...xaviaUtils,
  goatbotUtils,
  generateCaptchaCode,
  convertTimeSentence,
  minimizeErrStack,
  UserSorter,
  isNumberUnsafe,
  formatTimeDiff,
  betterLog,
  parseCurrency,
  deformatBits,
  formatBits,
  compareCode,
  objIndex,
  representObject,
  pearsonsR,
  ObjectX,
  LiaSystem,
  ExtendClass,
  reverseKeyValue,
  XYZ,
  FuncUtil,
  randObjValue,
  randObjKey,
  True,
  False,
  None,
  chance,
  range,
  Cooldown,
  Prob,
  fonts,
  getRandomInt,
  randArrValue,
  randArrIndex,
  divideArray,
  getStreamFromURL,
  PythonDict,
  File,
  Integer,
  CassFile,
  createSafeProxy,
  UTYBattle,
  UTYPlayer,
  delay,
  syncCall,
  getUTY,
  SpecialFunc,
  ClassV,
  usePref,
  absoluteImport,
  type,
  calcChiSquare,
  MathNum,
  deepClone,
  classMaker,
  ClassExtra,
  Toggle,
  MusicTheory,
  stringArrayProxy,
  FileControl,
  Tiles,
  StylerGlobal,
};
//i should have used export named and import * as util from "./utils.js"
export default def;
