// @ts-check

// This is a command template!
// Make a new file, copy+paste, and modify!

export default easyCMD({
  name: "hello",
  description: "Greets a user.",
  title: "💗 Greetings",
  async run({ print, reaction, edit, atReply, userName, getMoney, setMoney }) {
    const money = await getMoney();
    const reward = 5;

    print(`Hello ${userName}! You got $${reward}!`);
    reaction("💗");

    await setMoney(money + reward);

    await edit("5 seconds later!", 5000);

    atReply(({ print }) => {
      print("Thanks for replying!");
    });
  },
});
