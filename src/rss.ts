import { write, file } from "bun";
import Parser from "rss-parser";

import note from "./note.ts";
import config from "../config.json";

const FEED_FILE = "feed.xml";
const FEED_URL = config.feed_url ?? "https://example.com/feed/";

const parser: Parser = new Parser();

async function getFeedXml() {
  const response = await fetch(FEED_URL).catch((error) => {
    console.error("Fetch failure.");
    throw error;
  });
  if (response.ok) {
    const text = await response.text();
    await write(FEED_FILE, text)
      .then(() => console.log(`Create ${FEED_FILE} success.`))
      .catch((error) => {
        console.error("Write XML failure.");
        throw error;
      });
  } else {
    console.error(`Fetch failure from ${FEED_URL}`);
    console.error(`${response.status} : ${response.statusText}`);
    throw Error;
  }
}

async function getNewFeed() {
  try {
    // Read current Feed
    const currentXml = await file(FEED_FILE)
      .text()
      .catch((error) => {
        console.error("Read currentXml failure.");
        throw error;
      });
    const currentFeed = (
      await parser.parseString(currentXml).catch((error) => {
        console.error("Parse currentXml failure.");
        throw error;
      })
    ).items;
    const lastDate = new Date(
      currentFeed[0].pubDate ? currentFeed[0].pubDate : ""
    );

    // Get latest Feed
    await getFeedXml();
    const latestXml = await file(FEED_FILE)
      .text()
      .catch((error) => {
        console.error("Read latestXml failure.");
        throw error;
      });
    const latestFeed = (
      await parser.parseString(latestXml).catch((error) => {
        console.error("Parse latestXml failure.");
        throw error;
      })
    ).items;

    // Get new Feed
    const newFeeds = latestFeed.filter((feed) => {
      const pubDate = new Date(feed.pubDate ?? "");
      if (pubDate > lastDate && pubDate != lastDate) return feed;
    });

    return newFeeds;
  } catch {
    console.error("Get new feeds failure.");
    throw Error;
  }
}

function createNote(feed: Parser.Item) {
  const title = feed.title;
  const link = feed.link;
  const text = `${title}\n` + `${link}\n\n` + `${config.hashtag}`;
  return text;
}

export function init() {
  console.log("Init XML.");
  getFeedXml();
}

export default async function checkUpdate() {
  console.log("Start to check update news.");
  try {
    const feed = await getNewFeed();
    if (feed.length > 0) {
      feed.forEach((f) => {
        const text = createNote(f);
        note(text, config.visibility);
      });
    } else {
      console.log("New news not exists.");
    }
    console.log("End to check update news.");
  } catch {
    console.error("Check update news failure.");
  }
}
