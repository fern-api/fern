export const blacklistedNames: Map<string, string> = new Map<string, string>([["api", "api-reference"]]);

export const INDEX_NAMES = ["home", "introduction", "getting-started", "get-started", "welcome", "start"] as const;

export const GROUP_NAMES = [
    "Home",
    "Introduction",
    "Getting Started",
    "Get Started",
    "Welcome",
    "Start",
    "Docs"
] as const;

export function getReservedName(namesToUse: Array<string>, namesInUse: Array<string>): string {
    for (const name of namesToUse) {
        if (namesInUse.includes(name)) {
            continue;
        }
        return name;
    }
    return "";
}
