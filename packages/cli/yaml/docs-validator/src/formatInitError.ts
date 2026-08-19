/**
 * Format an unknown thrown value (caught from a rule's `create()`) into a
 * human-readable message. Avoids the unhelpful `[object Object]` that would
 * otherwise come from `String({})`.
 */
export function formatInitError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    try {
        const serialized = JSON.stringify(error);
        if (serialized != null && serialized !== "{}") {
            return serialized;
        }
    } catch {
        // fall through to Object.prototype.toString
    }
    return Object.prototype.toString.call(error);
}
