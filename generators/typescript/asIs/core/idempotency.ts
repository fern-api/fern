/**
 * Generates a random UUID (version 4) to use as an idempotency key.
 *
 * Prefers the platform's native `crypto.randomUUID()` when available (Node 19+,
 * modern browsers, Deno, Bun) and falls back to a `Math.random()`-based
 * implementation for older runtimes.
 */
export function generateIdempotencyKey(): string {
    const cryptoObject = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
    if (cryptoObject != null && typeof cryptoObject.randomUUID === "function") {
        return cryptoObject.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
        const random = (Math.random() * 16) | 0;
        const value = character === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
}

/**
 * Returns the auto-generated idempotency-key header. The header name is fixed for the SDK,
 * so it lives here rather than being repeated at every endpoint call site.
 */
export function getIdempotencyHeaders(): Record<string, string> {
    return { "Idempotency-Key": generateIdempotencyKey() };
}
