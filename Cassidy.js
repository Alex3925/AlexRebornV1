// @ts-check
/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/
import "dotenv/config";
import "./global";

import utils from "./utils.js";
// @ts-ignore;
global.utils = new Proxy(utils, {
  get(target, prop) {
    if (!(prop in target)) {
      throw new Error(
        `The "global.utils.${String(prop)}" property does not exist in Cassidy!`
      );
    }
    return target[prop];
  },
  set() {
    throw new Error(`The "global.utils" cannot be modified!`);
  },
});

import extend from "./extends.js";
extend();

const MEMORY_THRESHOLD = 500;
const WARNING_THRESHOLD = MEMORY_THRESHOLD * 0.75;
import { fontTag } from "./handlers/styler.js/main";
import cors from "cors";
import * as fs from "fs";

import { lookup } from "mime-types";
import { autoBold } from "cassidy-styler";

import __pkg from "./package.json";
global.package = __pkg;
global.logger = logger;
import { defineCommand, easyCMD } from "@cass/define";
import { MultiMap } from "@cass-modules/Multimap";
global.defineCommand = defineCommand;
global.easyCMD = easyCMD;

/**
 * @type {globalThis["Cassidy"]["commands"]}
 */
let commands = {};
const allPlugins = {};

import {
  removeCommandAliases,
  UNISpectra,
} from "./CommandFiles/modules/unisym.js";
import { ConsoleArray } from "@cass-modules/ConsoleArray";

const checkMemoryUsage = (normal) => {
  const memoryUsage = process.memoryUsage();
  const usedMemoryMB = memoryUsage.heapUsed / 1024 / 1024;
  if (usedMemoryMB > MEMORY_THRESHOLD) {
    console.warn(`High memory usage detected: ${usedMemoryMB.toFixed(2)} MB`);
  } else if (usedMemoryMB > WARNING_THRESHOLD) {
    console.warn(
      `Warning: Memory usage is at 75% of the threshold: ${usedMemoryMB.toFixed(
        2
      )} MB`
    );
  } else if (normal) {
    console.log(
      `Memory usage is within the threshold: ${usedMemoryMB.toFixed(2)} MB`
    );
  }
};
setInterval(() => checkMemoryUsage(false), 1000);
global.checkMemoryUsage = checkMemoryUsage;

process.on("unhandledRejection", (err) => {
  console.log(err);
});
process.on("uncaughtException", (err) => {
  console.log(err);
});
global.items = [];

global.webQuery = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
    },
    set(target, prop, value) {
      if (Object.keys(target).length > 30) {
        delete target[Object.keys(target)[0]];
      }
      target[prop] = value;
      setTimeout(() => {
        delete target[prop];
      }, 30 * 1000);
      return true;
    },
  }
);
const upt = performance.now();

global.require = require;

global.import = (m) => {
  return require("./" + m);
};

global.requireProc = (m) => {
  return require("./" + m);
};

const consoleDisplay = new ConsoleArray();

/**
 * @global
 */
global.Cassidy = {
  consoleDisplay,
  get config() {
    const cache = loadSettings();
    return new Proxy(cache, {
      get(_, prop) {
        const data = loadSettings();
        for (const [k, v] of Object.entries(data)) {
          cache[k] = v;
        }
        return data[prop];
      },
      set(_, prop, value) {
        const data = loadSettings();
        data[prop] = value;
        saveSettings(data);
        return true;
      },
      ownKeys(_) {
        const data = loadSettings();
        return Reflect.ownKeys(data);
      },
      has(_, key) {
        const data = loadSettings();
        return Reflect.has(data, key);
      },
      deleteProperty(_, prop) {
        const data = loadSettings();
        const a = delete data[prop];
        saveSettings(data);
        return a;
      },
      defineProperty(_, key, desc) {
        const data = loadSettings();
        Object.defineProperty(data, key, desc);
        saveSettings(data);
        return true;
      },
    });
  },
  set config(data) {
    saveSettings(data);
  },
  get uptime() {
    return performance.now() - upt;
  },
  plugins: allPlugins,
  get commands() {
    return commands;
  },
  set commands(data) {
    commands = data;
  },
  invLimit: 36,
  highRoll: Math.floor(Number.MAX_SAFE_INTEGER),
  presets: new Map(),
  loadCommand: null,
  loadPlugins: null,
  loadAllCommands: null,
  // reduxlogo: `🌌 𝗖𝗮𝘀𝘀𝗶𝗱𝘆ℝ𝕖𝕕𝕦𝕩 ✦`,
  get logo() {
    return autoBold(global.Cassidy.config.LOGO) || fontTag(UNISpectra.spectra);
  },
  spectra: true,
  oldLogo: `🔬 𝗖𝗮𝘀𝘀𝗶𝗱𝘆 𝖠𝗌𝗌𝗂𝗌𝗍𝖺𝗇𝖼𝖾`,
  accessToken: null,
  redux: true,
  hostedFilenames: [],
  replies: {},
  reacts: {},
  multiCommands: new MultiMap(),
};

const login = require(global.Cassidy.config.FCA.path);

import { loadCommand } from "./handlers/loaders/loadCommand.js";
import { loadPlugins } from "./handlers/loaders/loadPlugins.js";
import { middleware } from "./handlers/middleware/middleware.js";

global.Cassidy.loadCommand = loadCommand;
global.Cassidy.loadAllCommands = loadAllCommands;
global.Cassidy.loadPlugins = loadPlugins;

global.allPlugins = allPlugins;
global.commands = commands;
global.clearObj = clearObj;

function clearObj(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      delete obj[key];
    }
  }
}

/**
 * @param {any} text
 * @param {string} title
 * @param {(a: any, ...args: any[]) => any} func
 */
export function logger(text, title = "log", func = console.log) {
  const now = new Date();
  const options = { timeZone: "Asia/Manila", hour12: false };
  const time = now.toLocaleTimeString("en-PH", options);
  const message = `${time} [ ${title.toUpperCase()} ] - ${
    typeof text === "string" ? text : inspect(text)
  }`;

  func(message);
  return logger;
}

function loginHandler(obj) {
  return new Promise(async (resolve, reject) => {
    try {
      login(obj, (err, api) => {
        if (err) {
          reject(err);
          return;
        } else if (api) {
          resolve(api);
        }
        if (api === null) {
          reject(new Error("Login failed (Missing API)"));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
async function loginHelper(obj) {
  try {
    const result = await loginHandler({ appState: obj.appState });
    return result;
  } catch (err) {
    global.logger(err, "FCA");
  }
}

/**
 *
 * @returns {typeof import("./settings.json")}
 */
function loadSettings() {
  try {
    const data = fs.readFileSync("settings.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}
/**
 * @param {typeof import("./settings.json")} data
 */
function saveSettings(data) {
  try {
    fs.writeFileSync("settings.json", JSON.stringify(data, null, 2));
    return loadSettings();
  } catch (error) {
    return null;
  }
}

function loadCookie() {
  try {
    try {
      return JSON.parse(process.env.APPSTATE ?? process.env.COOKIE);
    } catch {}
    const file = fs.readFileSync("cookie.json", "utf8");
    return JSON.parse(file);
  } catch ({ message, stack }) {
    return null;
  }
}

/**
 *
 * @param {(err: Error | null, fileName: string) => any} callback
 * @returns {Promise<Record<string, Error> | false>}
 */
export async function loadAllCommands(callback = async () => {}) {
  commands = {};
  global.Cassidy.commands = {};
  global.Cassidy.multiCommands.clear();

  /**
   * @type {Record<string, Error>}
   */
  let errs = {};
  const fileNames = (await fs.promises.readdir("CommandFiles/commands")).filter(
    (file) => file.endsWith(".js") || file.endsWith(".ts")
  );

  Object.keys(require.cache).forEach((i) => {
    delete require.cache[i];
  });

  // const commandPromises = fileNames.map(async (fileName) => {
  //   try {
  //     const e = await loadCommand(fileName, commands);
  //     // @ts-ignore
  //     await callback(e, fileName);
  //     checkMemoryUsage(true);
  //     if (e) {
  //       errs["command:" + fileName] = e;
  //     }
  //   } catch (error) {
  //     errs["command:" + fileName] = error;
  //   }
  // });

  for (const fileName of fileNames) {
    try {
      const e = await loadCommand(fileName, commands);
      if (e instanceof Error) {
        await callback(e, fileName);
      }
      checkMemoryUsage(true);
      if (e instanceof Error) {
        errs["command:" + fileName] = e;
      }
    } catch (error) {
      errs["command:" + fileName] = error;
    }
  }

  // await Promise.allSettled(commandPromises);

  return Object.keys(errs).length === 0 ? false : errs;
}

let willAccept = false;
async function main() {
  let loginErr;

  logger(`Cassidy ${__pkg.version}`, "Info");
  logger(
    `The CassidySpectra is currently in development and is also unstable. Some features might not work as expected.`,
    "WARN"
  );
  const loadLog = logger("Loading settings...", "Info");

  /**
   * @type {import("./settings.json")}
   */
  // @ts-ignore
  const settings = new Proxy(
    {},
    {
      get(_, prop) {
        return loadSettings()[prop];
      },
    }
  );
  if (!settings) {
    loadLog(
      "No settings found, please check if the settings are properly configured.",
      "Info"
    );
  } else {
    loadLog("Settings loaded!", "Info");
  }
  loadLog("Loading cookie...", "Cookie");
  const cookie = loadCookie();
  if (!cookie) {
    loadLog("No cookie found.", "Cookie");
    loadLog("Please check if cookie.json exists or a valid json.", "Cookie");
  }
  loadLog("Found cookie.", "Cookie");
  logger("Logging in...", "FCA");
  let api;
  try {
    let { email = "", password = "" } = settings.credentials || {};
    const { email_asEnvKey, password_asEnvKey } = settings.credentials || {};
    if (email_asEnvKey) {
      email = process.env[email];
    }
    if (password_asEnvKey) {
      password = process.env[password];
    }
    if (
      !(process.env["test"] || settings.noFB || String(cookie) === "uwu") &&
      (cookie || (email && password))
    ) {
      api = await loginHelper({ appState: cookie, email, password });
      delete settings.FCA.path;
      api.setOptions(settings.FCA);
      logger("Logged in successfully.", "FCA");
    } else {
      logger(
        "Skipping facebook login, no cookie or valid credentials found or FB Login was disabled.",
        "FCA"
      );
    }
  } catch (error) {
    logger("Error logging in.", "FCA");
    loginErr = error;
  }

  try {
    if (api) {
      logger(`Refreshing cookie...`);
      const newApp = api.getAppState();
      fs.writeFileSync("cookie.json", JSON.stringify(newApp, null, 2));
      let done = [];
      for (const name in commands) {
        const { meta, onLogin } = commands[name];
        if (done.includes(meta.name)) {
          continue;
        }
        done.push(meta.name);
        if (typeof onLogin === "function") {
          try {
            await onLogin({ api });
          } catch (err) {
            console.log(err);
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
  let awaitedMiddleware;
  const funcListen = async (err, event, extra = {}) => {
    if (!willAccept || !awaitedMiddleware) {
      return;
    }
    if (err || !event) {
      logger(err, "FCA");
      return;
    }

    try {
      awaitedMiddleware({
        api,
        event,
        commands,
        prefix: settings.PREFIX,
        ...(extra.pageApi ? { pageApi: extra.pageApi } : {}),
        ...(extra.discordApi ? { discordApi: extra.discordApi } : {}),
        ...(extra.tphApi
          ? {
              tphApi: extra.tphApi,
            }
          : {}),
        ...(extra.wssApi
          ? {
              wssApi: extra.wssApi,
            }
          : {}),
      });
    } catch (error) {
      logger(error.stack, "FCA");
    }
  };
  web(api, funcListen, settings);
  loadLog("Loading plugins");
  const pPro = loadPlugins(allPlugins);

  await pPro;
  awaitedMiddleware = await middleware({ allPlugins });

  logger("Loading commands");
  const cPro = loadAllCommands();
  await cPro;

  willAccept = true;
  logger("Listener Started!", "LISTEN");

  try {
    setupAutoRestart();
    await setupCommands();
  } catch (error) {
    console.error(error);
  }

  return logSummary(api, settings, cookie, loginErr);
}
import request from "request";

function setupAutoRestart() {
  const { mqttRestart } = global.Cassidy.config;
  if (mqttRestart?.enabled) {
    const interval = mqttRestart.interval || 3600000;
    logger(
      `Auto-restart enabled. Restarting every ${interval / 1000 / 60} minutes.`,
      "AUTORESTART"
    );
    setInterval(restartProcess, interval);
  }
}

function restartProcess() {
  logger("Restarting the process...", "AUTORESTART");
  process.exit(3);
}

async function setupCommands() {
  const pageAccessToken = global.Cassidy.config.pageAccessToken;
  if (!pageAccessToken) return;

  const commandsData = {
    commands: [
      {
        locale: "default",
        commands: Array.from(
          Object.values(removeCommandAliases(global.Cassidy.commands))
        ).map((command) => ({
          name: String(command.meta.name).slice(0, 32),
          description:
            `${command.meta.description} (by ${command.meta.author})`.slice(
              0,
              64
            ),
        })),
      },
    ],
  };
  console.log(JSON.stringify(commandsData, null, 2));

  return new Promise((resolve, reject) => {
    request(
      {
        uri: `https://graph.facebook.com/v21.0/me/messenger_profile`,
        qs: { access_token: pageAccessToken },
        method: "POST",
        json: commandsData,
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          console.log("Commands set successfully:", body);
          resolve(body);
        } else {
          console.error("Error setting commands:", error || body.error);
          reject(error || body.error);
        }
      }
    );
  });
}
import {
  Listener,
  genericPage,
  aiPage,
  formatIP,
  takeScreenshot,
} from "./webSystem.js";
import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { postState } from "./handlers/appstate/handleGetState.js";
import requestIp from "request-ip";
import bodyParser from "body-parser";
import fetchMeta from "./CommandFiles/modules/fetchMeta.js";
import { TempFile } from "./handlers/page/sendMessage";
import { inspect } from "util";
import getCUser from "@cass-modules/XaviaSupport/User";
const { UTYPlayer } = global.utils;

const limit = {
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator(/* req, res */) {
    return "fake502";
  },
  handler(_, res /*, next*/) {
    res.status(502).send(fs.readFileSync("public/502.html", "utf8"));
  },
};
const fake502 = rateLimit(limit);

/**
 *
 * @param {CommandContext["api"]} api
 * @param {(err: any, event: any, extra: any) => any} funcListen
 * @param {unknown} _
 */
function web(api, funcListen, _) {
  global.controllers = {
    Users: getCUser(api),
  };
  global.api = api;
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "200mb" }));

  const listener = new Listener({ api, app });
  listener.startListen(funcListen);
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use((req, _, next) => {
    req.trueIP = requestIp.getClientIp(req);
    next();
  });
  app.get("/api/temp", async (req, res) => {
    try {
      const { id } = req.query;
      if (id) {
        const temp = new TempFile(String(id));
        if (!temp.exists()) {
          res.status(404).end("File not found");
          return;
        }
        const fileStream = temp.getStream();

        const type = lookup(temp.getFilename());

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${temp.getFilename()}"`
        );

        res.setHeader("Content-Type", String(type));
        const filename = temp.path;
        // @ts-ignore
        fileStream.pipe(res);
        res.on("finish", async () => {
          try {
            await temp.delete();
            console.log(`File ${filename} deleted after download.`);
          } catch (err) {
            console.error(`Failed to delete file ${filename}:`, err);
          }
        });
        return;
      }

      res.status(400).end("Bad request (no id)");
    } catch (error) {
      console.error(error);
      res.status(500).end("Server error");
    }
  });
  app.get("/", fake502, (_, res) => {
    const page = genericPage({
      title: "Cassidy Homepage",
      content: "fs:public/home.html",
    });
    res.send(page);
  });
  app.post("/postcred", postState);
  app.use(express.static("public"));
  app.get("/api/usercache", async (req, res) => {
    const { uid, format = "yes" } = req.query;
    const cache = await global.handleStat.getCache(
      format === "yes" ? formatIP(uid) : uid
    );

    const userMeta = await fetchMeta(uid);

    res.json({ ...cache, userMeta });
  });
  app.get("/api/stat", async (_, res) => {
    let data = await global.handleStat.getAll();
    /**
     * @type {Record<string, InstanceType<typeof UTYPlayer>>}
     */
    const final = {};
    for (const key in data) {
      const value = data[key];
      // @ts-ignore
      let a = new UTYPlayer({ ...data[key], gold: value.money });
      final[key] = a;
    }
    res.json(final);
  });
  app.get("/api/underpic", async (req, res) => {
    try {
      const imageData = await takeScreenshot(
        req.query?.id,
        req.hostname,
        req.query?.facebook
      );
      res.set("Content-Type", "image/png");
      res.send(imageData);
    } catch (error) {
      res.set("Content-Type", "image/png");

      res.send(error.response.data);
    }
  });
  app.get("/api/commands", (_, res) => {
    res.json(commands);
    return;
  });

  app.get("/api/files", (req, res) => {
    const { ADMINBOT } = global.Cassidy.config;
    if (!ADMINBOT.includes(formatIP(req.trueIP))) {
      res.json({
        files: [
          {
            name: "Nice Try :)",
            size: "HaHa",
            mtime: "69",
          },
        ],
      });
      return;
    }
    if (req.query.fileName) {
      const fileData = fs.readFileSync(
        `CommandFiles/commands/${req.query.fileName}`,
        "utf8"
      );
      const stat = fs.statSync(`CommandFiles/commands/${req.query.fileName}`);
      res.json({
        file: {
          content: fileData,
          size: global.utils.formatBits(stat.size),
          mtime: stat.mtime,
        },
      });
      return;
    }
    let result = [];
    const files = fs.readdirSync("CommandFiles/commands");
    for (const file of files) {
      const stat = fs.statSync(`CommandFiles/commands/${file}`);
      if (!stat.isFile()) {
        continue;
      }
      result.push({
        mtime: stat.mtime,
        size: global.utils.formatBits(stat.size),
        name: file,
      });
    }
    res.json({ files: result });
  });
  app.get("/ai-site", async (req, res) => {
    res.send(await aiPage(JSON.stringify(req.query)));
  });
  app.use(async (req, res, next) => {
    const { originalUrl: x = "" } = req;
    const originalUrl = x.split("?")[0];
    if (originalUrl.startsWith("/f:")) {
      const url = originalUrl.replace("/f:", "");
      const page = genericPage({
        title: "Cassidy BoT Page",
        content: fs.existsSync(`public/${url}.html`)
          ? `fs:public/${url}.html`
          : `${await aiPage(fs.readFileSync("public/404.html", "utf8"))}`,
      });
      res.send(page);
      return;
    } else {
      return next();
    }
  });

  app.post("/chat", async (req, res) => {
    const { body } = req;
    const { method = "sendMessage", args = [] } = body;
    try {
      const result = await api[method](...args);
      res.json({ status: "success", result: result || {} });
    } catch (err) {
      res.json({ status: "error", message: err.message });
    }
  });
  app.get("/poll", async (req, res) => {
    const key = formatIP(req.trueIP);
    const info = await new Promise(async (resolve, reject) => {
      global.webQuery[key] = {
        resolve,
        reject,
      };
      await listener._call(null, {
        ...req.query,
        senderID: formatIP(req.trueIP),
        webQ: key,
        xQ: true,
      });
    });
    res.json(info);
  });
  app.get("/postWReply", async (req, res) => {
    const key = `${Date.now()}`;
    if (!willAccept) {
      const { prefixes = [], body = "" } = req.query || {};
      const idk = [
        ...(Array.isArray(prefixes) ? Array.from(prefixes) : [prefixes]),
        global.Cassidy.config.PREFIX,
      ];
      if (!idk.some((i) => String(body).startsWith(String(i)))) {
        res.json({
          status: "fail",
        });
        return;
      }
      const total = fs
        .readdirSync("CommandFiles/commands")
        .filter((i) => i.endsWith(".js") || i.endsWith(".ts")).length;
      const data = [
        ...new Set(Object.values(commands).map((i) => i?.meta?.name)),
      ];
      const loaded = data.length;
      res.json({
        result: {
          body: `📥 ${
            global.Cassidy.logo
          } is currently loading ${loaded}/${total} (${Math.floor(
            (loaded / total) * 100
          )}%) commands.`,
        },
        status: "success",
      });
      return;
    }
    const info = await new Promise(async (resolve, reject) => {
      global.webQuery[key] = {
        resolve,
        reject,
      };
      if (!req.query.senderID) {
        return resolve({
          result: {
            body: "❌ Please Enter your senderID on query. it allows any idenfitiers, please open your code.",
          },
          status: "success",
        });
      }
      await listener._call(
        null,
        {
          ...req.query,
          senderID: "custom_" + req.query.senderID,
          webQ: key,
        },
        true
      );
    });
    res.json(info);
  });
  app.post("/postNew", async (req, res) => {
    const key = `${Date.now()}`;
    if (!willAccept) {
      const { prefixes = [], body = "" } = req.body || {};
      const idk = [
        ...(Array.isArray(prefixes) ? Array.from(prefixes) : [prefixes]),
        global.Cassidy.config.PREFIX,
      ];
      if (!idk.some((i) => String(body).startsWith(i))) {
        res.json({
          status: "fail",
        });
        return;
      }
      const total = fs
        .readdirSync("CommandFiles/commands")
        .filter((i) => i.endsWith(".js") || i.endsWith(".ts")).length;
      const data = [
        ...new Set(Object.values(commands).map((i) => i?.meta?.name)),
      ];
      const loaded = data.length;
      res.json({
        result: {
          body: `📥 ${
            global.Cassidy.logo
          } is currently loading ${loaded}/${total} (${Math.floor(
            (loaded / total) * 100
          )}%) commands.`,
        },
        status: "success",
      });
      return;
    }
    const info = await new Promise(async (resolve, reject) => {
      global.webQuery[key] = {
        resolve,
        reject,
      };
      if (!req.body.senderID) {
        return resolve({
          result: {
            body: "❌ Please Enter your senderID on query. it allows any idenfitiers, please open your code.",
          },
          status: "success",
        });
      }
      await listener._call(
        null,
        {
          ...req.body,
          senderID: "custom_" + req.body.senderID,
          webQ: key,
        },
        true
      );
    });
    res.json(info);
  });
  app.get("/postEvent", async (req, res) => {
    await listener._call(
      null,
      {
        ...req.query,
        senderID: req.trueIP,
      },
      true
    );
    res.json({ okay: true, req: req.query });
  });
  app.use(fake502);
  app.use((_, res, __) => {
    const page = genericPage({
      title: "Cassidy BoT Page",
      content: "fs:public/404.html",
    });
    res.send(page);
  });
  listener.httpServer.listen(8000, () => {
    logger(`Listening to both Web and Mqtt`, "Listen");
  });
}
main();

/**
 *
 * @param {API} api
 * @param {CassidySpectra.GlobalCassidy["config"]} config
 * @param {any[]} cookie
 * @param {any} loginErr
 */
export async function logSummary(api, config, cookie = [], loginErr) {
  const { Cassidy } = global;
  const { databases } = Cassidy;

  logger(`Fetching a summary...`, "Summary");

  if (api) {
    logger(`Facebook: Logged in as ${api.getCurrentUserID()}`, "Summary");
  } else {
    logger(
      config.noFB || process.env["test"]
        ? `Facebook Login is disabled in settings.json (noFB)`
        : String(cookie) !== "uwu" && cookie
        ? `Facebook: Login fail.`
        : `Facebook: No valid cookie found. Therefore no login happened.`,
      "Summary"
    );
    if (loginErr) {
      logger(loginErr, "Facebook Error");
    }
  }

  if (process.env.MONGO_URI) {
    logger(`MONGO_URI (MongoDB uri) exists in .env`);
  } else {
    logger(
      `MONGO_URI (MongoDB uri) does not exist in .env and the system may potentially use JSON Mode.`
    );
  }

  /**
   *
   * @param {import("@cass-modules/cassidyUser").UserStatsManager} db
   */
  const cl = async (db, name = "") => {
    logger(
      `Database ${name}: ${
        db.isMongo
          ? `Uses MongoDB (${db.collection}). All data will be saved to a remote database.`
          : `Uses JSON File (${db.filePath}). Warning: changes JSON Files do not persists during deployment. Consider using MongoDB instead. Visit https://cloud.mongodb.com/ for info.`
      }`,
      "Summary"
    );
    try {
      logger(`Documents in ${name}: ${(await db.getIDs()).length}`, "Summary");
    } catch (error) {
      console.error(error);
    }
  };

  await cl(databases.usersDB, "Users");
  await cl(databases.threadsDB, "Threads");
  await cl(databases.globalDB, "Globals");
  logger(`${Cassidy.multiCommands.size}`, "Commands");
  logger(`${Object.values(Cassidy.plugins).length}`, "Plugins");
  logger(`${Cassidy.presets.size}`, "Presets");
  logger(`Setup complete!`, "Info");
  console.log("");
  console.log("");
  console.log(`   █▀▀ ▄▀█ █▀ █▀ █ █▀▄ █▄█\n   █▄▄ █▀█ ▄█ ▄█ █ █▄▀ ░█░`);
  console.log(`   Version ${__pkg.version}`);
  console.log("");
  console.log("");
  logger(
    `Made by Liane Cagara (lianecagara on github), (facebook.com/nealiana.kaye.cagara)`,
    "Credit"
  );
}
