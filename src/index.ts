import { schedule } from "node-cron";

import checkUpdate, { init } from "./rss";

const interval = Number(process.env.INTERVAL_MIN);

console.log("Start node-cron");
console.log(`Check interval: ${interval} ${interval == 1 ? "min" : "mins"}`);

init();

schedule(`0 */${interval} * * * *`, () => checkUpdate());
