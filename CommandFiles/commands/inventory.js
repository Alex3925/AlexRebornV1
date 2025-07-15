import { ReduxCMDHome } from "@cassidy/redux-home";
import { UNIRedux } from "@cassidy/unispectra";
import { GearsManage, PetPlayer } from "../plugins/pet-fight";
import { Collectibles, Inventory } from "@cass-modules/InventoryEnhanced";
import {
  registeredExtensions,
  getEnabledExtensions,
  sortExtensions,
  CassExtensions,
} from "../modules/cassXTensions";

export const meta = {
  name: "inventory",
  description: "Manage your inventory.",
  author: "Liane Cagara",
  version: "1.1.3",
  usage: "{prefix}inventory <action> [args]",
  category: "Inventory",
  permissions: [0],
  noPrefix: false,
  waitingTime: 1,
  otherNames: ["inv", "items"],
  requirement: "3.0.0",
  icon: "🎒",
  cmdType: "cplx_g",
};

const { invLimit } = global.Cassidy;

export const style = {
  title: "Inventory 🎒",
  titleFont: "bold",
  contentFont: "fancy",
};
const { parseCurrency: pCy } = global.utils;

/**
 * @type {CommandEntry}
 */
export async function entry({ ...ctx }) {
  /**
   *
   *
 }
   */
  const {
    input,
    output,
    money,
    args,
    // Inventory,
    prefix,
    generateTreasure,
    // GearsManage,
    commandName,
    // PetPlayer,
    // Collectibles,
  } = ctx;
  let userData = await money.get(input.senderID);
  return output.reply(
    "Inventory is getting deprecated!\n\nUse **briefcase** instead."
  );

  const { inventory, petsData, gearsData, collectibles } = getDatas(userData);
  const extensions = getEnabledExtensions(userData).getCategorized("inventory");

  const userDataCopy = userData;
  function getDatas({ ...data }) {
    const inventory = new Inventory(data.inventory);
    data.petsData ??= [];
    const petsData = new Inventory(data.petsData);
    const gearsData = new GearsManage(data.gearsData);
    const collectibles = new Collectibles(data.collectibles ?? []);
    return { inventory, petsData, gearsData, collectibles };
  }
  const a = UNIRedux.standardLine;

  function getPetList(
    newData = petsData,
    newGear = gearsData,
    targetItem = {},
    index = 0
  ) {
    return newData
      .getAll()
      .map((pet) => {
        const gearData = newGear.getGearData(pet.key);
        const player = new PetPlayer(pet, gearData.toJSON());
        const gearDataAfter = gearData.clone();
        if (targetItem.type === "armor") {
          gearDataAfter.equipArmor(index, targetItem);
        } else if (targetItem.type === "weapon") {
          gearDataAfter.equipWeapon(targetItem);
        }
        const playerAfter = new PetPlayer(pet, gearDataAfter.toJSON());
        const atkDiff = playerAfter.ATK - player.ATK;
        const defDiff = playerAfter.DF - player.DF;
        const magicDiff = playerAfter.MAGIC - player.MAGIC;
        return `${player.getPlayerUI()}\nATK **${player.ATK} -> ${
          player.ATK + atkDiff
        }** (${atkDiff < 0 ? atkDiff : `+${atkDiff}`})\nDEF **${player.DF} -> ${
          player.DF + defDiff
        }** (${defDiff < 0 ? defDiff : `+${defDiff}`})\nMAGIC **${
          player.MAGIC
        } -> ${player.MAGIC + magicDiff}** (${
          magicDiff < 0 ? magicDiff : `+${magicDiff}`
        }) \n${a}\n⚔️ ${gearData.getWeaponUI()}\n🔰 ${gearData.getArmorUI(
          0
        )}\n🔰 ${gearData.getArmorUI(1)}`;
      })
      .join("\n" + a + "\n\n");
  }

  const [...actionArgs] = input.arguments;

  const home = new ReduxCMDHome(
    {
      isHypen: true,
    },
    [
      {
        key: "list",
        description: "Displays all items in the user's inventory.",
        aliases: ["-l"],
        args: ["<optional uid>"],
        async handler() {
          let userData = userDataCopy;
          let { inventory, petsData, gearsData, collectibles } =
            getDatas(userData);
          let otherTarget = null;
          if (actionArgs[0]) {
            const allUsers = await money.getAll();
            const target = allUsers[actionArgs[0]];
            if (!target) {
              return output.reply(`User not found.`);
            }
            ({ inventory, petsData, gearsData, collectibles } =
              getDatas(target));
            otherTarget = target;
            userData = target;
          }
          const items = inventory.getAll();
          collectibles.register("money", {
            key: "money",
            name: "Money",
            flavorText: "This is what you have, anytime, anywhere.",
            icon: "💵",
            type: "currencyInv",
          });
          collectibles.register("puzzlePiece", {
            key: "puzzlePiece",
            name: "Puzzle Piece",
            flavorText: "Basically, Idk.",
            icon: "🧩",
            type: "currencyInv",
          });

          collectibles.set("money", userData.money);
          collectibles.set("puzzlePiece", userData.wordGameWins ?? 0);
          collectibles.removeEmpty();

          const categoryMap = new Map();
          for (const item of items) {
            const category = item.type;
            if (!categoryMap.has(category)) {
              categoryMap.set(category, []);
            }
            const map = categoryMap.get(category);
            map.push(item);
          }

          let itemList = ``;
          const sorted = Array.from(categoryMap).sort((a, b) =>
            a[0].localeCompare(b[0])
          );
          let cache1 = [];
          for (const [category, items] of sorted) {
            itemList += `☆ [font=fancy_italic]${String(category)
              .toUpperCase()
              .replaceAll("_", " ")}[:font=fancy_italic]\n\n`;

            const itemCounts = new Map();

            items.forEach((item) => {
              const key = item.key;
              if (itemCounts.has(key)) {
                itemCounts.set(key, itemCounts.get(key) + 1);
              } else {
                itemCounts.set(key, 1);
              }
            });

            itemList += Array.from(itemCounts.entries())
              .map(([key, count]) => {
                const item = items.find((item) => item.key === key);
                return `${item.icon}${count > 1 ? ` **x${count}**` : ""} ${
                  item.name
                } (${item.key})`;
              })
              .join("\n");

            itemList += `\n\n`;
          }

          const cllMap = new Map();
          for (const item of collectibles) {
            const category = item.metadata.type ?? "Uncategorized";
            if (!cllMap.has(category)) {
              cllMap.set(category, []);
            }
            const map = cllMap.get(category);
            map.push(item);
          }
          let cllList = ``;
          const sorted2 = Array.from(cllMap).sort((a, b) =>
            a[0].localeCompare(b[0])
          );
          for (const [category, items] of sorted2) {
            cllList += `☆ [font=fancy_italic]${String(category)
              .toUpperCase()
              .replaceAll("_", " ")}[:font=fancy_italic]\n\n`;
            cllList += items
              .map(
                ({ metadata, amount }) =>
                  `${metadata.icon} ${
                    amount > 1 ? `**x${pCy(amount)}**` : ""
                  } ${metadata.name} (${metadata.key})`
              )
              .join("\n");
            cllList += "\n\n";
          }
          const finalRes =
            (otherTarget
              ? `✅ Checking ${otherTarget.name ?? "Unregistered"}\n\n`
              : "") +
            `💼 **Classic Items** ✦ **${
              inventory.getAll().length
            }/${invLimit}** (${Math.floor(
              (inventory.size() / invLimit) * 100
            )}%)\n\n${itemList.trim() || "No items available."}\n\n${
              UNIRedux.standardLine
            }\n🗝️ **Collectibles** ✦ Unlimited (UNLI%)\n\n${cllList.trim()}`;
          /**
           * @type {typeof extensions}
           */
          const purposed = sortExtensions(
            extensions.filter((i) => i.info.purpose === "item_list_result")
          );
          const ctxEXT = {
            userData,
            inventory,
            petsData,
            gearsData,
            collectibles,
            categoryMap,
            cllMap,
            itemList,
            cllList,
            invLimit,
            UNIRedux,
            sortedCategories: sorted,
            sortedCollectibles: sorted2,
            otherTarget,
            invUsage: inventory.size(),
            invPercentage: Math.floor((inventory.size() / invLimit) * 100),
            finalRes,
            extensions: sortExtensions(
              extensions.filter((i) => i.info.purpose === "item_list_result")
            ),
          };

          let newRes = finalRes;

          for (const extension of purposed) {
            try {
              const res2 = await extension.info.hook(ctx, ctxEXT);
              if (res2) {
                newRes = res2;
              }
            } catch (error) {
              return output.error(error);
            }
          }

          return output.reply(newRes);
        },
      },
      {
        key: "inspect",
        description: "Shows detailed information about a specific item.",
        aliases: ["examine", "check", "look", "-i"],
        args: ["<item_id | index>"],
        async handler() {
          const keyToCheck = actionArgs[0];
          if (!keyToCheck) {
            return output.reply("❌ Please specify an item key to inspect.");
          }
          const altKey = actionArgs
            .map((key, index) => {
              if (index !== 0) {
                return `${key.charAt(0)?.toUpperCase()}${key
                  .slice(1)
                  .toLowerCase()}`;
              } else {
                return key.toLowerCase();
              }
            })
            .join("");
          const lastKey = inventory
            .getAll()
            .find((item) => item.name === actionArgs.join(" "));
          const item =
            inventory.getOne(keyToCheck) ||
            inventory.getOne(altKey) ||
            inventory.getOne(lastKey);
          if (!item) {
            return output.reply(
              `Item with key "${keyToCheck}" not found in your inventory.`
            );
          }
          const { icon, name, flavorText } = item;
          return output.reply(
            `${icon} **${name}** (${inventory.getAmount(
              keyToCheck
            )})\n✦ ${flavorText}\n\n***Type:*** ${item.type}\nHeals ${
              item.heal ?? 0
            }HP\n+ ${item.def ?? 0} DEF\n+ ${
              item.atk ?? 0
            } ATK\n🐾 Saturation: ${
              (item.saturation ?? 0) / 60 / 1000
            } minutes.\n\n***Sell Price***: $${item.sellPrice ?? 0}💵`
          );
        },
      },
      {
        key: "use",
        description:
          "Uses or activates a specific item for its intended effect.",
        aliases: ["activate", "consume", "equip", "-u"],
        args: ["<item_id | index>"],
        async handler() {
          const [key] = actionArgs;

          /**
           * @type {CassExtensions<import("../modules/cassXTensions.ts").InventoryExtension>}
           */
          const purposed = sortExtensions(
            extensions.filter((i) => i.info.purpose.startsWith("item_use_"))
          );
          if (!key) {
            return output.reply(`❌ Please specify an item key to use.`);
          }
          const eKey = "--unequip";
          let item = inventory.getOne(key);
          if (!item && !String(key).startsWith(eKey)) {
            return output.reply(
              `❌ Item with key "${key}" not found in your inventory.`
            );
          }

          item ??= {};
          item.type ??= "generic";
          const targets = purposed.filter((i) =>
            i.info.purpose.endsWith(item.type)
          );

          if (targets.length > 0) {
            /**
             * @type {string}
             */
            const replyString = "";

            for (const ext of targets) {
              try {
                const strRes = await ext.info.hook(ctx, item);
                if (typeof strRes === "string") {
                  replyString = strRes;
                }
              } catch (error) {
                console.error(error);
              }
            }

            return replyString ? output.reply(replyString) : null;
          }

          if (item?.type === "food") {
            return output.reply(
              `${item.icon} **${item.name}** is a general food item that can be used to **feed your pet**. 
                Feeding your pet with this item will heal it, and the amount of healing provided affects how much experience 
                your pet gains. More healing results in more experience!`
            );
          }
          if (item?.type.endsWith("_food")) {
            const petType = item.type.replaceAll("_food", "");
            const durationMinutes = ((item.saturation ?? 0) / 60000).toFixed(1);

            if (petType === "any") {
              return output.reply(
                `${item.icon} **${item.name}** is a versatile food item that can be **fed to any pet**, 
                    regardless of its type. 
                    Feeding this to a pet will keep it satisfied for **${durationMinutes} minutes**. 
                    It's a perfect choice for pet owners with multiple pet types!`
              );
            } else {
              return output.reply(
                `${item.icon} **${item.name}** is a specialized food item.\nIt can be **fed** to any pet of type **${petType}**.\nFeeding this to a compatible pet will keep it satisfied for **${durationMinutes} minutes**.\nMake sure the pet matches the type to benefit from this food!`
              );
            }
          }

          if (item?.type === "pet") {
            return output.reply(
              `${item.icon} **${item.name}** is a **caged pet**. 
                You might be able to **uncage** it using a command like **${prefix}pet-uncage ${item.key}**\nHonestly, I have no idea if that command actually works, but hey, it might be worth a try!`
            );
          }

          /*if (!item.canUse) {
        return output.reply(`❌ This item has no direct usage here.`);
      }*/
          if (
            item.type === "armor" ||
            item.type === "weapon" ||
            key.startsWith(eKey)
          ) {
            if (petsData.getAll().length === 0) {
              return output.reply(
                `❌ You don't have any pets to use this item.`
              );
            }
            const i = await output.reply(
              `**Choose a pet name to equip this item:** (Also try <pet name> <armor slot number> for armors)\n\n${getPetList(
                petsData,
                gearsData,
                item,
                0
              )}`
            );
            input.setReply(i.messageID, {
              key: commandName,
              callback: handleEquip,
            });
            async function handleEquip(ctx) {
              if (ctx.input.senderID !== input.senderID) {
                return;
              }
              const userData = await ctx.money.get(ctx.input.senderID);
              const { inventory, petsData, gearsData } = getDatas(userData);
              item ??= {};
              if (!key.startsWith(eKey) && !inventory.has(item.key)) {
                return ctx.output.reply(
                  `❓ Where did the item go? I can't find it from your inventory.`
                );
              }

              const petName = String(ctx.input.words[0]);
              let slot = parseInt(ctx.input.words[1]) - 1;
              if (isNaN(slot)) {
                slot = 0;
              }
              let pet = petsData
                .getAll()
                .find(
                  (i) =>
                    String(i.name).toLowerCase().trim() ===
                    petName.toLowerCase().trim()
                );
              if (!pet) {
                return ctx.output.reply(
                  `❌ You don't have a pet named "${petName}"`
                );
              }
              const gearData = gearsData.getGearData(pet.key);
              const [, keyType] = key.split("_");
              item ??= {};

              if (item.type === "armor") {
                const oldArmor = gearData.equipArmor(slot, item);
                inventory.deleteOne(item.key);

                if (oldArmor) {
                  inventory.addOne(oldArmor);
                }
              } else if (item.type === "weapon") {
                const oldWeapon = gearData.equipWeapon(item);
                inventory.deleteOne(item.key);
                if (oldWeapon) {
                  inventory.addOne(oldWeapon);
                }
              } else if (keyType === "armor") {
                const oldArmor = gearData.equipArmor(slot, item);

                if (oldArmor) {
                  if (inventory.getAll().length >= invLimit) {
                    return ctx.output.reply(
                      `❌ You're carrying too many items`
                    );
                  }
                  inventory.addOne(oldArmor);
                }
              } else if (keyType === "weapon") {
                const oldWeapon = gearData.equipWeapon(item);

                if (oldWeapon) {
                  if (inventory.getAll().length >= invLimit) {
                    return ctx.output.reply(
                      `❌ You're carrying too many items`
                    );
                  }
                  inventory.addOne(oldWeapon);
                }
              } else {
                return ctx.output.reply(
                  `❌ This item is no longer an armor or weapon, what bug are you trying to discover? Or maybe wrong syntax for ${eKey}_armor or ${eKey}_weapon`
                );
              }
              gearsData.setGearData(pet.key, gearData);
              await ctx.money.set(ctx.input.senderID, {
                inventory: Array.from(inventory),
                gearsData: gearsData.toJSON(),
              });
              await ctx.output.reply(
                `✅ Equipped **${item.icon}** **${item.name}** to **${
                  pet.name
                }**. (use inv use --unequip_armor or --unequip_weapon to unequip.)\n\n${getPetList(
                  petsData,
                  gearsData,
                  {},
                  0
                )}`
              );
            }
            return;
          }
          if (item.type === "cheque") {
            const userInventory = inventory;
            let chequeKey = actionArgs[0];
            if (!String(chequeKey).startsWith("cheque_")) {
              chequeKey = `cheque_${chequeKey}`;
            }
            const itemToCash = userInventory.getOne(chequeKey);

            if (
              !itemToCash ||
              !chequeKey.startsWith("cheque_") ||
              itemToCash?.type !== "cheque"
            ) {
              return output.reply(
                `❌ No valid cheque found with the specified key.`
              );
            }

            const chequeAmount = parseInt(itemToCash.chequeAmount);

            if (isNaN(chequeAmount) || chequeAmount <= 0) {
              return output.reply(`❌ The cheque amount is invalid.`);
            }

            userInventory.deleteOne(chequeKey);
            userData.money += chequeAmount;

            await money.set(input.senderID, {
              inventory: Array.from(userInventory),
              money: userData.money,
            });

            return output.reply(
              `✅ Cashed a cheque worth $${chequeAmount}. Your new balance is $${userData.money}.`
            );
          }
          if (item.type === "potion") {
            return output.reply(
              item.useText ??
                `✦ A potion? What is a **potion**? Can you eat it? can you drink it? CAN YOU INJECT IT!??

${item.icon} **${item.name}**: "Shut up ${item.name} is taking a NAP!"

✦ Since when did items learned how to **talk**?`
            );
          }
          if (item.type !== "treasure") {
            const flavorText =
              item.useText ??
              `You used ${item.icon} ${item.name}, nothing happened.`;
            return output.reply(`✅ ${flavorText}`);
          }
          /*const treasureItem = generateTreasure(item.treasureKey);
        if (!treasureItem) {
          return output.reply(`${item.icon} The treasure failed to open.`);
        }*/
          let diaCost = 5;
          let tresCount = item.tresCount || 5;
          const author = input.senderID;
          let chosenNumbers = [];
          async function handleTriple(ctx) {
            const { input, output, money } = ctx;

            if (author !== ctx.input.senderID) {
              return;
            }
            const userData = await ctx.money.get(ctx.input.senderID);
            const { inventory, collectibles } = getDatas(userData);

            const { treasures, paidMode } = ctx.repObj;

            if (paidMode && !collectibles.hasAmount("gems", diaCost)) {
              return output.reply(`❌ | You cannot afford a retry.`);
            }
            if (paidMode && String(input.words[0]).toLowerCase() !== "retry") {
              return;
            }
            if (paidMode) {
              input.words.shift();
            }

            if (!inventory.has(item.key) && !paidMode) {
              return output.reply(
                `❌ | Where did the item go? I can't find it from your inventory.`
              );
            }
            let number = parseInt(input.words[0]);
            if (chosenNumbers.includes(number)) {
              return output.reply(`❌ | You already chose this number.`);
            }
            if (chosenNumbers.length >= tresCount) {
              return output.reply(`❌ | There's nothing to choose.`);
            }
            if (isNaN(number) || number < 1 || number > tresCount) {
              return output.reply(
                `❌ | Please go back to the previous message and reply a number **between 1 to ${tresCount}.**`
              );
            }
            const treasure = treasures[number - 1];
            if (!treasure) {
              return output.reply(`❌ | The treasure failed to open, weird.`);
            }
            if (inventory.getAll().length >= invLimit) {
              return output.reply(`❌ | You're carrying too many items!`);
            }
            inventory.addOne(treasure);
            if (paidMode) {
              collectibles.raise("gems", -diaCost);
            }
            const treasureItem = treasure;
            if (!paidMode) {
              inventory.deleteOne(key);
            }
            input.delReply(ctx.detectID);

            await money.set(input.senderID, {
              inventory: Array.from(inventory),
              collectibles: Array.from(collectibles),
            });
            chosenNumbers.push(number);

            const infoDone = await output.replyStyled(
              `${item.icon} You opened ${item.name}!

${treasures.map((i) => i.icon).join(" | ")}
${
  collectibles.hasAmount("gems", diaCost)
    ? `\n[font=typewriter]Retry for 💎 ${diaCost}[:font=typewriter]\n[font=typewriter](retry <number>)[:font=typewriter]`
    : ""
}

**Reward Details:**
Name: **${treasureItem.icon}** **${treasureItem.name}**
Info: ${treasureItem.flavorText}

Type **inv check ${treasureItem.key}** for more details!

💎 **${pCy(collectibles.getAmount("gems"))}** ${
                paidMode ? `(-${diaCost})` : ""
              }`,
              style
            );
            treasures[number - 1] = {
              icon: "✅",
              isNothing: true,
            };
            input.setReply(infoDone.messageID, {
              key: "inventory",
              callback: handleTriple,
              paidMode: true,

              treasures,
            });
          }

          let treasures = [];
          for (let i = 0; i < tresCount; i++) {
            let newTreasure;
            do {
              newTreasure = generateTreasure(item.treasureKey);
            } while (
              /* treasures.some(
              (t) => t.key === newTreasure.key || t.icon === newTreasure.icon
            )*/
              false
            );
            treasures.push(newTreasure);
          }
          treasures = treasures.sort(() => Math.random() - 0.5);
          const info = await output.reply(
            `✦ Choose a treasure to open:\n\n${Array(tresCount)
              .fill(item.icon)
              .join(
                " | "
              )}\n\nReply with a **number** from **1** to **${tresCount}**.`
          );
          input.setReply(info.messageID, {
            key: "inventory",
            callback: handleTriple,
            treasures,
          });
        },
      },
      {
        key: "transfer",
        description: "Sends an item to another user or entity.",
        aliases: ["give", "send", "-t"],
        args: ["<item_id | index>*<num|'all'>", "<uid>"],
        async handler() {
          let [keyTX = "", recipientID] = actionArgs;
          let [keyT, amountItem = "1"] = keyTX.split("*");

          if (recipientID === input.senderID) {
            return output.reply(
              `❌ You cannot send items to yourself, I already tried.`
            );
          }
          if (!inventory.has(keyT)) {
            return output.reply(
              `❌ You don't have any "${keyT}" in your inventory.`
            );
          }
          if (amountItem === "all") {
            amountItem = inventory.getAmount(keyT);
          }
          amountItem = parseInt(amountItem);
          if (isNaN(amountItem)) {
            amountItem = 1;
          }
          if (!inventory.hasAmount(keyT, amountItem) || amountItem < 1) {
            return output.reply(
              `❌ Please enter a valid amount of "${keyT}", you currently have ${inventory.getAmount(
                keyT
              )} of it.`
            );
          }
          const allUsers = await money.getAll();
          const recipientData = allUsers[recipientID];
          if (!recipientData) {
            return output.reply(`❌ User with ID "${recipientID}" not found.`);
          }
          if (!recipientData.name) {
            return output.reply(`❌ The recipient has no name.`);
          }
          const rInventory = new Inventory(recipientData.inventory);
          if (rInventory.getAll().length >= invLimit) {
            return output.reply(`❌ The recipient's inventory is full.`);
          }
          if (rInventory.getAll().length + amountItem > invLimit) {
            return output.reply(
              `❌ The recipient's inventory currently have ${
                rInventory.getAll().length
              }/${invLimit} items and you're trying to send ${amountItem} items.`
            );
          }
          let sentItems = [];
          let failItems = [];
          let moneyAdd = 0;
          for (let i = 0; i < amountItem; i++) {
            const itemToSend = inventory.getOne(keyT);
            if (itemToSend?.cannotSend) {
              failItems.push({ ...itemToSend, error: `Item cannot be sent.` });
              continue;
            }
            if (itemToSend.type === "cheque") {
              const amount = itemToSend.chequeAmount;
              if (isNaN(amount) || amount < 1) {
                failItems.push({
                  ...itemToSend,
                  error: `Item cannot be parsed as a valid cheque.`,
                });
                continue;
              }
              moneyAdd += amount;
            } else {
              rInventory.addOne(itemToSend);
              sentItems.push(itemToSend);
            }

            inventory.deleteRef(itemToSend);
          }

          await money.set(input.senderID, {
            inventory: Array.from(inventory),
          });
          await money.set(recipientID, {
            inventory: Array.from(rInventory),
            money: recipientData.money + moneyAdd,
          });

          await output.reply(
            `${
              moneyAdd > 0
                ? `💰 A cheque amount of $**${moneyAdd}**💵 has been successfully transferred to **${
                    recipientData.name ?? "Unregistered"
                  }**. \n\n`
                : ""
            }${
              sentItems.length !== 0
                ? `✅ Sent ${sentItems.length} items to **${
                    recipientData.name ?? "Unregistered"
                  }**`
                : `❌ No items were sent to **${
                    recipientData.name ?? "Unregistered"
                  }**`
            }\n\n${[...sentItems, ...failItems]
              .map(
                (i) =>
                  `${i.icon} ${i.name}${i.error ? `\n❌ ${i.error}\n` : ""}`
              )
              .join("\n")}`
          );
        },
      },
      {
        key: "toss",
        description: "Discards an item from the user's inventory.",
        aliases: ["discard", "drop", "throw"],
        args: ["<item_id | index>*<num|'all'>"],
        async handler() {
          let [key, amount] = (actionArgs[0] ?? "").split("*");
          if (!amount && actionArgs[1]) {
            amount = actionArgs[1];
          }

          if (!key) {
            return output.reply(
              "❌ Please specify an item key. Example: `cat*3` to select 3 items with the key `cat`."
            );
          }

          let items = inventory.get(key);

          if (!items || items.length === 0) {
            return output.reply(`❌ No items found for the key: **${key}**.`);
          }

          if (amount === "all") {
            amount = items.length;
          } else {
            amount = parseInt(amount, 10);
            if (isNaN(amount) || amount <= 0) {
              return output.reply(
                `❌ Invalid amount specified: **${actionArgs[0]}**. Please use a valid number or "all".`
              );
            }
          }

          items = items.slice(0, amount);

          if (items.length < amount) {
            output.reply(
              `⚠️ Requested ${amount} items, but only ${items.length} are available for the key: **${key}**.`
            );
          }

          const deletable = items.filter((i) => i.cannotToss !== true);
          const cannot = items.filter((i) => i.cannotToss === true);

          inventory.deleteRefs(deletable);

          await money.set(input.senderID, {
            inventory: Array.from(inventory),
          });

          let successMsg = `Tossed ${deletable.length} item${
            deletable.length !== 1 ? "s" : ""
          }:\n`;
          deletable.forEach((i) => {
            successMsg += `${i.icon} **${i.name}**\n`;
          });

          let failMsg = `Failed tossing ${cannot.length} item${
            cannot.length !== 1 ? "s" : ""
          }:\n`;
          cannot.forEach((i) => {
            failMsg += `${i.icon} **${i.name}**\n`;
          });

          if (deletable.length > 0 && cannot.length > 0) {
            output.reply(`${successMsg}\n${failMsg}`);
          } else if (deletable.length > 0) {
            output.reply(successMsg);
          } else if (cannot.length > 0) {
            output.reply(failMsg);
          }
        },
      },
    ]
  );
  return home.runInContext(ctx);
}
