// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "richroll",
  description:
    "Roll your way to riches as you test your luck in a high-stakes game of fortune.",
  version: "1.1.5",
  author: "Liane Cagara",
  otherNames: ["rr"],
  usage: "{prefix}{name}",
  category: "Gambling Games",
  permissions: [0],
  noPrefix: false,
  waitingTime: 30,
  icon: "🌪️",
  shopPrice: 2500,
  requiredLevel: 10,
  requirement: "3.0.0",
};

const outcomes = [
  "💰 ***CHA-CHING!*** You hit the jackpot! You win $<amount>💵 and roll your way to riches.",
  "🔔 ***DING-DING-DING!*** Lucky roll! You win $<amount>💵 on your way to becoming the wealthiest.",
  "💥 ***THUD...*** Oops, the dice turned against you. You lose $<amount>💵 in a bad roll.",
  "💥 ***THUD...*** Oops, the dice turned against you. You lose $<amount>💵 in a bad roll.",
  "😅 ***WHEW!*** A close call! You win $<amount>💵 as your luck holds out just a bit longer.",
  "💎 ***BLING-BLING!*** What a roll! You gain $<amount>💵 as fortune smiles upon you.",
  "💣 ***CRASH!*** The dice betrayed you. You lose $<amount>💵 in a risky gamble.",
  "💣 ***CRASH!*** The dice betrayed you. You lose $<amount>💵 in a risky gamble.",
  "🔔 ***DING!*** A lucky streak! You gain $<amount>💵 as your fortunes rise.",
  "🌪️ ***WOOSH...*** Unlucky roll! You lose $<amount>💵 and your riches slip away.",
  "🌪️ ***WOOSH...*** Unlucky roll! You lose $<amount>💵 and your riches slip away.",
  "💥 ***THUD...*** Oh no! The dice turned cold. You lose $<amount>💵 as the luck fades.",
  "💎 ***BLING!*** Rolling high! You earn $<amount>💵 as you get closer to untold riches.",
  "💥 ***BAM!*** Bad luck strikes! You lose $<amount>💵 in a devastating roll.",
  "💥 ***BAM!*** Bad luck strikes! You lose $<amount>💵 in a devastating roll.",
  "⚡ ***ZING!*** You're on a roll! You win $<amount>💵 and get one step closer to the fortune.",
];

export class style {
  preset = ["cash_games.json"];
}

/**
 *
 * @param {CommandContext} param0
 * @returns
 */
export async function entry({
  output,
  money,
  input,
  styler,
  cancelCooldown,
  Inventory,
}) {
  let {
    money: userMoney,
    inventory: r,
    rrWins = 0,
    rrLooses = 0,
    prizePool = 0,
  } = await money.getItem(input.senderID);
  const inventory = new Inventory(r);
  let hasPass = inventory.has("highRollPass");

  const outcomeIndex = Math.floor(Math.random() * outcomes.length);

  const [bet] = input.arguments;

  let amount = parseInt(bet);
  const isAffordable = prizePool * 2 >= amount;
  let outcome = outcomes.toSorted(() => Math.random() - 0.5)[outcomeIndex];
  if (!isAffordable) {
    outcome = outcomes
      .toSorted(() => Math.random() - 0.5)
      .find((i) => i.includes(" lose"));
  }

  if (!hasPass && amount > global.Cassidy.highRoll) {
    return output.reply(
      `You need a **HighRoll Pass** 🃏 to place bets over ${global.Cassidy.highRoll}$`
    );
  }

  if (isNaN(amount) || amount <= 0 || amount > userMoney) {
    cancelCooldown();
    return output.reply(`⚠️ Invalid bet amount.`);
  }
  const cashField = styler.getField("cashField");
  const resultText = styler.getField("resultText");
  let xText = "";

  if (outcome.includes(" lose")) {
    amount = Math.min(amount, userMoney);

    cashField.applyTemplate({
      cash: +amount,
    });
    rrLooses += amount;
    prizePool += amount;

    resultText.changeContent("You lost:");

    await money.set(input.senderID, {
      money: userMoney - amount,
      rrLooses,
      rrWins,
      prizePool,
    });
  } else {
    rrWins += amount;
    prizePool -= amount;
    prizePool = Math.max(0, prizePool);
    cashField.applyTemplate({
      cash: +amount,
    });

    resultText.changeContent("You Won:");
    await money.set(input.senderID, {
      money: userMoney + amount,
      rrWins,
      rrLooses,
      prizePool,
    });
  }

  output.reply(
    `💥 ` +
      outcome.replace("<amount>", String(amount)) +
      xText +
      ` Your new balance is $${(await money.getCache(input.senderID)).money}💵`
  );
}
