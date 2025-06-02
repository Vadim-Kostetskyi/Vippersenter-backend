import { logger } from "../logger/index.js";
import { Config } from "./config.package.js";

const config = new Config(logger);

export { config };
export { type IConfig } from "./interfaces/index.js";
