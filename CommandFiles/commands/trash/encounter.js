// @ts-check
import { UNIRedux } from "@cassidy/unispectra";
import fs from "fs-extra";

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "encounterv1",
  description: "Pets Encounter",
  otherNames: ["encv1", "enc", "encounter"],
  version: "1.0.2",
  usage: "{prefix}{name}",
  category: "Spinoff Games",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 1,
  // botAdmin: true,
  requirement: "3.0.0",
  icon: "🔱",
  cmdType: "cplx_g",
};

// Lahat ng encounter data nalipat na sa /CommandFiles/resources/spinoff/encounters.json
const encounters = fs.readJSONSync(
  process.cwd() + "/CommandFiles/resources/spinoff/encounters.json"
);

function generateEnc() {
  return Object.values(encounters)[
    Math.floor(Math.random() * Object.values(encounters).length)
  ];
}

let currentEnc = generateEnc();

const petSchema = {
  fight: false,
  //item: true,
  item: false,
  magic: false,
  mercy: true,
  defend: true,
  extra: {
    Bash: "🥊",
    Act: "🔈",
    LifeUp: "✨",
    HexSmash: "💥",
  },
};
const leaderSchema = {
  fight: false,
  //item: true,
  mercy: true,
  magic: false,
  item: false,
  defend: true,
  extra: {
    Bash: "🥊",
    Act: "🔊",
    LifeUp: "✨",
    HexSmash: "💥",
  },
};

/**
 *
 * @param {CommandContext} ctx
 */
export async function entry({
  input,
  output,
  PetPlayer,
  GearsManage,
  Inventory,
  WildPlayer,
}) {
  function getInfos(data) {
    const gearsManage = new GearsManage(data.gearsData);
    const petsData = new Inventory(data.petsData);
    const playersMap = new Map();
    for (const pet of petsData) {
      const gear = gearsManage.getGearData(pet.key);
      const player = new PetPlayer(pet, gear);
      playersMap.set(pet.key, player);
    }
    return {
      gearsManage,
      petsData,
      playersMap,
    };
  }
  const encounter = currentEnc;

  const i = await output.reply(`🔎 **Random Encounter**:
Your opponent is ${encounter.wildIcon} ${encounter.wildName}

Please **reply** with the names of maximum of **3 pets**, separated by |, you cannot use same type of pet twice.
**Example:** doggie | meowy | cobra

The first **pet** will become the leader, which who can use the 🔊 **Act**`);
  function handleEnd(id, { ...extra } = {}) {
    input.setReply(id, {
      key: "encounter",
      // @ts-ignore
      callback: handleGame,
      ...extra,
    });
  }
  handleEnd(i.messageID, {
    author: input.senderID,
    type: "start",
  });
  let isDefeat = false;

  /**
   *
   * @param {CommandContext & { repObj: any }} ctx
   * @returns
   */
  async function handleGame(ctx) {
    if (isDefeat) {
      return;
    }
    const { input, output, repObj, money, detectID } = ctx;
    /*output.prepend = `⚠️ **Warn:** This is for testing only, this game might behave weird!\n\n`;*/
    output.prepend = `***Pet Encounter 🔱***\n${UNIRedux.standardLine}\n`;
    function handleEnd(id, { ...extra } = {}) {
      input.delReply(String(detectID));
      input.setReply(id, {
        key: "encounter",
        // @ts-ignore
        callback: handleGame,
        ...extra,
      });
    }

    /* const turnsCut = input.splitBody("|");
    if (turnsCut.length > 1) {
      output.reply = async () => i;
      for (const turn of turnsCut) {
        input.body = turn;
        input.words = [turn];
        input.arguments = [turn];
        input.splitBody = () => [turn];
        await handleGame({ ...ctx });
      }
      return;
    }*/
    const userData = await money.getCache(input.senderID);
    const { petsData, playersMap } = getInfos(userData);
    let turnOption = String(input.words[0]).toLowerCase();
    const { type, author } = repObj;
    if (author !== input.senderID) {
      return output.reply(
        `❌|  You are **not** the one who started this **game**.`
      );
    }
    let pets = [];
    if (type === "start") {
      if (petsData.getAll().length < 3) {
        return output.reply(
          `❌ | Oops, you need at least 3 pets to start the game. Try **uncaging** ${
            3 - petsData.getAll().length
          } more pet(s).`
        );
      }
      const petsName = input.splitBody("|");
      if (petsName.length < 3) {
        return output.reply(
          `❌ | Please go back and specify **exactly 3** pet **names** split by |`
        );
      }
      if (petsName.length > 3) {
        return output.reply(`❌ | Too much pets!`);
      }
      for (const petName of petsName) {
        const original = petsData
          .getAll()
          .find(
            (i) =>
              String(i?.name).toLowerCase().trim() ===
              String(petName).toLowerCase().trim()
          );
        if (!original) {
          return output.reply(
            `❌ | Pet "${petName}" doesn't exists in your pet list.`
          );
        }
        const pet = playersMap.get(original.key);
        pets.push(pet);
      }
      repObj.pets = pets;
    } else if (Array.isArray(repObj.pets)) {
      pets = repObj.pets;
    } else {
      return output.error(
        new Error("Pets data are missing while the state is not 'start'")
      );
    }
    const opponent =
      repObj.opponent ??
      new WildPlayer(
        {
          ...encounter,
          HP:
            encounter.HP +
            Math.round(pets.reduce((acc, pet) => acc + pet.ATK * 2.1, 0)),
          ATK:
            encounter.ATK +
            Math.round(pets.reduce((acc, pet) => acc + pet.DF / 10, 0)),
          goldFled:
            encounter.goldFled +
            Math.round(pets.reduce((acc, pet) => acc + pet.ATK * 20, 0)),
          goldSpared:
            encounter.goldSpared +
            Math.floor(pets.reduce((acc, pet) => acc + pet.ATK * 50, 0)),
        },
        [...pets]
      );
    repObj.index ??= 0;
    if (pets[repObj.index]?.isDown()) {
      repObj.index++;
    }
    if (pets[repObj.index]?.isDown()) {
      repObj.index++;
    }
    if (pets[repObj.index]?.isDown()) {
      repObj.index++;
    }

    let isEnemyTurn = repObj.index > 2;
    if (isEnemyTurn) {
    }
    repObj.turnCache ??= [];
    repObj.prevTurns ??= [];

    repObj.opponent = opponent;
    repObj.flavorCache ??=
      type === "start"
        ? opponent.flavor.encounter
        : opponent.getNeutralFlavor();
    function getCacheIcon(turn) {
      if (!turn) {
        return null;
      }
      const mapping = {
        fight: "⚔️",
        act: "🔊",
        mercy: "❌",
        defend: "🛡",
        heal: "✨",
      };
      return mapping[turn] ?? null;
    }
    function listPetsNormal({} = {}) {
      let result = `* ${repObj.flavorCache}\n\n`;
      for (let i = 0; i < pets.length; i++) {
        const pet = pets[i];
        const schema = i === 0 ? leaderSchema : petSchema;
        result += `${pet.getPlayerUI({
          selectionOptions: schema,
          turn: repObj.index === i,
          icon: getCacheIcon(repObj.turnCache[i]),
        })}\n\n`;
      }
      result += `***Reply with the option. (word only)***, you can also use **all** as second argument, you can also use | to split the options.`;
      return result;
    }
    async function handleWin(isGood, flavor) {
      currentEnc = generateEnc();
      input.delReply(String(detectID));
      let dialogue;
      let multiplier = 1;
      const alivePets = pets.filter((i) => !i.isDown());
      multiplier = alivePets.length / 3;
      let mercyMode = opponent.HP >= opponent.maxHP && isGood;
      let pts = Math.round((opponent.goldFled / 15) * multiplier);
      if (mercyMode) {
        pts = Math.round(pts * 1.7);
      }
      if (isGood) {
        dialogue = `${opponent.wildIcon} **${opponent.wildName}** has been${
          mercyMode ? " kindly" : ""
        } spared by your party.`;
      } else {
        dialogue =
          opponent.flavor.run?.[0] ??
          `${opponent.wildIcon} **${opponent.wildName}** ran away.`;
      }

      let newMoney =
        Number(Math.round(opponent.goldFled ?? 0) * multiplier) +
        (userData.money ?? 0);
      const collectibles = new ctx.Collectibles(userData.collectibles ?? []);
      if (collectibles.has("gems")) {
        collectibles.raise("gems", opponent.winDias ?? 0);
      }
      await money.set(input.senderID, {
        money: newMoney,
        collectibles: Array.from(collectibles),
        battlePoints: (userData.battlePoints ?? 0) + pts,
      });
      await output.reply(
        (flavor ?? "").trim() +
          `\n\n` +
          `* ${dialogue}\n\n${
            isGood ? opponent.spareText() : opponent.fledText()
          }\nObtained **${pts} 💷 Battle Points!**\n${
            opponent.winDias && collectibles.has("gems")
              ? `You also won **${opponent.winDias}** 💎!`
              : ""
          }`
      );
    }
    async function enemyAttack({ flavorText, damage = null, newResponse }) {
      if (opponent.isDown()) {
        return handleWin(false, flavorText);
      }
      let i = {};
      const { text, answer, attackName } = opponent.getAttackMenu();
      if (
        (opponent.HP < opponent.maxHP * 0.5 && Math.random() < 0.3) ||
        Math.random() < 0.1
      ) {
        let healing = Math.min(
          pets.reduce((_, pet) => pet.calculateAttack(opponent.DF - 2), 0),
          opponent.maxHP - opponent.HP
        );
        healing = Math.round(healing * 2.5);
        opponent.HP += Math.min(opponent.maxHP, healing);
        repObj.attack = {
          text: ``,
          healing,
          turnType: "heal",
        };
        i = await output.reply(
          `${flavorText}\n* ${opponent.wildIcon} **${
            opponent.wildName
          }** cast ✨ **Lifeup** α! Recovered **${healing}** HP!\n\n${opponent.getPlayerUI(
            { upperPop: `+${healing}HP` }
          )}\n\n***Reply anything to proceed.***`
        );
      } else {
        repObj.attack = {
          text,
          answer,
          attackName,
          turnType: "attack",
        };
        i = await output.reply(
          `${flavorText}\n${opponent.getPlayerUI({
            upperPop: damage
              ? `-${Math.round((damage / opponent.maxHP) * 100)}% HP`
              : null,
          })}\n\n${opponent.wildIcon} **${opponent.wildName}**: \n${
            newResponse ?? opponent.getNeutralDialogue()
          }\n\n${text}\n\n***Reply with the option. (word only)***`
        );
      }
      repObj.index = 0;
      repObj.flavorCache = opponent.getNeutralFlavor();
      handleEnd(i.messageID, {
        ...repObj,
        type: "playerTurn",
        index: 0,
        turnCache: [],
        opponent,
      });
    }
    if (type !== "start" && !repObj.attack) {
      if (input.words[1] === "all") {
        repObj.turnCache = [
          pets[0].isDown() ? null : turnOption,
          pets[1].isDown() ? null : turnOption,
          pets[2].isDown() ? null : turnOption,
        ];
        repObj.index = 3;
        isEnemyTurn = true;
      } else {
        /*if (turnOption === "act" && isLeader) {
          
        }*/
        const [a, b, c] = input.splitBody("|");
        if (a && b) {
          repObj.turnCache = [a, b, c]
            .filter(Boolean)
            .map((i) => i.toLowerCase());
          repObj.index = repObj.turnCache.length;
          if (repObj.index === 3) {
            isEnemyTurn = true;
          }
        } else {
          repObj.turnCache.push(turnOption);
        }
      }
    }
    function handleDefeat() {
      isDefeat = true;
      currentEnc = generateEnc();
      input.delReply(String(detectID));
      return output.reply(
        `❌ **Game Over**\n\n* All your pet members have been fainted. But that's not the end! Stay determined. You can always **try** again.`
      );
    }
    if (pets.every((i) => i.isDown())) {
      return handleDefeat();
    }

    if (!isEnemyTurn) {
      let extraText = "";
      const { turnType } = repObj.attack ?? {};
      if (turnType === "attack") {
        for (const pet of pets) {
          if (pet.isDown()) {
            const heal = pet.getDownHeal();
            pet.HP += heal;
            extraText += `* ${pet.petIcon} **${pet.petName}** has regenerated ${heal} HP.\n\n`;
          }
        }

        const { answer, attackName } = repObj.attack;
        let isHurt = false;
        if (turnOption !== answer) {
          isHurt = true;
        }
        if (isHurt) {
          extraText += `* You chose **${turnOption}**, but it was not effective against **${attackName}**\n\n`;
          const isAllParty = Math.random() < 0.4;
          if (isAllParty) {
            const members = pets.filter((i) => !i.isDown());
            if (members.length === 0) {
              return handleDefeat();
            }
            for (const randomMember of members) {
              const damage = Math.round(
                randomMember.calculateTakenDamage(opponent.ATK) / members.length
              );

              randomMember.HP -= Math.max(damage, 1);
              if (randomMember.HP < 1) {
                randomMember.HP = Math.round(randomMember.maxHP * 0.5) * -1;
              }
              extraText += `* ${randomMember.petIcon} **${
                randomMember.petName
              }** ${
                randomMember.isDown()
                  ? `is down.`
                  : `has taken **${damage}** damage.`
              }\n`;
            }
            if (pets[0].isDown() && pets[1].isDown() && pets[2].isDown()) {
              return handleDefeat();
            }
          } else {
            idk: {
              const availablePets = pets.filter((i) => !i.isDown());
              const lowestPet = availablePets.toSorted(
                (a, b) => a.HP - b.HP
              )[0];
              let randomMember =
                availablePets[Math.floor(Math.random() * availablePets.length)];
              if (lowestPet === randomMember) {
                randomMember =
                  availablePets[
                    Math.floor(Math.random() * availablePets.length)
                  ];
              }
              if (!randomMember) {
                //return handleDefeat();
                break idk;
              }

              const damage = randomMember.calculateTakenDamage(opponent.ATK);
              randomMember.HP -= Math.max(damage, 1);
              if (randomMember.HP < 1) {
                randomMember.HP = Math.round(randomMember.maxHP * 0.5) * -1;
              }
              const members = pets.filter((i) => !i.isDown());
              if (
                members.length === 0 ||
                (pets[0].isDown() && pets[1].isDown() && pets[2].isDown())
              ) {
                return handleDefeat();
              }

              extraText += `* ${randomMember.petIcon} **${
                randomMember.petName
              }** ${
                randomMember.isDown()
                  ? `is down.`
                  : `has taken **${damage}** damage.`
              }\n`;
            }
          }
          extraText += `\n`;
        } else {
          extraText += `* You chose **${turnOption}** and the entire party has successfully dodged the **${attackName}**!\n\n`;
        }
      }
      /*for (const pet of pets) {
        if (pet.isDown()) {
          const heal = pet.getDownHeal();
          pet.HP += heal;
          extraText += `* ${pet.petIcon} **${pet.petName}** has regenerated ${heal} HP.\n\n`;
        }
      }*/
      if (pets[repObj.index]?.isDown()) {
        repObj.index++;
      }
      if (pets[repObj.index]?.isDown()) {
        repObj.index++;
      }

      repObj.attack = null;

      const i = await output.reply(
        extraText +
          listPetsNormal({
            encounter: type === "start",
          })
      );

      handleEnd(i.messageID, {
        ...repObj,
        type: "turnPlayer",
        index: repObj.index + 1,
      });
    } else {
      const turns = repObj.turnCache.map((i) => String(i).toLowerCase());
      repObj.prevTurns ??= [];
      const prev = repObj.prevTurns;
      let flavorText = ``;
      let damage = 0;
      let newResponse = null;
      let dodgeChance = Math.random();
      for (let i = 0; i < turns.length; i++) {
        const pet = pets[i];
        const turn = turns[i];
        if (!turn) {
          flavorText += `* ${pet.petIcon} **${pet.petName}** has no turn specified.\n`;
          continue;
        }
        if (pet.isDown()) {
          flavorText += `* ${pet.petIcon} **${pet.petName}** is currently down.\n`;
          continue;
        }
        switch (turn) {
          case "cheat": {
            if (input.isAdmin) {
              const allAtk = pets.reduce(
                (acc, pet) => acc + pet.calculateAttack(opponent.DF),
                0
              );
              damage += opponent.maxHP - allAtk;
            }
            break;
          }
          case "hexsmash":
            {
              flavorText += `* ${pet.petIcon} **${pet.petName}** used 💥 **HexMash**!\n`;
              if (
                (prev[i] === "hexsmash" && dodgeChance < 0.7) ||
                Math.random() < 0.1
              ) {
                flavorText += `* ${opponent.wildIcon} **${opponent.wildName}** successfully dodges!\n`;
              } else {
                const meanStat = (pet.ATK + pet.MAGIC) / 2;
                const init = pet.calculateAttack(opponent.DF, meanStat);
                const damageEach = Math.round(init * 1.5);
                opponent.HP -= damageEach;
                flavorText += `* Inflicted **${damageEach}** magical damage.\n${opponent.getPlayerUI()}\n`;
                damage += damageEach;
                opponent.HP += damageEach;
              }
              flavorText += `\n`;
            }
            break;
          case "bash":
            {
              flavorText += `* ${pet.petIcon} **${pet.petName}** attacks!\n`;
              if (
                (prev[i] === "bash" && dodgeChance < 0.7) ||
                Math.random() < 0.1
              ) {
                flavorText += `* ${opponent.wildIcon} **${opponent.wildName}** successfully dodges!\n`;
              } else {
                const damageEach = pet.calculateAttack(opponent.DF);
                opponent.HP -= damageEach;
                flavorText += `* Inflicted **${damageEach}** damage.\n${opponent.getPlayerUI()}\n`;
                damage += damageEach;
                opponent.HP += damageEach;
              }
              flavorText += `\n`;
            }
            break;
          case "defend":
            {
              flavorText += `* ${pet.petIcon} **${pet.petName}** defended.\n`;
            }
            break;
          case "mercy":
            {
              if (opponent.isSparable()) {
                flavorText += `* ${pet.petIcon} **${pet.petName}** spared ${opponent.wildIcon} **${opponent.wildName}**!`;
                return handleWin(true, flavorText);
              }
              const calc =
                (pet.calculateAttack(opponent.DF) / opponent.maxHP) * 100 * 0.2;
              opponent.addMercyInternal(calc * 25);
              flavorText += `* ${pet.petIcon} **${pet.petName}** spared ${
                opponent.wildIcon
              } **${
                opponent.wildName
              }**, but the name isn't **YELLOW**! gained ${Math.round(
                calc
              )}% Mercy Points.\n`;
            }

            break;
          case "debug":
            {
              flavorText += `${JSON.stringify(opponent, null, 2)}\n`;
            }
            break;
          case "act": {
            if (i !== 0) {
              const calc =
                (pet.calculateAttack(opponent.DF) / opponent.maxHP) * 100 * 0.4;
              opponent.addMercyInternal(calc * 25);
              flavorText += `* ${pet.petIcon} **${
                pet.petName
              }** used 🔊 **Pet Action**\n* Gained ${Math.floor(
                calc
              )}% Mercy Points.\n`;
            } else {
              const calc =
                (pet.calculateAttack(opponent.DF) / opponent.maxHP) * 100 * 0.6;
              opponent.addMercyInternal(calc * 25);
              const randomActs = Object.keys(opponent.acts).filter((i) =>
                opponent.isActAvailable(i)
              );
              const randomAct =
                randomActs[Math.floor(Math.random() * randomActs.length)];
              const actData = opponent.getAct(randomAct);
              let {
                flavor = `${pet.petIcon} **${pet.petName}** can't think of what to do.`,
                response,
                mercyPts = 0,
                petLine = "...",
              } = actData ?? {};
              opponent.MERCY += mercyPts;
              flavorText += `* 🔊 **${randomAct}**\n* ${flavor}\n\n${
                pet.petIcon
              } **${pet.petName}**: ${petLine}\n\n* Gained ${
                mercyPts + Math.floor(calc)
              }% Mercy Points.\n`;
              newResponse = response;
            }
          }

          case "magic":
            {
            }
            break;
          case "lifeup":
            {
              const magic = pet.MAGIC;
              const lowests = pets.toSorted(
                (a, b) => a.HP / a.maxHP - b.HP / b.maxHP
              );
              const firstLowest = lowests[0];
              const target =
                Math.random() < 0.3 && pet.HP < pet.maxHP ? pet : firstLowest;
              const healing = Math.max(
                Math.round((target.maxHP / 9) * (magic * 0.09)),
                Math.round(target.maxHP / 9)
              );
              const prevDown = target.isDown();
              const finalHealing = Math.min(healing, target.maxHP - target.HP);
              target.HP += finalHealing;
              if (
                prevDown &&
                target.HP > 0 &&
                target.HP < target.maxHP * 0.17
              ) {
                target.HP = Math.round(target.maxHP * 0.17);
              }
              flavorText += `* ${pet.petIcon} **${
                pet.petName
              }** cast ✨ **Lifeup** to ${
                target === pet ? `itself!` : `**${target.petName}**!`
              } ${
                target.HP >= target.maxHP
                  ? `HP has been maxed out.`
                  : `Recovered **${finalHealing}** HP.`
              }\n${target.getPlayerUI({
                upperPop:
                  prevDown && !target.isDown()
                    ? `UP`
                    : target.HP >= target.maxHP
                    ? `MAX`
                    : `+${finalHealing} HP`,
              })}\n\n`;
            }
            break;
          default: {
            flavorText += `* ${pet.petIcon} **${pet.petName}** did not learn **${turn}**.\n`;
          }
        }
      }
      opponent.HP -= damage;
      repObj.prevTurns = [...turns];
      return enemyAttack({ flavorText, newResponse, damage });
    }
  }
}
