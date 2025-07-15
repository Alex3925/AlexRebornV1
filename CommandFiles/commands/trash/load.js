export const meta = {
  name: "load",
  author: "Liane Cagara",
  version: "1.0.0",
  description: "Look how simple it is, it will just refresh loaded commands, has reboot and prefix.",
  usage: "{prefix}load",
  category: "System",
  permissions: [2],
  waitingTime: 5,
  noPrefix: "both",
  whiteList: null,
  ext_plugins: {},
};

export const style = {
  title: "💽 Loader",
  titleFont: "bold",
  contentFont: "fancy",
};

import fs from "fs";
export async function entry({ output, input }) {
  output.reaction("⏳");
  if (input.arguments[0] == "reboot") {
    await output.reaction("✅");
    await output.reply(`✅ Proceeding to reboot`);
    process.exit(3);
  }
  if (input.arguments[0] === "prefix" && input.arguments[1]) {
    const prefix = input.arguments[1];
    global.Cassidy.config = { ...global.Cassidy.config, PREFIX: prefix };
    await output.reply(`✅ Successfully changed general prefix to '${prefix}'`);
    return;
  }
  const { delay } = global.utils;
  const { loadAllCommands } = global.Cassidy;
  let info;
  info = await loadAllCommands();
  if (!input.isWeb) {
    const i = await output.reply(`⚙️ Reloading..`);
    await delay(1000);
    await output.edit(`📥 Almost done..`, i.messageID);
    await delay(1000);
  }
  if (info) {
    let result = `❌ Failed to load ${Object.keys(info).length} commands:\n\n`;
    for (const key in info) {
      const err = info[key];
      result += `❌ ${key} - ${err}\n`;
    }
    if (!input.isWeb) {
      await output.edit(result, i.messageID);
    } else {
      await output.reply(result);
    }
  } else {
    if (!input.isWeb) {
      await output.edit(`✅ All commands has been loaded`, i.messageID);
    } else {
      await output.reply(`✅ All commands has been loaded.`);
    }
  }
  output.reaction("✅");
}
