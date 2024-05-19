import { schedule } from "node-cron";

import checkUpdate, { init } from "./rss";
import config from "../config.json";

const interval = config.interval_min ?? 5;

console.log("Start node-cron");
console.log(`Check interval: ${interval} ${interval == 1 ? "min" : "mins"}`);

init();

schedule(`0 */${interval} * * * *`, () => checkUpdate());
