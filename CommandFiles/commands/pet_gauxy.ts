// @ts-check
import { InventoryItem } from "@cass-modules/cassidyUser";
import { CassEXP } from "@cass-modules/cassEXP";
import { parseBet } from "@cass-modules/ArielUtils";
import { FontSystem } from "cassidy-styler";
const { fonts } = FontSystem;

export type PetData = InventoryItem & {
  happiness: number;
  hunger: number;
  level: number;
  adoptionTime: number;
  sellPrice: number;
  petType: string;
  icon: string;
  name: string;
  key: string;
  lastFed: string | null;
  tricks: string[];
};

export const meta: CassidySpectra.CommandMeta = {
  name: "petg",
  description: "Adopt, care for, and grow your pet empire!",
  otherNames: ["p", "pet", "petgauxy", "pgauxy", "pa", "petariel"],
  version: "1.0.0",
  usage: "{prefix}{name} <command> [args]",
  category: "Xavia Economy",
  author: "original idea by Gauxy, recreated by Liane Cagara",
  permissions: [0],
  noPrefix: false,
  waitingTime: 1,
  requirement: "2.5.0",
  icon: "🐶",
};

const { invLimit } = global.Cassidy;

const PET_INFO_HEADER: string = "— **Your Pet Info** \n━━━━━━━━━━━━━\n\n";
const NO_PET_FOUND: (name: string) => string = (name: string) =>
  `${PET_INFO_HEADER}❌ No pet named "${name}"!`;

const PET_LIMIT_REACHED: string = `${PET_INFO_HEADER}❌ Pet limit reached! Max ${invLimit} pets. Sell one first.`;
const NAME_TAKEN: (name: string, type: string, icon: string) => string = (
  name: string,
  type: string,
  icon: string
) =>
  `${PET_INFO_HEADER}❌ "${name}" is already taken by ${type} ${icon}. Pick another name.`;
const INVALID_NAME: string = `${PET_INFO_HEADER}❌ Pet name must be alphanumeric with no spaces!`;
const INVALID_TYPE: string = `${PET_INFO_HEADER}❌ Pet type must be a single emoji!`;
const INSUFFICIENT_FUNDS: (needed: number, have: number) => string = (
  needed: number,
  have: number
) =>
  `${PET_INFO_HEADER}❌ Not enough money! Need $${needed}, you have $${have}.`;
const NO_PETS: string = `${PET_INFO_HEADER}❌ No pets registered yet!`;
const NO_PETS_SYSTEM: string = `${PET_INFO_HEADER}❌ No pets in the system!`;

export function calculateWorth(pet: PetData): number {
  const updatedPet: PetData = updatePetData(pet);
  const { sellPrice, happiness, hunger, adoptionTime, tricks } = updatedPet;

  const minutesOwned = (Date.now() - adoptionTime) / (1000 * 60);

  const timeBonus = Math.floor(minutesOwned / 60) * 0.6 * sellPrice;

  const trickValue = tricks.length * 300;

  const conditionFactor = 0.9 + ((happiness + (1 - hunger)) / 2) * 0.1;

  const rawValue = (sellPrice + timeBonus + trickValue) * conditionFactor;

  return Math.floor(rawValue);
}

export function updatePetData(petData: PetData): PetData {
  const cleanedPetData: Partial<PetData> = {};
  for (const key in petData) {
    if (petData[key] !== null) {
      cleanedPetData[key] = petData[key];
    }
  }

  const defaults: PetData = {
    happiness: 0.8,
    hunger: 0.5,
    level: 1,
    adoptionTime: Date.now(),
    sellPrice: 500,
    petType: cleanedPetData.petType || "unknown",
    icon: cleanedPetData.icon || "🐶",
    name: cleanedPetData.name || "Unnamed",
    key: cleanedPetData.key || `pet:unknown_${Date.now()}`,
    lastFed: null,
    tricks: [],
    type: "arielPet",
    flavorText: "",
  };

  const updatedPet: PetData = { ...defaults, ...cleanedPetData };
  if (updatedPet.lastFed) {
    const minutesSinceLastFed =
      (Date.now() - new Date(updatedPet.lastFed).getTime()) / (1000 * 60);

    const hungerDepletion = minutesSinceLastFed * (1 / 60);
    updatedPet.hunger = Math.min(updatedPet.hunger + hungerDepletion, 1);

    const happinessDepletionThreshold = 30;
    if (minutesSinceLastFed >= happinessDepletionThreshold) {
      const happinessDepletion = Math.min(
        (minutesSinceLastFed - happinessDepletionThreshold) * 0.0003,
        updatedPet.happiness
      );
      updatedPet.happiness = Math.max(
        updatedPet.happiness - happinessDepletion,
        0
      );
    }
  }

  updatedPet.level = Math.max(1, Math.floor(updatedPet.happiness * 10));
  return updatedPet;
}

function getBestOrFirstPet(pets: PetData[]): PetData | null {
  if (!pets.length) return null;
  return (
    pets.reduce((best: PetData | null, pet: PetData) => {
      const bestWorth: number = best ? calculateWorth(best) : -Infinity;
      return calculateWorth(pet) > bestWorth ? pet : best;
    }, null) || pets[0]
  );
}

function isCooldownActive(
  lastAction: string | null,
  cooldownMinutes: number = 5
): boolean {
  if (!lastAction) return false;
  const now: number = new Date().getTime();
  const last: number = new Date(lastAction).getTime();
  const diffMs: number = now - last;
  const diffMins: number = diffMs / (1000 * 60);
  return diffMins < cooldownMinutes;
}

export async function entry(ctx: CommandContext) {
  const { input, output, money, Inventory, prefix, args: args1 } = ctx;
  const {
    a_petsData: rawPetsData = [],
    money: playerMoney = 0,
    cassEXP: cxp,
  }: UserData = await money.getItem(input.senderID);
  const [, ...args] = args1;

  const handler: {
    [key: string]: {
      description: string;
      args?: string[];
      handler: () => Promise<any>;
    };
  } = {
    buy: {
      description: "Adopt a pet",
      args: ["<petType>", "<petName>", "<amount>"],
      async handler() {
        const [petType, petName, amountStr] = args;
        const amount: number = parseBet(amountStr, playerMoney) || 0;

        if (!petType || !petName || !amount || isNaN(amount)) {
          return output.reply(
            `⌜💁🏻‍♂️⌟ : \n— Please provide the type of animal, a valid name, and amount for your new pet.\nusage ${prefix}pet buy <petType> <petName> <amount>`
          );
        }

        if (!/^\p{Emoji}$/u.test(petType)) {
          return output.reply(INVALID_TYPE);
        }

        if (!/^[a-zA-Z0-9]+$/.test(petName)) {
          return output.reply(INVALID_NAME);
        }

        const petsData = new Inventory(rawPetsData);
        if (petsData.getAll().length >= invLimit) {
          return output.reply(PET_LIMIT_REACHED);
        }

        const trimmedName: string = petName.slice(0, 20);
        const existingPet: PetData | undefined = petsData
          .getAll()
          .find((pet) => pet.name === trimmedName) as PetData;
        if (existingPet) {
          return output.reply(
            NAME_TAKEN(trimmedName, existingPet.petType, existingPet.icon)
          );
        }

        if (playerMoney < amount) {
          return output.reply(INSUFFICIENT_FUNDS(amount, playerMoney));
        }

        const newPet: PetData = {
          key: `pet:${petType}_${Date.now()}`,
          name: trimmedName,
          petType,
          icon: petType,
          happiness: 0.8,
          hunger: 0.5,
          level: 1,
          adoptionTime: Date.now(),
          sellPrice: amount,
          lastFed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          tricks: [],
          type: "arielPet",
          flavorText: "",
        };

        petsData.addOne(newPet);
        await money.setItem(input.senderID, {
          a_petsData: Array.from(petsData),
          money: playerMoney - amount,
        });

        return output.reply(
          `⌜🎊⌟ : \n— Congratulations, you've adopted a new pet named ${trimmedName}!`
        );
      },
    },
    feed: {
      description: "Feed your pet",
      args: ["[petName]"],
      async handler() {
        const [petName] = args;
        const petsData = new Inventory(rawPetsData);
        const cassEXP = new CassEXP(cxp);
        let targetPetRaw: PetData | null = petName
          ? (petsData
              .getAll()
              .find(
                (pet) => pet.name.toLowerCase() === petName.toLowerCase()
              ) as PetData)
          : getBestOrFirstPet(petsData.getAll() as PetData[]);

        if (targetPetRaw?.hunger <= 0 && !petName) {
          targetPetRaw = petsData
            .getAll()
            .toSorted((a, b) => (b as PetData).hunger - (a as PetData).hunger)
            .at(0) as PetData | null;
        }

        if (!targetPetRaw) {
          return output.reply(petName ? NO_PET_FOUND(petName) : NO_PETS);
        }

        const targetPet: PetData = updatePetData(targetPetRaw);
        if (targetPet.hunger <= 0) {
          return output.reply(
            `${PET_INFO_HEADER}❌ **${targetPet.name}** is already full!`
          );
        }
        if (isCooldownActive(targetPet.lastFed)) {
          const timeLeft: number =
            5 -
            Math.floor(
              (new Date().getTime() - new Date(targetPet.lastFed).getTime()) /
                (1000 * 60)
            );
          return output.reply(
            `${PET_INFO_HEADER}❌ **${targetPet.name}** is still digesting. Wait ${timeLeft} min.`
          );
        }

        targetPet.hunger = Math.max(targetPet.hunger - 0.9, 0);
        targetPet.happiness = Math.min(targetPet.happiness + 0.2, 1);
        targetPet.sellPrice = targetPet.sellPrice + 100;
        targetPet.lastFed = new Date().toISOString();
        const expGain: number = 10;
        cassEXP.expControls.raise(expGain);

        const updatedPet: PetData = updatePetData(targetPet);
        petsData.deleteOne(updatedPet.key);
        petsData.addOne(updatedPet);
        await money.setItem(input.senderID, {
          a_petsData: Array.from(petsData),
          cassEXP: cassEXP.raw(),
        });

        if (input.isWeb) {
          return output.reply(
            `⌜🍖⌟ : \n— You fed ${updatedPet.name}. It looks happier now! 💕`
          );
        }

        return output.attach(
          `⌜🍖⌟ : \n— You fed ${updatedPet.name}. It looks happier now! 💕`,
          "http://localhost:8000/eat.gif"
        );
      },
    },
    check: {
      description: "Check your pet's value",
      args: ["[petName]"],
      async handler() {
        const [petName] = args;
        const petsData = new Inventory(rawPetsData);

        if (petName) {
          const pet: PetData | undefined = petsData
            .getAll()
            .find(
              (pet) => pet.name.toLowerCase() === petName.toLowerCase()
            ) as PetData;
          if (!pet) {
            return output.reply(NO_PET_FOUND(petName));
          }
          const updatedPet: PetData = updatePetData(pet);
          return output.reply(
            `${PET_INFO_HEADER}` +
              `${fonts.typewriter("Pet")}: ${updatedPet.icon}\n` +
              `${fonts.typewriter("Name")}: **${updatedPet.name}**\n` +
              `${fonts.typewriter("Worth")}: $${calculateWorth(
                updatedPet
              )}💰\n` +
              `🍖: ${((1 - updatedPet.hunger) * 100).toFixed(1)}% | 😊: ${(
                updatedPet.happiness * 100
              ).toFixed(1)}%\n` +
              `note: Don't forget to feed it.`
          );
        }

        const pets: PetData[] = petsData.getAll() as PetData[];
        if (!pets.length) {
          return output.reply(NO_PETS);
        }

        let result: string = `${PET_INFO_HEADER}`;
        for (const pet of pets) {
          const updatedPet: PetData = updatePetData(pet);
          result +=
            `${fonts.typewriter("Pet")}: ${updatedPet.icon}\n` +
            `${fonts.typewriter("Name")}: **${updatedPet.name}**\n` +
            `${fonts.typewriter("Worth")}: $${calculateWorth(updatedPet)}💰\n` +
            `🍖: ${((1 - updatedPet.hunger) * 100).toFixed(1)}% | 😊: ${(
              updatedPet.happiness * 100
            ).toFixed(1)}%\n` +
            `note: Don't forget to feed it.\n\n`;
        }
        result += `You can have as many pets as you want!`;
        return output.reply(result);
      },
    },
    sell: {
      description: "Sell your pet",
      args: ["[petName]"],
      async handler() {
        const [petName] = args;
        const petsData = new Inventory(rawPetsData);

        const petToSell: PetData | null = petName
          ? (petsData
              .getAll()
              .find(
                (pet) => pet.name.toLowerCase() === petName.toLowerCase()
              ) as PetData)
          : getBestOrFirstPet(petsData.getAll() as PetData[]);

        if (!petToSell) {
          return output.reply(petName ? NO_PET_FOUND(petName) : NO_PETS);
        }

        const updatedPet: PetData = updatePetData(petToSell);

        const price: number = calculateWorth(updatedPet);
        const newMoney: number = playerMoney + price;

        petsData.deleteOne(updatedPet.key);
        await money.setItem(input.senderID, {
          money: newMoney,
          a_petsData: Array.from(petsData),
        });

        return output.reply(
          `⌜💰⌟ : \n— You sold ${updatedPet.name} for $${price}. Goodbye, little friend!`
        );
      },
    },
    top: {
      description: "Check the top 10 richest pet owners",
      async handler() {
        const allPlayers: Record<string, UserData> = await money.getAll();
        if (!allPlayers || !Object.keys(allPlayers).length) {
          return output.reply(NO_PETS_SYSTEM);
        }

        let allPets: {
          owner: string;
          ownerID: string;
          pet: PetData;
          worth: number;
        }[] = [];
        for (const [playerID, playerData] of Object.entries(allPlayers)) {
          const {
            name: playerName = "Unregistered",
            a_petsData: rawPetsData = [],
          } = playerData;
          const petsData = new Inventory(rawPetsData);
          const bestPet: PetData | null = getBestOrFirstPet(
            petsData.getAll() as PetData[]
          );
          if (bestPet) {
            const updatedPet: PetData = updatePetData(bestPet);
            allPets.push({
              owner: playerName,
              ownerID: playerID,
              pet: updatedPet,
              worth: calculateWorth(updatedPet),
            });
          }
        }

        if (!allPets.length) {
          return output.reply(NO_PETS_SYSTEM);
        }

        allPets.sort((a, b) => b.worth - a.worth);
        const topPets = allPets.slice(0, Math.min(10, allPets.length));

        let leaderboard: string = `🐶 **TOP** 10 **RICHEST** **PET** **OWNERS** 🐶\n`;
        topPets.forEach((entry, index) => {
          const { owner, pet, worth } = entry;
          leaderboard +=
            `━━━━━━ ${index + 1} ━━━━━━\n` +
            `⭓ ${owner}\n` +
            `⭓ ${fonts.typewriter("Pet")}: **${pet.name}**\n` +
            `⭓ ${fonts.typewriter("Type")}: ${pet.icon}\n` +
            `⭓ ${fonts.typewriter("Worth")}: ${worth}💰\n`;
        });

        return output.reply(leaderboard);
      },
    },
  };

  const subcommand: string | undefined = args1[0]?.toLowerCase();
  const command = Object.entries(handler).find(
    ([k]) => String(subcommand).toLowerCase() === String(k).toLowerCase()
  )?.[1];

  if (!subcommand || !command) {
    const menu: string =
      `『 **PET MENU** 』\n` +
      `1. \`pet buy <petType> <petname> <amount>\` » adopt a pet.\n` +
      `2. \`pet feed\` » feed your pet.\n` +
      `3. \`pet check\` » check your pet's value.\n` +
      `4. \`pet sell\` » sell your pet and earn money.\n` +
      `5. \`pet top\` » check out the top 10 richest pet owners.`;
    if (input.isWeb) {
      return output.reply(menu);
    }
    return output.attach(menu, "http://localhost:8000/wonder.png");
  }

  return command.handler.call(ctx);
}
