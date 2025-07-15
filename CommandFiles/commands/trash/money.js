import { ReduxCMDHome } from "@cassidy/redux-home";
import { abbreviateNumber, UNIRedux } from "@cassidy/unispectra";

export const meta = {
  name: "cash",
  description: "Check your virtual money",
  otherNames: [
    "bal",
    "balance",
    "coins",
    "funds",
    "moneydashboard",
    "mdashboard",
    "mdash",
    "money",
  ],
  version: "2.5.0",
  usage: "{prefix}{name}",
  category: "Finance",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 0,
  requirement: "3.0.0",
  requirement: "3.0.0",
  icon: "💵",
};

export const style = {
  title: "Cash • Dashboard 💵",
  titleFont: "bold",
  contentFont: "fancy",
};

function isBrokenMoney(playerMoney) {
  return !!(
    isNaN(playerMoney) ||
    !isFinite(playerMoney) ||
    playerMoney < 0 ||
    playerMoney > Number.MAX_SAFE_INTEGER
  );
}

/**
 *
 * @param {Record<string, UserData>} users
 * @param {number} top
 * @param {import("cassidy-userData").UserStatsManager} money
 * @returns
 */
function sortUsers(users, top, money) {
  let result = {};
  let sortedKeys = Object.keys(users).sort((a, b) => {
    // const aValue =
    //   Number(users[a].money) + Number(users[a].battlePoints ?? 0) * 1.5;
    // const bValue =
    //   Number(users[b].money) + Number(users[b].battlePoints ?? 0) * 1.5;
    const aValue = money.extractMoney(users[a]).total;
    const bValue = money.extractMoney(users[b]).total;

    return bValue - aValue;
  });

  if (top) {
    sortedKeys = sortedKeys.slice(0, top);
  }
  for (const key of sortedKeys) {
    result[key] = users[key];
  }
  return result;
}

/**
 *
 * @param {string} id
 * @param {Record<string, UserData>} users
 * @param {import("cassidy-userData").UserStatsManager} money
 * @returns
 */
function getBehindAhead(id, users, money) {
  const sorted = sortUsers(users, undefined, money);
  const sortedKeys = Object.keys(sorted);
  const index = sortedKeys.findIndex((key) => key === id);

  if (index === -1) {
    return { behind: [], ahead: [] };
  }

  const ahead = sortedKeys.slice(0, index);
  const behind = sortedKeys.slice(index + 1);

  return { ahead, behind };
}

function getTop(id, users, money) {
  const sorted = sortUsers(users, undefined, money);
  return Object.keys(sorted).findIndex((key) => key === id) + 1;
}

function totalReducer(totalObj) {
  return Object.values(totalObj).reduce((a, b) => {
    const numA = Number(a);
    const numB = Number(b);

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA + numB;
    } else {
      return numA;
    }
  }, 0);
}

const { parseCurrency: pCy } = global.utils;

/**
 * @type {Array<import("@cassidy/redux-home").Config>}
 */
const configs = [
  {
    key: "view",
    description: "View your money status or check someone else's",
    args: ["<optional uid>"],
    aliases: ["-v", "show"],
    async handler({
      money,
      input,
      output,
      icon,
      prefix,
      clearCurrStack,
      Collectibles,
    }) {
      let { senderID } = input;
      if (input.replier) {
        ({ senderID } = input.replier);
      }
      if (input.hasMentions) {
        ({ senderID } = input.firstMention);
      }
      if (input.arguments[0]) {
        senderID = input.arguments[0];
      }

      let i;
      if (!input.isWeb) {
        i = await output.reply(`🔧 Loading...`);
      }

      const allUsers = await money.getAll();
      let warn = "";
      let playerMoney = allUsers[senderID];
      const cll = new Collectibles(playerMoney.collectibles ?? []);

      playerMoney.money ??= 0;

      playerMoney.name ??= "No name";
      if (isBrokenMoney(playerMoney.money)) {
        warn = `\n\n⚠️ Warning: This money might be corrupted! Use "${prefix}money fix" to reset it.`;
      }

      const mappedCl = cll
        .getAll()
        .filter(({ metadata, amount }) => amount > 0)
        .map(
          ({ metadata, amount }) =>
            `${metadata.icon} **x${pCy(amount)}** ${metadata.name}`
        )
        .join("\n");
      const otherMoney = money.extractMoney(playerMoney);

      const topIndex = getTop(senderID, allUsers, money);
      const otherPlayers = getBehindAhead(senderID, allUsers, money);
      const targetName = input.hasMentions
        ? playerMoney.name
        : input.replier
        ? playerMoney.name
        : input.arguments[0]
        ? playerMoney.name
        : "You";
      let topText = `${
        topIndex <= 10 ? `🏅 **#${topIndex}** Rank` : `🌱 **Climbing UP!**`
      }\n${UNIRedux.standardLine}\n🏆 ${targetName} rank${
        targetName === "You" ? "" : "s"
      } behind **${otherPlayers.ahead.length}** players and ahead of **${
        otherPlayers.behind.length
      }** players.\n\n⚠️ **Disclaimer**: This is a virtual money balance and cannot be exchanged for real money.`;

      const has = targetName === "You" ? "have" : "has";
      let resu = `📛 **${playerMoney.name}**\n💵 **x${pCy(
        playerMoney.money ?? 0
      )}** Money\n💷 **x${pCy(
        playerMoney.battlePoints ?? 0
      )}** Battle Points\n🎒 **x${pCy(
        otherMoney.cheques ?? 0
      )}** Cheque Amounts\n🏦 **x${pCy(
        otherMoney.bank ?? 0
      )}** Bank Amounts\n${mappedCl}${warn}\n${topText}`;

      if (i) {
        output.edit(resu, i.messageID);
        clearCurrStack();
      } else {
        output.reply(resu);
      }
    },
  },
  {
    key: "lboard",
    description: "View the current Top 10 leaderboard",
    aliases: ["top", "leaderboard", "richest", "-l"],
    async handler({
      money,
      input,
      output,
      icon,
      prefix,
      clearCurrStack,
      CassEXP,
      Collectibles,
    }) {
      let { participantIDs = [] } = input;
      if (!Array.isArray(participantIDs)) {
        participantIDs = [];
      }
      const users = await money.getAll();

      /**
       * @type {Record<string, UserData>}
       */
      const topUsers = sortUsers(users, 10, money);

      let result = `🏅 | **Leaderboards**\n\n`;
      let index = 1;
      let lastMoney;
      for (const key in topUsers) {
        const isGroup = participantIDs.includes(key);

        const {
          name = "Unregistered",
          money: playerMoney,
          maxMoney,
          battlePoints = 0,
          cassEXP: cxp,
        } = topUsers[key];
        const otherMoney = money.extractMoney(topUsers[key]);
        const userData = topUsers[key];
        const cll = new Collectibles(userData.collectibles ?? []);
        const mappedCl = cll
          .getAll()
          .filter(({ metadata, amount }) => amount > 0)
          .map(
            ({ metadata, amount }) =>
              `${metadata.icon} ${metadata.name}: ${abbreviateNumber(amount)}`
          )
          .join("\n");
        const cassEXP = new CassEXP(cxp);
        result += `${index === 1 ? "👑" : index < 10 ? `0${index}` : index}${
          index === 1
            ? ` LV${cassEXP.level} ✦ [font=double_struck]${name
                .split("")
                .map((name) => name.toUpperCase())
                .join(" ")}[:font=double_struck] ✦`
            : `. LV${cassEXP.level} **${name}**`
        }\n💸 **TOTAL**: $**${abbreviateNumber(
          otherMoney.total ?? 0
        )}**💵\n💰 Money: $${abbreviateNumber(
          playerMoney
        )}💵\n⚔️ Battle Points: $${abbreviateNumber(
          battlePoints ?? 0
        )}💷\n🏦 Bank Amounts: $${abbreviateNumber(
          otherMoney.bank ?? 0
        )}💵\n🎒 Cheque Amounts: $${abbreviateNumber(
          otherMoney.cheques ?? 0
        )}💵\n`;
        if (lastMoney) {
          result += `💸 Gap: $${abbreviateNumber(lastMoney - playerMoney)}💵\n`;
        }
        if (mappedCl) {
          result += `${mappedCl}\n`;
        }
        if (isGroup) {
          result += `✅ In Group\n`;
        }
        for (const key in userData) {
          if (
            !key.endsWith("Total") &&
            key !== "totalCrops" &&
            key !== "totalOres"
          ) {
            continue;
          }
          const totalObj = userData[key];
          if (!Object.values(totalObj).every((value) => !isNaN(value))) {
            continue;
          }
          const exKey = key.replace("Total", "");
          const exKeyCap =
            exKey.charAt(0).toUpperCase() + exKey.slice(1).toLowerCase();
          const sum = totalReducer(totalObj);
          result += `✓ ${exKeyCap}(s): ${abbreviateNumber(sum)}\n`;
        }
        result += `\n`;
        index++;
        lastMoney = playerMoney;
      }
      output.reply(result);
      return;
    },
  },
  {
    key: "fix",
    description: "Fix and recover corrupted money data",
    aliases: ["-f"],
    async handler({ money, input, output, icon, prefix, clearCurrStack }) {
      const { money: playerMoney } = await money.getItem(input.senderID);
      if (isBrokenMoney(playerMoney)) {
        await money.set(input.senderID, { money: 0 });
        return output.reply(
          `✅ | Your broken money of ${pCy(playerMoney)} has been reset to 0$.`
        );
      } else {
        return output.reply(
          `❌ | Your money is ${pCy(
            playerMoney
          )}$ and is functioning correctly.`
        );
      }
    },
  },
  {
    key: "reset",
    description: "Reset your money balance to the default value",
    aliases: ["-r"],
    async handler({ money, input, output, icon, prefix, clearCurrStack }) {
      if (input.arguments[0] === "reset_force_confirmed") {
        await money.set(input.senderID, { money: 0 });
        output.reply(`✅ | Your money has been reset to 0$`);
        return;
      } else {
        return output.reply(
          `⚠️ | Type **reset_force_confirmed** as argument to confirm.`
        );
      }
    },
  },
];

const home = new ReduxCMDHome(
  {
    argIndex: 0,
    isHypen: true,
  },
  configs
);

export async function entry(ctx) {
  return home.runInContext(ctx);
}
