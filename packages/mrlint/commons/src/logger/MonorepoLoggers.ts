import { Rule } from "../Rule";
import { Package } from "../types";
import { Logger } from "./Logger";

export interface MonorepoLoggers {
    getLogger(): Logger;
    getLoggerForPackage: (p: Package) => Logger;
    getLoggerForRule: (args: { rule: Rule; package: Package | undefined }) => Logger;
}
