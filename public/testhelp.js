const fs = require("fs");
const path = require("path");
const cmd = module.exports;

cmd.config = {
  name: "help",
  version: "1.0.0",
  author: "Yan Maglinte | Liane Cagara",
  description: "show all commands.",
  category: "utility",
  admin: false,
  usePrefix: false,
  cooldowns: 5,
};

cmd.run = async function ({ event, args }) {
  // WTF?
  // const { id: senderID } = event.sender || "";

  // Destructure 'id' from event.sender, will default to "" (empty string)"
  const { id: senderID = "" } = event.sender ?? {};
  const commandsPath = path.join(__dirname, "../commands");

  // Normalize the page number.
  const page = Slicer.parseNum(args[0]);

  // Message string (expecting +=)
  let message = "Commands List: \n\n";

  // Scan the folder of commands to consume resources instead of making a global cache, good job. File names btw.
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  // Create a Slicer instance named 'slicer'
  const slicer = new Slicer(commandFiles, 5);

  // Get the page, then render it using forEach instead of map. LMAO
  slicer.getPage(page).forEach((file) => {
    try {
      const command = require(path.join(commandsPath, file));

      // Get the number from the original array of file names
      const number = commandFiles.indexOf(file) + 1;

      // Check if there is a configuration before doing anything at all
      if (command?.config) {
        message += `${number}.「 ${command.config.usePrefix ? PREFIX : ""}${
          command.config.name
        } 」\nDescription: ${
          command.config.description ?? "No Description"
        }\nAuthor: ${command.config.author ?? "No Author"}\n\n`;
      }
    } catch (error) {
      // Ignore errors because if the developer does not even bother making a global cache for commands instead of require() every time, why would it bother handle the errors?
      return;
    }
  });
  // Add the page number and total commands.
  message += `\nPage ${page}/${slicer.pagesLength}\n\nTotal Commands: ${commandFiles.length}`;

  // Send the message with extra buttons because why the hell not.
  api.graph({
    recipient: { id: senderID },
    message: {
      text: message,
      quick_replies: [
        {
          content_type: "text",
          title: "shoti",
          payload: "SHOTI",
        },
        {
          content_type: "text",
          title: "shotiv2",
          payload: "SHOTIV2",
        },
      ],
    },
  });
};

class Slicer {
  constructor(array = [], limit = 10) {
    this.array = Array.from(array);
    this.limit = limit;
  }
  getPage(page) {
    return Slicer.byPageArray(this.array, page, this.limit);
  }
  get pagesLength() {
    return Math.floor(this.array.length / (this.limit || 10));
  }
  static parseNum(page) {
    page = parseInt(page);
    if (isNaN(page)) {
      page = 1;
    }
    return page;
  }

  static byPage(page, limit) {
    page = parseInt(page);
    if (isNaN(page)) {
      page = 1;
    }
    limit = parseInt(limit);
    if (isNaN(limit)) {
      limit = 10;
    }
    const sliceA = (page - 1) * limit;
    const sliceB = page * limit;
    return [sliceA, sliceB];
  }
  static byPageArray(array, page, limit) {
    return array.slice(...this.byPage(page, limit));
  }
}
