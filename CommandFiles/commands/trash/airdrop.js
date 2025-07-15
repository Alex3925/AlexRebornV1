// @ts-check
import { CassExpress } from "@cass-plugins/cassexpress.js";
import { UNIRedux } from "../../modules/unisym.js";
import { Inventory, Collectibles } from "@cass-modules/InventoryEnhanced";
import { SpectralCMDHome } from "@cassidy/spectral-home";

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "airdrop",
  description:
    "Send airdrops of money, pet points, items, and collectibles to others!",
  author: "JenicaDev | Fixed by Liane",
  version: "1.0.3",
  usage: "{prefix}airdrop <send> <uid> [args]",
  category: "Economy",
  permissions: [0],
  noPrefix: false,
  waitingTime: 2,
  otherNames: ["drop"],
  requirement: "3.0.0",
  icon: "✈️",
  cmdType: "cplx_g",
};

/**
 * @type {CassidySpectra.CommandStyle}
 */
export const style = {
  title: "Airdrop ✈️",
  titleFont: "bold",
  contentFont: "fancy",
};

const { invLimit } = global.Cassidy;
const { parseCurrency } = global.utils;

/**
 * @param {CommandContext} ctx
 */
export async function entry({ ...ctx }) {
  const { input, output, money, args, prefix, commandName } = ctx;

  function getDatas({ ...data }) {
    const inventory = new Inventory(data.inventory || []);
    const collectibles = new Collectibles(data.collectibles || []);
    return { inventory, collectibles };
  }

  const home = new SpectralCMDHome({ isHypen: false, defaultKey: "help" }, [
    {
      key: "receive",
      description: "Claim an airdrop using a code (Dev Only).",
      aliases: ["claim", "-r"],
      args: ["<code>"],
      async handler() {
        if (!global.isDevMode) {
          return output.reply(
            `❌ The skies are quiet! Airdrop claims are for devs only right now.\n` +
              `Try sending one with "${prefix}airdrop send <uid>" instead!`
          );
        }
        const claimCode = (args[1] || "").toUpperCase();
        if (!claimCode) {
          return output.reply(
            `❌ [DEV] No code provided! Use "${prefix}airdrop receive <code>"!`
          );
        }
        return output.reply(
          `✦ [DEV] Received code "**${claimCode}**" - feature in progress!`
        );
      },
    },
    {
      key: "send",
      description:
        "Send an airdrop to another user with money, pet points, collectibles, or items.",
      aliases: ["drop", "-s"],
      args: ["<uid>"],
      async handler() {
        const recipientID = args[1] ?? input.detectID;
        if (!recipientID) {
          return output.reply(
            `❌ No target in sight! Use "${prefix}airdrop send <uid>" to drop some loot!`
          );
        }
        if (recipientID === input.senderID) {
          return output.reply(
            `❌ Can’t drop to yourself! Aim for someone else in the skies!`
          );
        }

        if (!(await money.exists(recipientID))) {
          return output.reply(
            `❌ No user with ID "**${recipientID}**"! Check the horizon!`
          );
        }
        let { [input.senderID]: userData, [recipientID]: recipientData } =
          await money.getItems(input.senderID, recipientID);
        const { collectibles } = getDatas(userData);

        const collectibleList =
          collectibles.getAll().length > 0
            ? collectibles
                .getAll()
                .map(
                  (c) =>
                    `${c.metadata.icon || "✦"} **${
                      c.metadata.name
                    }** (x${parseCurrency(c.amount)}) [${c.metadata.key}]`
                )
                .join("\n")
            : "None yet!";

        const prompt = await output.reply(
          `${UNIRedux.arrow} ***Pack Your Airdrop***\n\n` +
            `✈️ Dropping to **${
              recipientData.name || "Unregistered"
            }** (ID: ${recipientID})!\n` +
            `Reply with ONE of:\n` +
            `- "money <amount>" (e.g., "money 500")\n` +
            `- "petpoints <amount>" (e.g., "petpoints 50")\n` +
            `- "collectible <key> <amount>" (e.g., "collectible gems 5")\n` +
            `- "item <key> <amount>" (e.g., "item potion 2")\n` +
            `- "done" to finish!\n\n` +
            `${UNIRedux.arrow} ***Your Stash***\n` +
            `💵 **${parseCurrency(userData.money || 0)}** Money\n` +
            `💶 **${parseCurrency(userData.battlePoints || 0)}** Pet Points\n` +
            `${collectibleList}`
        );

        input.setReply(prompt.messageID, {
          key: commandName,
          callback: handleAirdropSend,
          dropData: { money: 0, petPoints: 0, collectibles: {}, items: [] },
          recipientID,
        });

        /**
         *
         * @param {CommandContext} ctx
         * @returns
         */
        async function handleAirdropSend(ctx) {
          if (ctx.input.senderID !== input.senderID) return;
          let userData = await ctx.money.getCache(ctx.input.senderID);
          const { inventory, collectibles } = getDatas(userData);
          // @ts-ignore
          const { dropData, recipientID } = ctx.repObj;
          const words = ctx.input.words;
          let rData = await money.getCache(recipientID);
          let rInventory = new Inventory(rData.inventory || []);
          let rCollectibles = new Collectibles(rData.collectibles || []);
          let rCassExpress = new CassExpress(rData.cassExpress || {});

          if (words[0].toLowerCase() === "done") {
            if (
              dropData.money === 0 &&
              dropData.petPoints === 0 &&
              Object.keys(dropData.collectibles).length === 0 &&
              dropData.items.length === 0
            ) {
              return ctx.output.reply(
                `❌ Nothing dropped yet! Send something first with "money", "petpoints", "collectible", or "item"!`
              );
            }

            // @ts-ignore
            ctx.input.delReply(ctx.detectID);
            return ctx.output.reply(
              `${UNIRedux.arrow} ***Airdrop Complete!***\n\n` +
                `✈️ All drops sent to **${
                  rData.name || "Unregistered"
                }** (ID: ${recipientID})!\n\n` +
                `${
                  dropData.money
                    ? `💵 **${parseCurrency(dropData.money)}** Money\n`
                    : ""
                }` +
                `${
                  dropData.petPoints
                    ? `💶 **${parseCurrency(dropData.petPoints)}** Pet Points\n`
                    : ""
                }` +
                `${
                  Object.keys(dropData.collectibles).length > 0
                    ? Object.entries(dropData.collectibles)
                        .map(
                          ([k, v]) =>
                            `${k === "gems" ? "💎" : "✦"} **${parseCurrency(
                              v
                            )}** ${k}`
                        )
                        .join("\n") + "\n"
                    : ""
                }` +
                `${
                  dropData.items.length > 0
                    ? dropData.items
                        .map((i) => `${i.icon} **${i.name}** (x${i.count})`)
                        .join("\n") + "\n"
                    : ""
                }` +
                `✦ Your stash: 💵 **${parseCurrency(
                  userData.money
                )}**, 💶 **${parseCurrency(
                  userData.battlePoints
                )}** Pet Points\n` +
                `They’ll get a mail with the full drop details!`
            );
          }

          let transactionMade = false;
          if (words[0].toLowerCase() === "money") {
            const amount = parseInt(words[1]);
            if (isNaN(amount) || amount <= 0) {
              return ctx.output.reply(
                `❌ Invalid amount! Use "money <number>"!`
              );
            }
            if (amount > (userData.money || 0)) {
              return ctx.output.reply(
                `❌ Only **${parseCurrency(
                  userData.money || 0
                )}** 💵 left! Can’t send **${parseCurrency(amount)}**!`
              );
            }
            userData.money -= amount;
            rData.money = (rData.money || 0) + amount;
            dropData.money += amount;
            transactionMade = true;
          } else if (words[0].toLowerCase() === "petpoints") {
            const amount = parseInt(words[1]);
            if (isNaN(amount) || amount <= 0) {
              return ctx.output.reply(
                `❌ Invalid amount! Use "petpoints <number>"!`
              );
            }
            if (amount > (userData.battlePoints || 0)) {
              return ctx.output.reply(
                `❌ Only **${parseCurrency(
                  userData.battlePoints || 0
                )}** 💶 Pet Points! Can’t send **${parseCurrency(amount)}**!`
              );
            }
            userData.battlePoints = (userData.battlePoints || 0) - amount;
            rData.battlePoints = (rData.battlePoints || 0) + amount;
            dropData.petPoints += amount;
            transactionMade = true;
          } else if (words[0].toLowerCase() === "collectible") {
            const key = words[1];
            const amount = parseInt(words[2]);
            if (!key || isNaN(amount) || amount <= 0) {
              return ctx.output.reply(
                `❌ Bad format! Use "collectible <key> <amount>"!`
              );
            }
            if ((collectibles.getAmount(key) || 0) < amount) {
              return ctx.output.reply(
                `❌ Only **${parseCurrency(
                  collectibles.getAmount(key) || 0
                )}** ${key}! Can’t send **${parseCurrency(amount)}**!`
              );
            }
            rCollectibles.register(key, collectibles.getMeta(key));

            collectibles.raise(key, -amount);
            rCollectibles.raise(key, amount);
            dropData.collectibles[key] =
              (dropData.collectibles[key] || 0) + amount;
            transactionMade = true;
          } else if (words[0].toLowerCase() === "item") {
            const key = words[1];
            const amount = parseInt(words[2]) || 1;
            if (!key || isNaN(amount) || amount <= 0) {
              return ctx.output.reply(
                `❌ Bad format! Use "item <key> <amount>"!`
              );
            }
            const items = inventory.get(key);
            if (!items || items.length < amount) {
              return ctx.output.reply(
                `❌ Only **${
                  items ? items.length : 0
                }** ${key}! Can’t send **${amount}**!`
              );
            }
            if (rInventory.getAll().length + amount > invLimit) {
              return ctx.output.reply(
                `❌ **${rData.name}**’s 🎒 is full (**${
                  rInventory.getAll().length
                }/${invLimit}**)!\n` +
                  `Can’t fit **${amount}** more items. They need to clear space with "${prefix}inv toss"!`
              );
            }
            const itemsToSend = items.slice(0, amount);
            itemsToSend.forEach((item) => {
              inventory.deleteRef(item);
              rInventory.addOne({ ...item });
            });
            const existingItem = dropData.items.find((i) => i.key === key);
            if (existingItem) {
              existingItem.count += amount;
            } else {
              dropData.items.push({ ...items[0], count: amount });
            }
            transactionMade = true;
          } else {
            return ctx.output.reply(
              `❌ Huh? Use "money", "petpoints", "collectible", "item", or "done"!`
            );
          }

          rCassExpress.createMail({
            title: `Airdrop Received from ${userData.name || "Unregistered"}`,
            author: input.senderID,
            body:
              `You’ve received an airdrop!\n\n` +
              `${
                dropData.money
                  ? `💵 **${parseCurrency(dropData.money)}** Money\n`
                  : ""
              }` +
              `${
                dropData.petPoints
                  ? `💶 **${parseCurrency(dropData.petPoints)}** Pet Points\n`
                  : ""
              }` +
              `${
                Object.keys(dropData.collectibles).length > 0
                  ? Object.entries(dropData.collectibles)
                      .map(
                        ([k, v]) =>
                          `${k === "gems" ? "💎" : "✦"} **${parseCurrency(
                            v
                          )}** ${k}`
                      )
                      .join("\n") + "\n"
                  : ""
              }` +
              `${
                dropData.items.length > 0
                  ? dropData.items
                      .map((i) => `${i.icon} **${i.name}** (x${i.count})`)
                      .join("\n")
                  : ""
              }`,
            timeStamp: Date.now(),
          });

          if (transactionMade) {
            await money.set(input.senderID, {
              money: userData.money,
              battlePoints: userData.battlePoints,
              inventory: Array.from(inventory),
              collectibles: Array.from(collectibles),
            });
            await money.set(recipientID, {
              money: rData.money,
              battlePoints: rData.battlePoints,
              inventory: Array.from(rInventory),
              collectibles: Array.from(rCollectibles),
              cassExpress: rCassExpress.raw(),
            });

            const collectibleList =
              collectibles.getAll().length > 0
                ? collectibles
                    .getAll()
                    .map(
                      (c) =>
                        `${c.metadata.icon || "✦"} **${
                          c.metadata.name
                        }** (x${parseCurrency(c.amount)}) [${c.metadata.key}]`
                    )
                    .join("\n")
                : "None yet!";

            const reprompt = await ctx.output.replyStyled(
              `${UNIRedux.arrow} ***Airdrop Updated!***\n\n` +
                `✈️ Dropped to **${
                  rData.name || "Unregistered"
                }** (ID: ${recipientID}):\n` +
                `${
                  dropData.money
                    ? `💵 **${parseCurrency(dropData.money)}** Money\n`
                    : ""
                }` +
                `${
                  dropData.petPoints
                    ? `💶 **${parseCurrency(dropData.petPoints)}** Pet Points\n`
                    : ""
                }` +
                `${
                  Object.keys(dropData.collectibles).length > 0
                    ? Object.entries(dropData.collectibles)
                        .map(
                          ([k, v]) =>
                            `${k === "gems" ? "💎" : "✦"} **${parseCurrency(
                              v
                            )}** ${k}`
                        )
                        .join("\n") + "\n"
                    : ""
                }` +
                `${
                  dropData.items.length > 0
                    ? dropData.items
                        .map((i) => `${i.icon} **${i.name}** (x${i.count})`)
                        .join("\n") + "\n"
                    : ""
                }` +
                `${UNIRedux.arrow} ***Your Stash***\n` +
                `💵 **${parseCurrency(userData.money || 0)}** Money\n` +
                `💶 **${parseCurrency(
                  userData.battlePoints || 0
                )}** Pet Points\n` +
                `${collectibleList}\n\n` +
                `✦ Reply with another drop ("money", "petpoints", "collectible", "item") or "done" to finish!`,
              style
            );

            ctx.input.setReply(reprompt.messageID, {
              key: commandName,
              callback: handleAirdropSend,
              dropData,
              recipientID,
            });
          }
        }
      },
    },
  ]);

  return home.runInContext(ctx);
}
