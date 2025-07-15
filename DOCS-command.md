# CassidyBoT DOCS

## How to make command?
- It's simple!
- You can check other docs like output and input docs for more info!

### Supported:
* CommonJS
* ESM Syntax (named)
* ESM Syntax (default, don't add named when there's already default export)
* Typescript Modules

### Properties of a Module:
1. **meta**
* Contains important configuration informations.
```js
export const meta = {
  name: "example",
  otherNames: ["ex", "examples"],
  author: "Author's Name",
  version: '1.0.0',
  description: "This is an example command used in demonstration.",
  usage: "{prefix}{name}",
  category: "Examples",
  noPrefix: "both",
  permissions: [0, 1, 2],
  botAdmin: false,
  waitingTime: 10,
  ext_plugins: {
    output: "^1.0.0"
  },
  whiteList: [
    "id1",
    "id2"
  ],
  args: [
    {
      degree: 0,
      fallback: null,
      response: "You cannot use this argument",
      search: "disallowedArg",
      required: false,
    }
  ],
  supported: "^1.0.0"
}
```
2. **entry**
* Executes when the command is called by a user.
* input.arguments/args doesn't include command name.
* A command won't load without it.
* Here is an example of an entry function that greets a user with their username.
```js
export async function entry({ input, output, userInfos }) {
  // get the info.
  const { firstName } = await userInfos.get(input.senderID);
  // send a response.
  await output.reply(`Hello ${firstName}!`);
}
```
```js
// using api, event
module.exports.entry = async function ({ api, event }) {
  // get the info.
  const { [event.senderID]: { firstName } } = await api.getUserInfo(event.senderID);
  // send a response.
  api.sendMessage(`Hello ${firstName}!`, event.threadID, event.messageID);
}
```
3. **reply**
* Executes when a user replies to a command where it is configured to be a reply detector.
* output.waitForReply is an easier and more synchronous alternative.
```js
// inside entry function:
const info = await output.reply(`Please reply me a word.`);
// set the reply:
input.setReply(info.messageID, {
  key: commandName, // include this in param of entry.
  author: input.senderID
});
```
```js
// reply function.
export async function reply({ detectID, repObj, input, output, userInfos }) {
  // check if the replier is the author:
  if (input.senderID !== repObj.author) {
    return;
    // ignore
  }
  const { firstName } = await userInfos.get(input.senderID);
  // make a censored text.
  const text = input.censor(`Thanks ${firstName}! The word you have entered was "${input.arguments[0]}"`);
  // send the response.
  await output.reply(text);
  // delete reply detection.
  input.delReply(detectID);
}
```