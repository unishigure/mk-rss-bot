import { schedule } from "node-cron";

import checkUpdate, { init } from "./rss";
import note from "./note.ts";

const interval = Number(process.env.INTERVAL_MIN);

await note("Connection test Note")
  .then(() => console.log("Connection test success."))
  .catch((error) => console.error(`Connection test failure: ${error}`));

await init();

console.log(`Check interval: ${interval} ${interval == 1 ? "min" : "mins"}`);
console.log("Start node-cron");
schedule(`0 */${interval} * * * *`, () => checkUpdate());
