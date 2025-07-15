// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "userInfo",
  description: "Check user's info",
  author: "Liane",
  version: "1.0.0",
  usage: "{prefix}{name}",
  category: "User Management",
  permissions: [0],
  noPrefix: false,
  noWeb: true,
  requirement: "3.0.0",
  icon: "📛",
  fbOnly: true,
};

/**
 *
 * @param {CommandContext} param0
 * @returns
 */
export async function entry({ input, output, money, args }) {
  const { fonts } = global.utils;
  let ID = input.detectID || input.senderID;
  if (args[0] === "raw") {
    return output.reply(`${ID}`);
  }
  if (args[0] === "tid") {
    return output.reply(`${input.threadID}`);
  }
  await money.ensureUserInfo(ID);
  const { userMeta: info } = await money.getItem(ID);
  if (!info) {
    return output.wentWrong();
  }
  await output.reply(`📛 ${fonts.bold(`${info.name}`)}

𝙄𝘿: ${ID}
𝙏𝙄𝘿: ${input.threadID}`);
}
