// @ts-check
const fs = require("fs");
const { Client, GatewayIntentBits, Message } = require("discord.js");
const axios = require("axios").default;

const settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));
const { discordBotToken, discordClientID } = settings;

if (!discordBotToken || !discordClientID) {
  process.exit(69);
}

function convertDiscordEvent(discordMessage) {
  let event = {};

  if (
    typeof discordMessage.isCommand === "function" &&
    discordMessage.isCommand()
  ) {
    const args = discordMessage.options.map((option) => String(option?.value));
    const body = ["/", discordMessage.commandName, ...args].join(" ");

    event = {
      type: "command",
      commandName: discordMessage.commandName,
      senderID: encodeDCID(discordMessage.user.id),
      timestamp: discordMessage.createdTimestamp,
      isDiscord: true,
      body: body,
      threadID:
        discordMessage.type === "GUILD_TEXT" && discordMessage.channel.parent
          ? encodeDCID(discordMessage.channel.parentId)
          : encodeDCID(discordMessage.channel.id),
      getDiscordInfo() {
        return discordMessage;
      },
    };
  } else if (
    typeof discordMessage.isInteraction === "function" &&
    discordMessage.isInteraction()
  ) {
    event = {
      type: "interaction",
      interactionID: discordMessage.id,
      senderID: encodeDCID(discordMessage.user.id),
      timestamp: discordMessage.createdTimestamp,
      isDiscord: true,
      body: "",
      threadID: encodeDCID(discordMessage.user.id),
      getDiscordInfo() {
        return discordMessage;
      },
    };
  } else {
    const {
      content,
      reactions,
      author,
      createdTimestamp,
      referencedMessage,
      attachments,
      channel,
    } = discordMessage;

    const reaction = reactions.cache.size > 0 ? reactions.cache.first() : null;
    const senderID = reaction
      ? `${encodeDCID(reaction.users.cache.first().id)}`
      : `${encodeDCID(author.id)}`;
    const userID = reaction
      ? `${encodeDCID(reaction.users.cache.first().id)}`
      : null;

    event = {
      type: reaction
        ? "message_reaction"
        : referencedMessage
        ? "message_reply"
        : "message",
      senderID: senderID,
      timestamp: createdTimestamp,
      body: reaction ? "" : content,
      userID: userID,
      messageID: reaction ? reaction.message.id : discordMessage.id,
      threadID: encodeDCID(channel.id),
      isPage: false,
      isDiscord: true,
      messageReply: referencedMessage
        ? {
            ...convertDiscordEvent(referencedMessage),
          }
        : null,
      attachments: attachments.map((attachment) => ({
        id: attachment.id,
        url: attachment.url,
        proxyURL: attachment.proxyURL,
        contentType: attachment.contentType,
      })),
      isWeb: false,
      fromWebhook: discordMessage.webhookId ? true : false,
      reaction: reaction ? reaction.emoji.name : "",
      getDiscordInfo() {
        return discordMessage;
      },
    };
  }

  return event;
}
function decodeDCID(id) {
  id = String(id);
  id = id.replace("discord:", "");
  return id;
}

function encodeDCID(id) {
  id = String(id);
  id = `discord:${id}`;
  return id;
}

const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let activeReplies = new Map();

client.once("ready", () => {
  log(`✅ Bot is online as ${client.user.tag}`);
  log(`💡 Client ID: ${discordClientID}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  log(`📩 Message received: "${message.content}" from ${message.author.tag}`);

  const isReply =
    message.reference && activeReplies.has(message.reference.messageId);

  try {
    const params = {
      ...convertDiscordEvent(message),
      // prefixes: [PREFIX],
      messageReply: null,
    };

    if (isReply) {
      params.messageReply = activeReplies.get(message.reference.messageId);
    }

    log(`🔄 Sending request to API with params: ${JSON.stringify(params)}`);

    const response = await axios.get("http://localhost:8000/postWReply", {
      params,
    });

    const { result, status } = response.data;
    log(`✅ API Response: ${JSON.stringify(response.data)}`);

    if (status === "fail") {
      log("❌ API request failed, no response sent.");
      return;
    }
    const replyMessages = splitMessage(result.body);

    /**
     * @type {Array<import("discord.js").OmitPartialGroupDMChannel<Message<boolean>>>}
     */
    const messages = [];
    for (const msg of replyMessages) {
      messages.push(await message.reply(msg));
      log(`💬 Sent message: "${msg}"`);
    }

    for (const msg of messages) {
      activeReplies.set(msg.id, result);
    }
  } catch (error) {
    log(`🚨 Error fetching API response: ${error.message}`);
  }
});

client
  .login(discordBotToken)
  .then(() => log("🔑 Logging in..."))
  .catch((err) => log(`🚨 Login Error: ${err.message}`));

const MAX_MESSAGE_LENGTH = 2000;

/**
 *
 * @param {string} message
 * @param {number} maxLength
 * @returns
 */
function splitMessage(message, maxLength = MAX_MESSAGE_LENGTH) {
  const parts = [];
  while (message.length > maxLength) {
    let chunk = message.slice(0, maxLength);

    let lastNewLine = chunk.lastIndexOf("\n");
    let lastSpace = chunk.lastIndexOf(" ");
    let splitIndex =
      lastNewLine > -1 ? lastNewLine : lastSpace > -1 ? lastSpace : maxLength;

    parts.push(message.slice(0, splitIndex));
    message = message.slice(splitIndex).trim();
  }
  parts.push(message);
  return parts;
}
