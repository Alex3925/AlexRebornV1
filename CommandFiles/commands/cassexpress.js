// @ts-check

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "cassexpress",
  version: "1.3.0",
  author: "Liane Cagara",
  waitingTime: 1,
  description: "Advanced and Sophisticated way of managing bank system.",
  category: "Finance",
  noPrefix: false,
  otherNames: ["cexpress", "cbank"],
  requirement: "3.0.0",
  icon: "💵",
  requiredLevel: 5,
  cmdType: "cplx_g",
};
const charm = "✦";
const circle = "⦿";
const { parseCurrency: pCy } = global.utils;
function formatCash(amount) {
  return `$**${pCy(amount)}**💵`;
}
function formatTime(time) {
  return global.utils.convertTimeSentence(global.utils.formatTimeDiff(time));
}
export const style = {
  title: "CassExpress | ✦",
  titleFont: "bold",
  contentFont: "fancy",
  lineDeco: "altar",
};

// LMAO u cannot convert it without actually writing the missing logic

/**
 *
 * @param {CommandContext} ctx
 * @returns
 */
export async function entry({
  input,
  output,
  money,
  args,
  CassExpress,
  prefix,
  Slicer,
  getInflationRate,
  CustomAI,
}) {
  const userData = await money.getItem(input.senderID);
  const cassExpress = new CassExpress(userData.cassExpress ?? {});
  let {
    name,
    money: userMoney,
    bankData = { bank: 0, lastInterestClaimed: Date.now() },
  } = userData;
  if (!name) {
    return output.reply(
      `💌 | Sorry, we do not accept unregistered users, please use the ${prefix}identity-setname command first!`
    );
  }
  if (!args[0]) {
    args.unshift(input.propertyArray[0]);
  }
  const targetArgs = String(args[0]);

  const ads = [
    `🛋️ Feeling broke? You can **loan** up to ${formatCash(
      1000000
    )} and use it as an investment for something bigger.`,
    `🌒 Unable to obtain much of shadow coins? **CassExpress** only costs **1/10** of a shadow coin, 1 is **enough** to do **10 transactions!**`,
    `✅ You can actually use **abbreviations** like **10M, 5K, 45B,** or even **all** when performing numerical actions in **CassExpress**, convenient right?`,
    `💰 It is always best to claim **interest** whenever possible before withdrawing or depositing any amount of money, your **last interest claim** will reset every time you use the **withdraw** or **deposit** command.`,
    `📈 **Inflation** actually affects how much you could earn from **interest**s, the higher inflation, the lower interest you could **earn**.`,
    `📄 You can check your **activity log** by checking the **history**.`,
  ];
  for (let i = 0; i < 20 + Math.floor(Math.random() * 61); i++) {
    ads.sort(() => Math.random() - 0.5);
  }
  async function saveData(info, id = input.senderID) {
    return await money.set(id, info);
  }
  const ad = ads[0];
  const handlers = {
    async balance() {
      const formattedMoney = formatCash(bankData.bank);
      return output.reply(
        `📛 Hello **${name}**, here are your balances.\n\n🏦 Bank: ${formattedMoney}\n🎒 Local: ${formatCash(
          userMoney
        )}\n\n${ad}`
      );
    },
    async deposit() {
      let amount =
        args[1] === "all" ? userMoney : CassExpress.parseAbbr(args[1]);
      if (isNaN(amount) || amount > userMoney) {
        return output.reply(
          `💵 | Please enter a **valid** amount to deposit, your current balance is ${formatCash(
            userMoney
          )}.`
        );
      }
      if (amount <= 0) {
        return output.reply(`💵 | You cannot deposit 0 or less.`);
      }
      userMoney -= amount;
      bankData.bank += amount;
      bankData.lastInterestClaimed = Date.now();
      cassExpress.bankInLog(amount);

      await saveData({
        money: userMoney,
        bankData,
        cassExpress: cassExpress.raw(),
      });
      return output.reply(
        `🏛️ Congratulations **${name}**, the transaction was successful.\n\n💵 Deposited: ${formatCash(
          amount
        )}\n🎒 Local: ${formatCash(
          userMoney
        )} (-${amount})\n🏛️ Bank: ${formatCash(
          bankData.bank
        )} (+${amount})\n\n${ad}`
      );
    },

    async withdraw() {
      let amount =
        args[1] === "all" ? bankData.bank : CassExpress.parseAbbr(args[1]);
      if (isNaN(amount) || amount > bankData.bank) {
        return output.reply(
          `💵 | Please enter a **valid** amount to withdraw, your current bank balance is ${formatCash(
            bankData.bank
          )}.`
        );
      }
      if (amount <= 0) {
        return output.reply(`💵 | You cannot withdraw 0 or less.`);
      }
      userMoney += amount;
      bankData.bank -= amount;
      bankData.lastInterestClaimed = Date.now();
      cassExpress.bankOutLog(amount);

      await saveData({
        money: userMoney,
        bankData,
        cassExpress: cassExpress.raw(),
      });
      return output.reply(
        `🏛️ Congratulations **${name}**, the transaction was successful.\n\n💵 Withdrawn: ${formatCash(
          amount
        )}\n🎒 Local: ${formatCash(
          userMoney
        )} (+${amount})\n🏛️ Bank: ${formatCash(
          bankData.bank
        )} (-${amount})\n\n${ad}`
      );
    },
    async history() {
      const page = args[1];
      const mapped = cassExpress.stringBankLogs();
      const slicer = new Slicer(mapped.toReversed(), 10);
      const paged = slicer.getPage(page);
      return output.reply(
        `📄 Bank History of **${name}**:\n(latest first)\n\n${
          paged.length === 0 ? "This page is empty." : paged.join("\n")
        }\n\nType **${meta.name} history <page>** to see the next page.`
      );
    },
    async interest() {
      const originalInterestRate = 0.001;
      if (!bankData.lastInterestClaimed) {
        return output.reply(`You don't have transactions in this database.`);
      }
      const { cbankStorage = 10000000 } = userData;
      const lastInterestClaimed = bankData.lastInterestClaimed || Date.now();

      const currentTime = Date.now();

      const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;
      const cd = 5 * 60;
      if (timeDiffInSeconds < cd) {
        return output.reply(
          `💵 | You have already claimed your interest, please wait ${formatTime(
            (cd - timeDiffInSeconds) * 1000
          )} before claiming again.`
        );
      }
      const inflationRate = await getInflationRate();

      const interestNoInflation =
        bankData.bank * (originalInterestRate / 365) * timeDiffInSeconds;
      let interestEarned = Math.max(
        0,
        interestNoInflation - interestNoInflation * (inflationRate / 1000)
      );
      if (interestEarned < 1) {
        return output.reply(
          `🏛️ Failed claiming your interest because the calculated result is ${formatCash(
            0
          )}, please come back later!`
        );
      }
      if (interestEarned > cbankStorage) {
        interestEarned = cbankStorage;
      }

      bankData.lastInterestClaimed = currentTime;

      bankData.bank += interestEarned;
      cassExpress.bankInterestLog(interestEarned);
      const lostInterest = interestNoInflation - interestEarned;
      await saveData({
        bankData,
        cassExpress: cassExpress.raw(),
        cbankStorage,
      });
      return output.reply(
        `🏛️ Congratulations **${name}** for earning interests.\n\n💵 Interest Earned: ${formatCash(
          interestEarned
        )}/${formatCash(cbankStorage)}\n🏛️ Bank: ${formatCash(
          bankData.bank
        )} (+${interestEarned})\n🕜 Time Took: ${formatTime(
          timeDiffInSeconds * 1000
        )}\n📈 Interest you lost because of inflation: ${formatCash(
          lostInterest
        )} \n💵 Inflation Rate: ${inflationRate}\n🗃️ You can upgrade your **storage** in the shop.\n\n${ad}`
      );
    },
    async richest() {
      const allUsers = await money.getAll();
      const sortedKeys = Object.keys(allUsers)
        .filter(
          (i) =>
            typeof allUsers[i]?.bankData === "object" &&
            typeof allUsers[i].bankData.bank === "number"
        )
        .sort((a, b) => allUsers[b].bankData.bank - allUsers[a].bankData.bank)
        .slice(0, 20);
      let result = `🏛️ Richest Users in the **Bank** of **CassExpress**:\n\n`;
      let i = 0;
      for (const userID of sortedKeys) {
        i++;
        const userData = allUsers[userID];
        const { name = "Unregistered" } = userData;
        result += `${
          i === 1
            ? `👑 [font=double_struck]${charm} ${name
                .replaceAll(/\p{Emoji}/gu, "")
                .split("")
                .join(" ")} ${charm}[:font=double_struck]`
            : `${i}. ${name}`
        }\n`;
      }
      return output.reply(result);
    },
    async mails() {
      const mails = cassExpress.getMailList().toReversed();
      const slicer = new Slicer(mails);
      const paged = slicer.getPage(args[1]);
      return output.reply(
        `📪 **Your Mail Box**:\n\n${
          paged.length === 0
            ? `[ Page Empty ]`
            : paged
                .map(
                  (i) =>
                    `${mails.findIndex((item) => i === item) + 1}. **${
                      i.title
                    }** ${i.isRead ? "✅" : "❌"}\n${CassExpress.formatDate(
                      i.timeStamp
                    )}\n${formatTime(Date.now() - i.timeStamp)} ago.`
                )
                .join("\n\n")
        }\n\nUse ${meta.name} **readmail <index>** to read.\nUse ${
          meta.name
        } **mails <page>** to navigate through pages.\n\n${CassExpress.logo}`
      );
    },
    async readmail() {
      const mails = cassExpress.getMailList();
      const num = parseInt(args[1]);
      if (isNaN(num) || num < 1 || num > mails.length) {
        return output.reply(
          `💌 | Please enter a **valid** mail number. You currently have **${mails.length}** mails.`
        );
      }
      const mail = cassExpress.stringMailList().toReversed()[num - 1];
      const normalMail = mails.toReversed()[num - 1];
      normalMail.isRead = true;
      await saveData({
        cassExpress: cassExpress.raw(),
      });
      return output.reply(mail);
    },
    async teller() {
      const question = args.slice(1).join(" ");
      if (!question || question.length <= 10) {
        return output.replyStyled(
          `🏦 | Please enter a question to ask the bank teller that has more than 10 characters.`,
          style
        );
      }
      const tellerAI = new CustomAI({
        name: "Zia",
        languages: ["Taglish"],
        behavior: `You were cute female bank teller of CBank (CassExpress Bank) who only accept questions related to banking but sometimes do entertain random topics, you randomly stutters and hard to make straight words due to uncertainy, YOU COMMONLY USE "uh..", "uhm..", and other filler words, you're very shy, you're overreacting too for simple stuffs, some questions make you feel awkward, uncertain about what you say, fear of getting fired, still entertain random questions even if they don't make sense, you love sharing random topic too and sometimes you don't notice it, once you noticed you just stopped talking because of feeling embarrassed.\nYOU START DISCUSSION ABOUT SOMETHING ASKED AND NEVER STOP UNTIL YOU REALIZE THE TOPIC IS WAY TOO IRRELEVANT, like getting lost on talking about your k-pop idols and ask users many questions until you realized you're still a bank teller, and blushes on embarrassment.\nYou randomly stutter to something related to bank, because you were uncertain and afraid of making mistakes.`,
        expertise: "Bank Management",
        personality:
          "A Girl Next Door, Very Shy, Likes to Talk but sometimes got lost in the topic and stopped talking because you feel embarrassed.",
        tone: "Professional but Casual, Reletable, non-strict in punctuation, non strict in capitalization.",
        constraints: [
          "Never Greet with their name unless they greeted too",
          "For currencies, the dollar sign is always placed at the end of number ",

          "You must **bold** important words.",
          "Never date in the bank",
          "Never teach them how to exploit bank glitches",
          "Never buy items from strangers",
          "Allow them to ask anything as long as it is not against any law.",
          "Do not tolerate users who beg for money.",
          "Teach them about bank if they need",
          "Do not give them unsolicited info",
          "Do not ask for money",
          "Never give them money",
          "Shift the topic if it gets too ridiculous",
          "Guide them at your best",
          "You can share your personal stories to cheer them up",
          "Give them good tips",
        ],
        style: "One Time Conversation",
        stockKnowledge: [
          `All Options in Cass Express are: ${Object.keys(handlers).join(
            ", "
          )}`,
          `Guides for Users:\n\n${ads.join("\n")}`,
          `The user (${name}) currently have not claimed interest since ${formatTime(
            Date.now() - (bankData.lastInterestClaimed ?? Date.now())
          )}`,
          `The current name of user is "${name}", the user has ${bankData.bank}$ in the Cbank while the user has ${userMoney}$ in their local wallet.`,
        ],
      });
      let answer = await tellerAI.ask(question, name);
      answer = answer
        .replaceAll(bankData.bank + "$", formatCash(bankData.bank))
        .replaceAll(userMoney + "$", formatCash(userMoney))
        .replaceAll("$" + bankData.bank, formatCash(bankData.bank))
        .replaceAll("$" + pCy(userMoney), formatCash(userMoney));
      await output.replyStyled(answer, {
        ...style,
        contentFont: "none",
        title: `🎀 Zia ℂ𝔹𝕒𝕟𝕜 🏦`,
      });
      /*input.setReply(i.messageID, {
        key: "cassexpress",
        async callback(ctx) {
          return handlers.teller({ ...ctx, args: ctx.input.words });
        },
      });*/
    },
  };
  const targetHandler =
    handlers[
      Object.keys(handlers).find(
        (i) => i === targetArgs || i.toLowerCase() === targetArgs.toLowerCase()
      )
    ];
  if (typeof targetHandler === "function") {
    await targetHandler();
  } else {
    return output.reply(
      `${charm} Welcome **${name}** to CassExpress, please use one of our precious services.\n\n${Object.keys(
        handlers
      )
        .map((i) => `${circle} ${prefix}${meta.name} **${i}**`)
        .join("\n")}\n\n**Last Interest Claim**: ${formatTime(
        Date.now() - (bankData.lastInterestClaimed ?? Date.now())
      )}\n\n${ad}`
    );
  }
}
