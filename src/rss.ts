import { write, file } from "bun";
import Parser from "rss-parser";

import note from "./note.ts";

const FEED_FILE = "feed.xml";
const FEED_URL = process.env.FEED_URL ?? "https://example.com/feed/";

const parser: Parser = new Parser();

async function getFeedXml() {
  const response = await fetch(FEED_URL).catch((error) => {
    console.error(`Fetch failure: ${error}`);
    throw error;
  });
  if (response.ok) {
    const text = await response.text();
    await write(FEED_FILE, text)
      .then(() => console.log(`Create ${FEED_FILE} success.`))
      .catch((error) => {
        console.error(`Write XML failure: ${error}`);
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
        console.error(`Read currentXml failure: ${error}`);
        throw error;
      });
    const currentFeed = (
      await parser.parseString(currentXml).catch((error) => {
        console.error(`Parse currentXml failure: ${error}`);
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
        console.error(`Read latestXml failure: ${error}`);
        throw error;
      });
    const latestFeed = (
      await parser.parseString(latestXml).catch((error) => {
        console.error(`Parse latestXml failure: ${error}`);
        throw error;
      })
    ).items;

    // Get new Feed
    const newFeeds = latestFeed.filter((feed) => {
      const pubDate = new Date(feed.pubDate ?? "");
      if (pubDate > lastDate && pubDate != lastDate) return feed;
    });

    return newFeeds;
  } catch (error) {
    console.error(`Get new feeds failure: ${error}`);
    throw error;
  }
}

function createNote(feed: Parser.Item) {
  const title = feed.title;
  const link = feed.link;
  const text = `${title}\n` + `${link}\n\n` + `${process.env.HASHTAG}`;
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
        note(text, process.env.VISIBILITY);
      });
    } else {
      console.log("New news not exists.");
    }
    console.log("End to check update news.");
  } catch (error) {
    console.error(`Check update news failure: ${error}`);
  }
}
