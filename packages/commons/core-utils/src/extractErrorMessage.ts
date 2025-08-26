export function extractErrorMessage(e: unknown): string {
    if (typeof e === "string") {
        return e;
    }
    if (e instanceof Error) {
        return e.message;
    }
    if (typeof e === "object" && e !== null && "message" in e && typeof e["message"] === "string") {
        return e["message"];
    }
    return "Unknown error";
}
