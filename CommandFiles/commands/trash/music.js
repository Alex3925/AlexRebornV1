// @ts-check
export const meta = {
  name: "music",
  description: "Play a song with lyrics.",
  author: "Liane | Distube | YTDL",
  version: "1.0.0",
  usage: "{prefix}{name}",
  category: "Media",
  permissions: [0],
  noPrefix: false,
  waitingTime: 10,
  requirement: "3.0.0",
  otherNames: ["ms"],
  icon: "🎵",
  noLevelUI: true,
  noWeb: true,
};

import ytdl from "@distube/ytdl-core";
import yts from "yt-search";

export const style = {
  title: "🎵 Music",
  titleFont: "bold",
  contentFont: "fancy",
};

import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cass/unispectra";

export const entry = defineEntry(
  async ({ cancelCooldown, output, args, prefix, commandName }) => {
    if (args.length === 0) {
      cancelCooldown();
      return output.reply(
        `❌ Please enter a music name as argument.\n**Example**: ${prefix}${commandName} never gonna give you up.`
      );
    }
    const song = args.join(" ");
    await output.reply(
      `🔎 | Searching Music for **"${song}"**.\n⏳ | Please **wait**...🤍`
    );

    const searchResults = await yts(song);
    if (!searchResults.videos.length) {
      return output.reply("Error: Invalid request.");
    }

    const video = searchResults.videos[0];
    const videoUrl = video.url;

    let stream = ytdl(videoUrl, { filter: "audioonly" });
    stream.on("error", (err) => {
      return output.reply(
        `${UNISpectra.arrow} **YT Failed**\n\n🔎 **Possible Reasons**:\n**1.** The song might be ***copyrighted.***\n**2.** Youtube just hate robots.`
      );
    });
    await output.reply({
      body: `🎧 ***${video.title}***\n${UNISpectra.arrow} ${video.author.name}\n${UNISpectra.arrowFromT} ${video.duration.timestamp} | ${video.views} views.`,
      attachment: stream,
    });
    stream = null;
    return;
  }
);
