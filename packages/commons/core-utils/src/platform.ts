import { UAParser } from "ua-parser-js";

const uaParser = new UAParser();

export type Platform = "mac" | "windows" | "other";

export const PLATFORM = (function getPlatform(): Platform {
    const { name } = uaParser.getOS();
    if (typeof name === "string") {
        if (name.startsWith("Mac OS")) {
            return "mac";
        }
        if (name.startsWith("Windows")) {
            return "windows";
        }
    }
    return "other";
})();
