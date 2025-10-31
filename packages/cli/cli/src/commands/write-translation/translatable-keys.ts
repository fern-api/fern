export const TRANSLATABLE_YAML_KEYS = new Set([
    "title",
    "display-name",
    "page",
    "section",
    "text",
    "link",
    "message",
    "subtitle",
    "search-text",
    "system-prompt",
    "summary",
    "description",
    "docs",
    "tags",
    "api"
]);

export function shouldTranslateValue(key: string, value: any): boolean {
    if (typeof value !== "string") {
        return false;
    }
    
    // don't translate string - this is likely a type
    if (value === "string") {
        return false;
    }
    
    // don't translate relative links
    if (value.startsWith("./")) {
        return false;
    }

    if (TRANSLATABLE_YAML_KEYS.has(key)) {
        return true;
    }

    return false;
}
