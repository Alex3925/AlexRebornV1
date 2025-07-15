# CassidyBoT DOCS

## Input Plugin
- Author: **Liane Cagara**
- Similar to **event**

* Everything in event object from FCA is in the input object too!

### Basics

1. **input.arguments: array**
* An array containing the command arguments.
* Doesn't include the command name.
```
!styleshoes red modern
```
```js
const [ color, style ] = input.arguments;

output.reply(`Chosen x
Color: ${color}\nChosen Style: ${style}`);
```
```js
const question = input.arguments.join("");

output.reply(`Your question is: ${question}`);
```
2. **input.isAdmin: boolean**
* Returns true if the sender is a bot admin.
```js
if (input.isAdmin) {
  output.reply(`Hello my master!`);
} else {
  output.reply(`You are not my master!`);
}
```
3. **input.links: array**
* Array containing all links in the body of the message.
```js
if (input.links) {
  return output.reply(`Links aren't allowed!`);
}
```
```js
const [ link ] = input.links;

axios.get(link)
  .then(res => output.reply(res.data.message))
  .catch(err => output.reply(err.toString()));
```
4. **input.hasMentions: boolean**
* Returns true if the message has at least one mention.
* It doesn't matter if there are more than 1 mention.

5. **input.body: string**
* The message body sent from the user.

6. **input.senderID and input.threadID: both string**
* Contains important user and thread identifer for the purpose of distinguishing.


