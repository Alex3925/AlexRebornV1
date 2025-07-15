try {
  // @ts-check
  const envfile = require("envfile");
  const fs = require("fs");
  const cookie = require("./cookie.json");
  let x = '"uwu"';

  // @ts-ignore
  if (cookie !== x) {
    const env = envfile.parse(fs.readFileSync(".env", "utf-8"));
    env.APPSTATE = JSON.stringify(cookie);
    fs.writeFileSync("./cookie.json", x);
    fs.writeFileSync(".env", envfile.stringify(env));
  }
} catch (error) {}
