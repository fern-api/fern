export const blacklistedNames = new Map<string, string>([["api", "api-reference"]]);

export const INDEX_NAMES = ["home", "introduction", "getting-started", "get-started", "welcome", "start"];

export const GROUP_NAMES = ["Home", "Introduction", "Getting Started", "Get Started", "Welcome", "Start", "Docs"];

export function getReservedName(namesToUse: Array<string>, namesInUse: Array<string>): string {
    for (const name of namesToUse) {
        if (namesInUse.includes(name)) {
            continue;
        }
        return name;
    }
    return "";
}
