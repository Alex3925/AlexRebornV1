// @ts-check
import {
  extractCommandRole,
  toTitleCase,
  UNISpectra,
} from "@cassidy/unispectra";
import { ShopClass } from "@cass-plugins/shopV2";

export const meta: CassidySpectra.CommandMeta = {
  name: "menu",
  author: "Liane Cagara",
  description:
    "Acts as a central hub, like a Start Menu, providing users with an overview of available commands, their functionalities, and access to specific command details. Helps users quickly navigate the bot's features.",
  version: "3.0.7",
  usage: "{prefix}{name} [commandName]",
  category: "System",
  role: 0,
  waitingTime: 0.1,
  requirement: "3.0.0",
  icon: "🧰",
  otherNames: ["start", "help"],
};

export const style: CassidySpectra.CommandStyle = {
  title: Cassidy.logo,
  titleFont: "none",
  contentFont: "fancy",
};

export async function entry({
  input,
  output,
  prefix,
  commandName,
  commandName: cmdn,
  money,
  multiCommands,
  InputRoles,
}: CommandContext) {
  const commands = multiCommands.toUnique((i) => i.meta?.name);

  const args = input.arguments;
  const { logo: icon } = global.Cassidy;
  const { shopInv, money: userMoney } = await money.queryItem(
    input.senderID,
    "shopInv",
    "money"
  );
  const shop = new ShopClass(shopInv);

  if (String(args[0]).toLowerCase() === "all") {
    const categorizedCommands: Record<string, CassidySpectra.CassidyCommand[]> =
      commands.values().reduce((categories, command) => {
        const category = command.meta.category || "Miscellaneous";
        if (!categories[category]) categories[category] = [];
        categories[category].push(command);
        return categories;
      }, {});
    const dontPrio: CassidySpectra.CommandTypes[] = ["arl_g", "cplx_g"];

    const getSumPrioIndex = (commands: CassidySpectra.CassidyCommand[]) => {
      if (!commands.length) return 0;

      return commands.reduce((sum, cmd) => {
        const idx = dontPrio.indexOf(cmd.meta.cmdType) * 5;
        return sum + (idx === -1 ? 0 : -idx);
      }, 0);
    };

    const sortedCategories = Object.keys(categorizedCommands).sort((a, b) => {
      const aCommands = categorizedCommands[a];
      const bCommands = categorizedCommands[b];

      const aPrio = getSumPrioIndex(aCommands);
      const bPrio = getSumPrioIndex(bCommands);

      if (aPrio !== bPrio) {
        return aPrio - bPrio;
      }

      return a.localeCompare(b);
    });

    let result = ``;

    for (const category of sortedCategories) {
      result += `${UNISpectra.arrowFromT} 📁 **${category}** (${categorizedCommands[category].length})\n`;
      for (const command of categorizedCommands[category]) {
        const { name, icon, shopPrice = 0 } = command.meta;
        const role = await extractCommandRole(command);
        const statusIcon =
          role === InputRoles.ADMINBOX && !input.hasRole(role)
            ? "📦"
            : InputRoles.MODERATORBOT && !input.hasRole(role)
            ? "🛡️"
            : role === InputRoles.ADMINBOT && !input.hasRole(role)
            ? "👑"
            : shop.isUnlocked(name)
            ? icon || "📄"
            : shop.canPurchase(name, userMoney)
            ? "🔐"
            : "🔒";

        let isAllowed =
          (!shopPrice || shop.isUnlocked(name)) && input.hasRole(role);
        if (!isAllowed) {
          continue;
        }
        result += `${statusIcon} ${toTitleCase(name)}, `;
      }
      result += `\n${UNISpectra.standardLineOld}\n`;
    }
    result = result.trim();

    result += `\n${UNISpectra.arrow} Command details: **${prefix}${commandName} <command>**\n`;

    const resultStr = `🔍 | **Available Commands** 🧰 (${commands.size})\n\n${result}${UNISpectra.charm} Developed by @**Liane Cagara** 🎀`;
    return output.reply(resultStr);
  } else if (String(args[0]).toLowerCase() === "basics") {
    const basicCommands = {
      daily: "Claim your ***FREE*** reward every day!",
      balance: "View your current coins! ( ***SOFT CURRENCY*** )",
      gift: "Enjoy ***ITEM REWARDS*** every 20+ minutes.",
      briefcase: "Learn how to manage your ***ITEMS*** after claiming gifts!",
      bank: "Wanna store your coins somewhere? Try ***BANK**",
      quiz: "Grind ***MORE*** coins by guessing!",
      wordgame: "Grind ***MORE & MORE*** coins by guessing words too!",
      garden: "Grow your ***GARDEN***!",
      buy: "Unlock ***HIDDEN*** commands by purchasing them!",
      rosashop:
        "Purchase items from shopkeepers and unlock ***NEW POSSIBILITIES***",
      pet: "Buy, Feed, and sell, or even battle using your ***PETS***",
      harvest:
        "Earn ***LOTS OF COINS*** without doing anything than tune and collect!",
      skyrise: "Wanna manage your own ***EMPIRE*** and ***EARN TOO***?",
      trade:
        "Sell, collaborate, and ***EARN*** from your items using the price you like!",
      arena: "Turn your pets into a ***GEM*** farm by battling with ai.",
      encounter:
        "Prepare your ***PETS*** for true danger and earn ***GEMS*** too!",
    };
    const entries = Object.entries(basicCommands);

    const filteredEntries = await Promise.all(
      entries.map(async (i) => {
        const command = commands.getOne(i[0]);
        if (!command) {
          return null;
        }
        const role = await extractCommandRole(command);

        const isAllowed =
          (!command.meta.shopPrice || shop.isUnlocked(command.meta.name)) &&
          input.hasRole(role);

        return isAllowed ? i : null;
      })
    );

    const validEntries = filteredEntries.filter(Boolean);

    const basicStr = validEntries
      .map(
        (i) =>
          `${commands.getOne(i[0])?.meta?.icon ?? "📁"} ${prefix}${i[0]} ${
            UNISpectra.arrowFromT
          } ${i[1]}`
      )
      .join("\n");

    let strs = [
      `${UNISpectra.arrow} Are you new to the game? Here are the ***BASICS***`,
      ``,
      `⌨️ You need to put prefixes for commands. For example: Type "${prefix}gift" without quotations to use the gift command.`,
      ``,
      `🔎 You may only use command that **exists** in the menu.`,
      ``,
      `‼️ Some commands require **higher role** to be used.`,
      ``,
      `📝 Do not put any fonts when writing a command. The bot does not accept "${prefix}**gift**" because it has fonts in it.`,
      ``,
      `🎒 What is an item key or inventory key? Here it is:`,
      `***EXAMPLE UI***: 🌒 **Shadow Coin** [shadowCoin]`,
      `The "shadowCoin" is the key, if the command asks you to put a key, that's it. For example: "${prefix}pet-feed Liane shadowCoin" - this will feed **Liane** with 🌒 **Shadow Coin**.`,
      ``,
      `✅ **Basic Commands**`,
      basicStr,
      ``,
      `${UNISpectra.arrowFromT} Try to ***Explore*** more commands!`,
      `${UNISpectra.arrowFromT} View by page: **${prefix}${commandName} <page>**`,
      `${UNISpectra.arrowFromT} View all: **${prefix}${commandName} all**`,
      `${UNISpectra.charm} Developed by @**Liane Cagara** 🎀`,
    ].join("\n");
    if (1) {
      return output.replyStyled(strs, {
        ...style,
        content: {
          text_font: "none",
        },
      });
    }
    return output.attach(strs, "http://localhost:8000/start.png", {
      ...style,
      content: {
        text_font: "none",
      },
    });
  } else if (args.length > 0 && isNaN(parseInt(args[0]))) {
    const commandName = args[0];
    const commandsFound = multiCommands
      .getMap(commandName)
      .toUnique((i) => i.meta.name)
      .values();
    let str = [];

    if (commandsFound.length > 0) {
      for (const command of commandsFound) {
        const {
          name,
          description,
          otherNames = [],
          usage,
          category = "None",
          waitingTime = 5,
          author = "Unknown",
          shopPrice = 0,
          icon: cmdIcon = "📄",
          version = "N/A",
          requirement = "N/A",
        } = command.meta;
        const status = shop.isUnlocked(name)
          ? "✅ Unlocked"
          : shop.canPurchase(name, userMoney)
          ? "💰 Buyable"
          : "🔒 Locked";
        let role = await extractCommandRole(command, true, input.tid);

        if (commandsFound.length !== 1) {
          str.push(`╭─── ${cmdIcon} **${toTitleCase(name)}** ───
│   📜 **Name**:
│   ${UNISpectra.charm} ${name}
│ 
│   💬 **Description**: 
│   ${UNISpectra.charm} ${description}
│ 
│   📝 **Aliases**: 
│   ${UNISpectra.charm} ${otherNames.length ? otherNames.join(", ") : "None"}
│   
│   🔎 See **${prefix}${cmdn} ${name}** for more info.
╰────────────────`);
        } else {
          str.push(`╭─── ${cmdIcon} **${toTitleCase(name)}** ───
│   📜 **Name**:
│   ${UNISpectra.charm} ${name}
│ 
│   💬 **Description**: 
│   ${UNISpectra.charm} ${description}
│ 
│   📝 **Aliases**: 
│   ${UNISpectra.charm} ${otherNames.length ? otherNames.join(", ") : "None"}
│ 
│   🛠️ **Usage**:
│   ${UNISpectra.charm} ${usage
            .replace(/{prefix}/g, prefix)
            .replace(/{name}/g, name)}
│ 
│   📁 **Category**:
│   ${UNISpectra.charm} ${category}
│ 
│   🔐 **Permissions**:
│   ${UNISpectra.charm} ${typeof role === "number" ? role : "None required"}
│ 
│   ⏳ **Cooldown**:
│   ${UNISpectra.charm} ${waitingTime} 
│ 
│   ✍️ **Author**: 
│   ${UNISpectra.charm} ${author}
│ 
│   💸 **Price**:
│   ${UNISpectra.charm} ${shopPrice ? `$${shopPrice} ${status}` : "⚡ Free"}
│ 
│   🖼️ **Icon**:
│   ${UNISpectra.charm} ${cmdIcon}
│ 
│   📌 **Version**:
│   ${UNISpectra.charm} ${version}
│ 
│   🛡️ **Requirement**:
│   ${UNISpectra.charm} ${requirement}
╰────────────────`);
        }
      }
      return output.replyStyled(str.join("\n\n"), {
        title: Cassidy.logo,
        contentFont: "fancy",
      });
    } else {
      output.reply(
        `${icon}\n\n❌ Oops! **${commandName}** isn't a valid command. Try another!`
      );
    }
    return;
  } else if (!isNaN(parseInt(args[0])) && args[0]) {
    const categorizedCommands: Record<string, CassidySpectra.CassidyCommand[]> =
      commands.values().reduce((categories, command) => {
        const category = command.meta.category || "Miscellaneous";
        if (!categories[category]) categories[category] = [];
        categories[category].push(command);
        return categories;
      }, {});
    const dontPrio: CassidySpectra.CommandTypes[] = ["arl_g", "cplx_g"];

    // const sortedCategories = Object.keys(categorizedCommands).sort((a, b) => {
    //   const aContainsGame = a.toLowerCase().includes("game");
    //   const bContainsGame = b.toLowerCase().includes("game");

    //   const aCommands = categorizedCommands[a];
    //   const bCommands = categorizedCommands[b];

    //   if (aContainsGame && bContainsGame) {
    //     return a.localeCompare(b);
    //   }

    //   if (aContainsGame) {
    //     return -1;
    //   }
    //   if (bContainsGame) {
    //     return 1;
    //   }

    //   return a.localeCompare(b);
    // });

    const getSumPrioIndex = (commands: CassidySpectra.CassidyCommand[]) => {
      if (!commands.length) return 0;

      return commands.reduce((sum, cmd) => {
        const idx = dontPrio.indexOf(cmd.meta.cmdType) * 5;
        return sum + (idx === -1 ? 0 : -idx);
      }, 0);
    };

    const sortedCategories = Object.keys(categorizedCommands).sort((a, b) => {
      const aCommands = categorizedCommands[a];
      const bCommands = categorizedCommands[b];

      const aPrio = getSumPrioIndex(aCommands);
      const bPrio = getSumPrioIndex(bCommands);

      if (aPrio !== bPrio) {
        return aPrio - bPrio;
      }

      return a.localeCompare(b);
    });

    const itemsPerPage = 3;
    const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
    let currentPage = parseInt(args[0]) || 1;

    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;

    const pageCategories = sortedCategories.slice(startIndex, endIndex);

    let result = `**Page ${currentPage} of ${totalPages}** 📄\n`;
    let preff = "│ ";

    for (const category of pageCategories) {
      result += `\n╭─────────────❍\n${preff} ${UNISpectra.arrow} ***${category}*** 📁 (${categorizedCommands[category].length})\n${preff}\n`;
      for (const command of categorizedCommands[category]) {
        const { name, icon, shopPrice = 0 } = command.meta;
        const role = await extractCommandRole(command);
        const statusIcon =
          role === InputRoles.ADMINBOX && !input.hasRole(role)
            ? "📦"
            : InputRoles.MODERATORBOT && !input.hasRole(role)
            ? "🛡️"
            : role === InputRoles.ADMINBOT && !input.hasRole(role)
            ? "👑"
            : shop.isUnlocked(name)
            ? icon || "📄"
            : shop.canPurchase(name, userMoney)
            ? "🔐"
            : "🔒";

        let isAllowed =
          (!shopPrice || shop.isUnlocked(name)) && input.hasRole(role);
        result += `${preff}  ${statusIcon} ${prefix}${
          isAllowed ? `**${toTitleCase(name)}**` : `${toTitleCase(name)}`
        }${
          shopPrice
            ? ` - $${shopPrice} ${
                shop.isUnlocked(name)
                  ? "✅"
                  : shop.canPurchase(name, userMoney)
                  ? "💰"
                  : "❌"
              }`
            : ""
        }\n`;
      }
      result += `╰─────────────❍\n`;
    }
    result = result.trim();

    result += `\n\n${UNISpectra.arrow} ***Explore*** more commands!\n`;
    result += `${UNISpectra.arrow} View another page: **${prefix}${commandName} <page>**\n`;
    result += `${UNISpectra.arrow} Next page: **${prefix}${commandName} ${
      currentPage + 1
    }**\n`;
    result += `${UNISpectra.arrow} Command details: **${prefix}${commandName} <command>**\n`;

    const resultStr = `🔍 | **Available Commands** 🧰 (${commands.size})\n\n${result}${UNISpectra.charm} Developed by @**Liane Cagara** 🎀`;
    return output.reply(resultStr);
  } else {
    const basicCommands = {
      daily: "Claim your ***FREE*** reward every day!",
      balance: "View your current coins! ( ***SOFT CURRENCY*** )",
      gift: "Enjoy ***ITEM REWARDS*** every 20+ minutes.",
      briefcase: "Learn how to manage your ***ITEMS*** after claiming gifts!",
      bank: "Wanna store your coins somewhere? Try ***BANK**",
      quiz: "Grind ***MORE*** coins by guessing!",
      wordgame: "Grind ***MORE & MORE*** coins by guessing words too!",
      garden: "Grow your ***GARDEN***!",
      buy: "Unlock ***HIDDEN*** commands by purchasing them!",
      rosashop:
        "Purchase items from shopkeepers and unlock ***NEW POSSIBILITIES***",
      pet: "Buy, Feed, and sell, or even battle using your ***PETS***",
      harvest:
        "Earn ***LOTS OF COINS*** without doing anything than tune and collect!",
      skyrise: "Wanna manage your own ***EMPIRE*** and ***EARN TOO***?",
      trade:
        "Sell, collaborate, and ***EARN*** from your items using the price you like!",
      arena: "Turn your pets into a ***GEM*** farm by battling with ai.",
      encounter:
        "Prepare your ***PETS*** for true danger and earn ***GEMS*** too!",
    };
    const entries = Object.entries(basicCommands);

    const filteredEntries = await Promise.all(
      entries.map(async (i) => {
        const command = commands.getOne(i[0]);
        if (!command) {
          return null;
        }
        const role = await extractCommandRole(command);

        const isAllowed =
          (!command.meta.shopPrice || shop.isUnlocked(command.meta.name)) &&
          input.hasRole(role);

        return isAllowed ? i : null;
      })
    );

    const validEntries = filteredEntries.filter(Boolean);

    const basicStr = validEntries
      .map(
        (i) =>
          `${commands.getOne(i[0])?.meta?.icon ?? "📁"} ${(
            commands.getOne(i[0])?.meta?.usage ?? "{prefix}{name}"
          )
            .replaceAll("{prefix}", prefix)
            .replaceAll("{name}", i[0])}`
      )
      .join("\n");

    let strs = [
      `✅ **Basic Commands**`,
      basicStr,
      ``,
      `${UNISpectra.arrowFromT} Try to ***Explore*** more commands!`,
      `${UNISpectra.arrowFromT} View ALL COMMANDS: **${prefix}${commandName} all**`,
      `${UNISpectra.arrowFromT} View by page: **${prefix}${commandName} <page>**`,
      `${UNISpectra.arrowFromT} View basics: **${prefix}${commandName} basics**`,

      `${UNISpectra.charm} Developed by @**Liane Cagara** 🎀`,
    ].join("\n");
    if (1) {
      return output.replyStyled(strs, {
        ...style,
      });
    }
    return output.attach(strs, "http://localhost:8000/start.png", {
      ...style,
    });
  }
}
