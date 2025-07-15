// @ts-check
import { ReduxCMDHome } from "@cassidy/redux-home";
import { UNISpectra } from "@cassidy/unispectra";

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "admin",
  author: "Liane Cagara 🎀",
  noPrefix: false,
  version: "1.0.4",
  description: "Manage admins.",
  usage: "admin[prop] [command]",
  permissions: [0, 1, 2],
  requirement: "3.0.0",
  icon: "",
  category: "User Management",
  cmdType: "etc_xcmd",
};
const { Cassidy } = global;

/**
 * @type {CassidySpectra.CommandStyle}
 */
export const style = {
  title: "Admins 👑",
  titleFont: "bold",
  contentFont: "fancy",
};

/**
 * @type {Record<string, CommandEntry>}
 */
export const entryConfig = {
  async addmod({ input, output, args, money }) {
    const { MODERATORBOT, ADMINBOT } = Cassidy.config;
    if (!input.isAdmin) {
      return output.reply(`❌ | You cannot add moderators.`);
    }
    const ID = input.detectID || args[0];
    if (!ID) {
      return output.reply(
        "❌ | Please specify the ID to add. Either reply/mention or add the ID to args[0]."
      );
    }
    const { name } = await money.getItem(ID);
    if (MODERATORBOT.includes(ID)) {
      return output.reply(`❌ | ${name} (${ID}) is already a moderator.`);
    }
    if (ADMINBOT.includes(ID)) {
      return output.reply(`❌ | ${name} (${ID}) is an admin.`);
    }

    MODERATORBOT.push(ID);
    Cassidy.config.MODERATORBOT = MODERATORBOT;
    return output.reply(`✅ | ${name} (${ID}) is now a moderator.`);
  },
  async removemod({ input, output, args, money }) {
    const { MODERATORBOT } = Cassidy.config;
    if (!input.isAdmin) {
      return output.reply(`❌ | You cannot remove moderators.`);
    }
    const ID = input.detectID || args[0];
    if (!ID) {
      return output.reply(
        "❌ | Please specify the ID to remove. Either reply/mention or add the ID to args[0]."
      );
    }
    if (ID.startsWith("web:") || ID.startsWith("wss:main")) {
      return output.reply(`❌ | Web users and wss main cannot be moderator!`);
    }

    const { name } = await money.getItem(ID);
    if (!MODERATORBOT.includes(ID)) {
      return output.reply(`❌ | ${name} (${ID}) is not a moderator.`);
    }
    Cassidy.config.MODERATORBOT = MODERATORBOT.filter((item) => item !== ID);
    return output.reply(`✅ | ${name} (${ID}) no longer a moderator.`);
  },

  async add({ input, output, args, money }) {
    const { ADMINBOT } = Cassidy.config;
    if (!input.isAdmin) {
      return output.reply(`❌ | You cannot add admins.`);
    }
    const ID = input.detectID || args[0];
    if (!ID) {
      return output.reply(
        "❌ | Please specify the ID to add. Either reply/mention or add the ID to args[0]."
      );
    }
    if (ID.startsWith("web:") || ID.startsWith("wss:main")) {
      return output.reply(`❌ | Web users and wss main cannot be admin!`);
    }
    const { name } = await money.getItem(ID);
    if (ADMINBOT.includes(ID)) {
      return output.reply(`❌ | ${name} (${ID}) is already an admin.`);
    }
    ADMINBOT.push(ID);
    Cassidy.config.ADMINBOT = ADMINBOT;
    return output.reply(`✅ | ${name} (${ID}) is now an admin.`);
  },
  async remove({ input, output, args, money }) {
    const { ADMINBOT } = Cassidy.config;
    if (!input.isAdmin) {
      return output.reply(`❌ | You cannot remove admins.`);
    }
    const ID = input.detectID || args[0];
    if (!ID) {
      return output.reply(
        "❌ | Please specify the ID to remove. Either reply/mention or add the ID to args[0]."
      );
    }
    const { name } = await money.getItem(ID);
    if (!ADMINBOT.includes(ID)) {
      return output.reply(`❌ | ${name} (${ID}) is not an admin.`);
    }
    Cassidy.config.ADMINBOT = ADMINBOT.filter((item) => item !== ID);
    return output.reply(`✅ | ${name} (${ID}) no longer an admin.`);
  },
  async list({ output, money }) {
    const { ADMINBOT = [], MODERATORBOT = [] } = Cassidy.config;
    const concat = [...MODERATORBOT, ...ADMINBOT];
    let result = `Total of ${concat.length} admins and moderators:\n\n`;
    let n = 1;
    result += `${UNISpectra.arrow} 👑 ***Admins***:\n`;
    const admins = await money.getItems(...ADMINBOT);
    const mods = await money.getItems(...MODERATORBOT);

    for (const [admin, { name }] of Object.entries(admins)) {
      result += `${n}. **${name}** (${admin})\n`;
      n++;
    }
    result += `\n${UNISpectra.arrow} 🛡️ ***Moderators***:\n`;
    for (const [moderator, { name }] of Object.entries(mods)) {
      result += `${n}. **${name}** (${moderator})\n`;
      n++;
    }
    return output.reply(result);
  },
};

const home = new ReduxCMDHome({
  entryConfig,
  entryInfo: {
    list: {
      description: "Display the list of admins",
    },
    addmod: {
      description: "Grant moderator privileges",
      args: ["<uid>"],
    },
    removemod: {
      description: "Revoke moderator privileges",
      args: ["<uid>"],
    },
    add: {
      description: "Add a new admin",
      args: ["<uid>"],
    },
    remove: {
      description: "Remove an existing admin",
      args: ["<uid>"],
    },
  },
});

export async function entry(ctx) {
  return home.runInContext(ctx);
}
