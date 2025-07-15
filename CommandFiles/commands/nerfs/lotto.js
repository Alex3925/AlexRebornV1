// @ts-check
import { Inventory } from "../plugins/ut-shop.js";

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "lotto",
  description: "Test your luck with the lotto game!",
  version: "1.0.0",
  author: "Liane Cagara",
  usage: "{prefix}lotto <...numbers>",
  category: "Gambling Games",
  permissions: [0],
  noPrefix: false,
  waitingTime: 24,
  requirement: "3.0.0",
  icon: "🔖",
};
export const style = {
  title: "Lotto 🔖",
  contentFont: "fancy",
  titleFont: "bold",
};
function hasDuplicate(args) {
  for (let i = 0; i < args.length; i++) {
    for (let j = i + 1; j < args.length; j++) {
      if (args[i] === args[j]) {
        return true;
      }
    }
  }
  return false;
}

/**
 *
 * @param {CommandContext} ctx
 * @returns
 */
export async function entry({ input, output, money, cancelCooldown }) {
  const lottoLen = 3;
  const rangeB = 45;
  const {
    money: userMoney,
    lastLottoWin,
    lottoLooses = 0,
    inventory: inv,
  } = await money.getItem(input.senderID);

  const inventory = new Inventory(inv ?? []);

  if (!inventory.has("lottoTicket")) {
    cancelCooldown();
    return output.reply(
      `A 🔖 **Lotto Ticket** is required to play every single game.`
    );
  }

  checkLottoWin: {
    if (isNaN(lastLottoWin)) {
      break checkLottoWin;
    }

    const interval = Date.now() - lastLottoWin;
    const timeElapsed = interval / 1000;
    if (timeElapsed < 120 && !input.isAdmin) {
      cancelCooldown();
      return output.reply(
        `⏳ You have already won the lottery in the last hour. Please wait for ${Math.ceil(
          120 - timeElapsed
        )} seconds before trying again.`
      );
    }
  }

  const args = input.arguments
    .map(Number)
    .filter((num) => !isNaN(num) && num > 0 && num < rangeB + 1);

  if (args.length !== lottoLen) {
    output.reply(
      `Please provide exactly ${lottoLen} valid numbers between 1 and ${rangeB}.`
    );
    cancelCooldown();
    return;
  }
  if (hasDuplicate(args)) {
    output.reply(`❌ Duplicate numbers are not allowed.`);
    cancelCooldown();
    return;
  }

  const crypto = require("crypto");

  function secureRandomInt(min, max) {
    const range = max - min + 1;

    const randomBytes = crypto.randomBytes(8);
    const randomInt = randomBytes.readUInt32BE(0) ^ randomBytes.readUInt32BE(4);

    const timeEntropy = Date.now() & 0xfffffff;
    return min + ((((randomInt ^ timeEntropy) % range) + range) % range);
  }

  const lottoNumbers = Array.from({ length: lottoLen }, () =>
    secureRandomInt(1, rangeB)
  ).map((i) => {
    if (args.includes(i) && Math.random() < 0.7) {
      return i + (Math.random() < 0.5 ? 1 : -1);
    } else {
      return i;
    }
  });

  const matchedNumbers = args.filter((num) => lottoNumbers.includes(num));
  let winnings = 0;

  let resultText;
  const isLoose = matchedNumbers.length === 0;
  if (isLoose) {
    resultText = `🥲 Sorry, no matched numbers. Better luck next time!`;
  } else {
    winnings = 12500 * 2 ** matchedNumbers.length;

    // each prize
    // = winnings >> matchedNumbers.length;
    resultText = `🎉 Congratulations! You won ${winnings}$.`;
  }

  inventory.deleteOne("lottoTicket");

  const text = `**Lotto numbers**:
${lottoNumbers.join(", ")}\n**Your numbers**:
${args.join(", ")}\n\n${resultText}\n\n$**${Number(
    userMoney + (isLoose ? 0 : winnings)
  ).toLocaleString()}**${
    !isLoose ? ` **(+${winnings})**` : ""
  } | 🔖 **${inventory.getAmount("lottoTicket")}** (**-1**)`;
  output.reply(`${text}`);

  if (matchedNumbers.length > 0 && winnings) {
    await money.set(input.senderID, {
      money: userMoney + winnings,
      lastLottoWin: Date.now(),
      inventory: Array.from(inventory),
    });
  } else {
    await money.set(input.senderID, {
      lottoLooses: lottoLooses + 1000,
      inventory: Array.from(inventory),
    });
  }
}
