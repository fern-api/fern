export function extractErrorMessage(e: unknown): string {
    if (typeof e === "string") {
        return e.length > 0 ? e : "Unknown error";
    }
    if (e instanceof Error) {
        return e.message.length > 0 ? e.message : "Unknown error";
    }
    if (typeof e === "object" && e !== null && "message" in e && typeof e["message"] === "string") {
        return e["message"].length > 0 ? e["message"] : "Unknown error";
    }
    const stringified = String(e);
    return stringified.length > 0 ? stringified : "Unknown error";
}
