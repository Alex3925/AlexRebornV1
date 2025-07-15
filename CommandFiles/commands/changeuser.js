// @ts-check

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "changeuser",
  description: "Changes the user's display name.",
  author: "Liane | JenicaDev",
  version: "1.1.1",
  usage: "{prefix}changename <newName>",
  category: "User Management",
  permissions: [0],
  noPrefix: false,
  waitingTime: 5,
  otherNames: ["changename", "register"],
  linkTo: "identity-setname",
};

export async function entry() {}
