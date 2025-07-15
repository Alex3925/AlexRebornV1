# CassidyBoT DOCS

## Output Plugin
- Author: **Liane Cagara**
- Similar to **api**

* Note: doesn't directly contain methods from api object.
* This simplifies the process of sending messages.
* All responses from output functions like output.reply will be formatted or restyled if the command the user is using has exported style properties.
```js
export const style = {
  title: `💗 Love Game`,
  titleFont: "bold",
  contentFont: "fancy"
}
```

## Basics
```js
export async function entry({ output, input, ...etc }) {
  //code here
}
```

### **output.reply(body, callback)**
* Returns a promise contaning the sent message info.
* It is used to send message to the current event (replying to the user).
* message info also passed to callback.
* Body can either be string or { body, attachment, ...etc }
```js
const messageInfo = await output.reply("Hello!");
```

### **output.send(body, callback)**
* Similar to output.reply except it doesn't have 'replying to' effect on it.
```js
const messageInfo = await output.send("Hello!");
```
### **output.syntaxError()**
* The most unused method, it is used to display syntaxError text if something like the argument syntax is not fulfilled. good for lazy people.
* It also returns a promise similar to output.reply.
```js
let [ bet ] = input.arguments;
bet = parseInt(bet);

if (isNaN(bet)) {
  return output.syntaxError();
}
```
### **output.error(errorInstance, callback)**
* Just put the error object as argument and you're great to go.
* Used to easily send the error message for useful debugging, this is better than just sending 'An error occured', don't copy others who don't add the error message when a command errors, that makes it harder to debug.
* Don't put any non error instance or it may misbehave.
* This also returns promise similarly to output.reply
```js
try {
  throw new Error("Test");
} catch (error) {
  output.error(error);
}
```
### **output.edit(string, messageID, delay)**
* Used to edit the message sent by the bot, all arguments must be string no matter what.
* messageID is not the messageID from event or input, you can obtain the messageID from a promise output.reply or output.send has resolved.
* has limits, 4 edits in same message... i guess?
* delay is an ms that asynchronous pauses the execution but you can still await to pause the entire execution of command if the edit has delay.
```js
const { delay } = global.utils;

const info = await output.reply(`Loading...`);

await output.edit(`Done loading!`, info.messageID, 1000);
```
### **output.waitForReply(body, callback)**
* This is one of the functions with highest level of abstraction.
* It simplifies process of waiting for reply
* It can also be used with 'await' to achieve synchronous execution inside entry function
* It doesn't require reply function exported.
* If no callback provided, the default callback will resolve the input object from user when they reply, which is also convenient.
```js
// using output.waitForReply
export async function entry({ output, input }) {
  const bet = await output.waitForReply("Reply your bet", async ({ repObj, detectID, input: input2 }) => {
    const { resolve, reject } = repObj;
    if (input.senderID !== input2.senderID)
      return;

    // warning, if you used await for output.waitForReply, please take note that the code should resolve or reject no matter what!
    resolve(input2.arguments[0]);
    });

  output.reply(`Your bet is ${bet}`);
}
```
```js
// using traditional approach.
export async function entry({ input, output, commandName }) {
  const i = await output.reply("Reply your bet");
  input.setReply(i.messageID, {
    author: input.senderID,
    key: commandName
  });
}

export async function reply({ repObj, output, input }) {
  if (input.senderID !== repObj.author) return;
  output.reply(`Your bet is ${input.arguments[0]}`);
}
```
### **output.reaction(emoji)**
* Self explanatory
* Sends a reaction to the message of the current input.
* Emoji could be unicode or emoji
* Allows any single emoji.
```js
output.reaction("✅");
```
### **output.add(user, optionalTid)**
* This works like api.addUserToGroup.
* if no thread id provided, it will use the threadID from the current input.
### **output.kick(user, optionalTid)**
* Self explanatory.
### **output.frames(text, ms, text, ms, text, ms, ...args)**
* This combines output.reply and output.edit
* Ms is delay, text is content, easy right?
```js
await output.frames(`Loading
..`, 1000, `Downloading Resources...`, 1000, `Finishing...`, 3000, `Done!`);
```
### **output.waitForReaction(body, callback)**
* Same as output.waitForReply, except its for the sake of reaction detection
```js
//using output.waitForReaction
export async function entry({ output, input }) {
  const { reaction } = await output.waitForReaction("React the emoji you want me to send.");

  output.reply(`The reaction you chose was "${reaction}"`);
}
```
```js
// Traditional approach
export async function entry({ output, input, commandName }) {
  const i = await output.reply("React me the emoji you want me to send.");
  input.setReact(i.messageID, {
    key: commandName
  });
}

export async function reaction({ reactObj, input, output }) {
  output.reply(`The reaction you chose was ${input.reaction}`);
}
```
## **output.quickWaitReact(body, { authorOnly, emoji, edit })**
* This is the same as output.waitForReaction but this one is easier to use!
* `authorOnly` - it will only detect if the same sender is the one who sent a reaction
* `emoji` - only detect if the emoji matches
* `edit` - edit the same message after reaction.
```js
} else if (args[0] === "delete" && args[1]) {
  const filePath = `${__dirname}/${args[1]}`;
  if (!fs.existsSync(filePath)) {
    return output.reply(`File not found!`)
  }
  await output.quickWaitReact(`Are you sure you want to delete this cmd file? React with any emoji to proceed.`, {
    authorOnly: true,
    edit: 'Proceeding!'
  });
  fs.unlinkSync(filePath);
  await output.reply(`The file "${args[0]}" had been deleted.`);
}
```