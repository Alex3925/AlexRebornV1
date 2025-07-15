// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "gift",
  description: "Claim your gift every 20 minutes.",
  version: "2.0.5",
  author: "Liane Cagara",
  category: "Rewards",
  permissions: [0],
  waitingTime: 1,
  noPrefix: false,
  requirement: "3.0.0",
  icon: "🎁",
  requiredLevel: 3,
  cmdType: "cplx_g",
};

/**
 * @type {CassidySpectra.CommandStyle}
 */
export const style = {
  title: "Free Gift 💗",
  titleFont: "bold",
  contentFont: "fancy",
};

const diaCost = 2;
const { parseCurrency: pCy } = global.utils;
const { invLimit } = global.Cassidy;

/**
 *
 * @param {CommandContext} param0
 * @returns
 */
async function handlePaid({
  input,
  output,
  money,
  Inventory,
  generateGift,
  Collectibles,
  langParser,
}) {
  const getLang = langParser.createGetLang(langs);
  let { inventory: rawInv = [], collectibles: rawCll = [] } =
    await money.getItem(input.senderID);
  if (String(input.words[0]).toLowerCase() !== "buy") {
    return;
  }
  let amount = parseInt(input.words[1]);
  if (isNaN(amount)) {
    amount = 1;
  }
  if (rawInv.length + amount > invLimit) {
    return output.replyStyled(getLang("tooManyItems"), style);
  }
  const inventory = new Inventory(rawInv);
  const collectibles = new Collectibles(rawCll);
  if (!collectibles.hasAmount("gems", diaCost * amount)) {
    if (input.isAdmin && input.words[1] === "cheat") {
    } else {
      return output.replyStyled(
        getLang("notEnoughGems", diaCost * amount),
        style
      );
    }
  }
  let firstGift = null;
  for (let index = 0; index < amount; index++) {
    const giftItem = generateGift();
    Object.assign(giftItem, {
      key: "fortuneEnv",
      name: "Fortune Envelope",
      icon: "🧧",
      flavorText:
        "A token of luck and prosperity, sealed with good wishes and ancient blessings, that might grant you something. It's not guaranteed, but you can use it with the inventory command, if you know how.",
      type: "treasure",
      treasureKey: "generic_exclude=>curse",
      cannotSend: true,
      cannotToss: true,
      cannotTrade: true,
      sellPrice: 20000,
    });
    firstGift = giftItem;
    inventory.addOne(giftItem);
    collectibles.raise("gems", -diaCost);
  }
  await money.setItem(input.senderID, {
    inventory: Array.from(inventory),
    collectibles: Array.from(collectibles),
  });
  const data = await output.replyStyled(
    getLang(
      "boughtGift",
      firstGift.icon,
      firstGift.name,
      String(pCy(collectibles.getAmount("gems"))),
      String(diaCost * amount),
      amount
    ),
    style
  );
  data.atReply(handlePaid);
}

export const langs = {
  en: {
    tooManyItems: "❌ You're carrying too many items!",
    notEnoughGems: "❌ You don't have %1💎 to purchase it.",
    boughtGift:
      "✅ You bought a **%1 %2** **(x%5)**! Check your inventory to see it.\n\n💎 **%3** (-%4)",
    alreadyClaimed:
      "⏳ You've already claimed your free gift. Please wait for %1 hours, %2 minutes, and %3 seconds before claiming again.\nReply **buy** and <amount> to purchase a fortune **envelope** for %4💎\n\n**💎 %5**",
    claimedGift:
      "🎁 You've claimed your free gift %2! Check your inventory and come back later for more.\n\nTo open, use **%1bc use %3** without fonts.",
  },
  tl: {
    tooManyItems: "❌ OMG, your items are like, sobrang dami na, girl!",
    notEnoughGems: "❌ Wala kang %1💎, so sad naman!",
    boughtGift:
      "✅ You bought a **%1 %2** **(x%5)**, so fab! Check mo your inventory na.\n\n💎 **%3** (-%4)",
    alreadyClaimed:
      "⏳ Na-claim mo na your free gift, besh! Wait ka lang ng %1 hours, %2 minutes, and %3 seconds before you can claim ulit.\nJust reply **buy** at <amount> if you wanna get a fortune **envelope** for %4💎\n\n**💎 %5**",
    claimedGift:
      "🎁 Yes, na-claim mo na your free gift %2! So cute, check your inventory and come back later ha, so fun!\n\nPara maopen, gamitin mo yung **%1bc use %3** na command pero walang font.",
  },
};

/**
 *
 * @param {CommandContext} param0
 * @returns
 */
export async function entry({
  input,
  output,
  money,
  Inventory,
  generateGift,
  Collectibles,
  langParser,
  prefix,
}) {
  const getLang = langParser.createGetLang(langs);
  let {
    inventory: rawInv = [],
    lastGiftClaim,
    collectibles: rawCll = [],
  } = await money.getItem(input.senderID);
  if (rawInv.length >= invLimit) {
    return output.reply(getLang("tooManyItems"));
  }
  const inventory = new Inventory(rawInv);
  const collectibles = new Collectibles(rawCll);
  const currentTime = Date.now();
  const msWait = 20 * 60 * 1000;

  let canClaim = false;

  if (!lastGiftClaim) {
    canClaim = true;
  } else {
    const timeElapsed = currentTime - lastGiftClaim;
    if (timeElapsed >= msWait) {
      canClaim = true;
    } else if (input.isAdmin && input.arguments[0] === "cheat") {
      canClaim = true;
    } else {
      const timeRemaining = msWait - timeElapsed;
      const hoursRemaining = Math.floor(
        (timeRemaining / (1000 * 60 * 60)) % 24
      );
      const minutesRemaining = Math.floor((timeRemaining / (1000 * 60)) % 60);
      const secondsRemaining = Math.floor((timeRemaining / 1000) % 60);

      const info = await output[input.isWeb ? "reply" : "attach"](
        getLang(
          "alreadyClaimed",
          String(hoursRemaining),
          minutesRemaining,
          secondsRemaining,
          diaCost,
          pCy(collectibles.getAmount("gems"))
        ),
        input.isWeb ? undefined : "http://localhost:8000/gift.png"
      );
      info.atReply(handlePaid);
      return;
    }
  }

  if (canClaim) {
    const giftItem =
      Math.random() < 0.5 ? generateGift() : generateGift("pack");
    giftItem.cannotSend = true;
    inventory.addOne(giftItem);

    await money.setItem(input.senderID, {
      inventory: Array.from(inventory),
      lastGiftClaim: currentTime,
    });

    if (input.isWeb) {
      return output.reply(
        getLang(
          "claimedGift",
          prefix,
          giftItem.type === "treasure" ? "treasure" : "pack",
          giftItem.type === "treasure" ? "gift" : "giftPack"
        )
      );
    }
    return output.attach(
      getLang(
        "claimedGift",
        prefix,
        giftItem.type === "treasure" ? "treasure" : "pack",
        giftItem.type === "treasure" ? "gift" : "giftPack"
      ),
      "http://localhost:8000/gift.png"
    );
  }
}
