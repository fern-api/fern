export function hashJSON(obj: unknown): string {
    const jsonString = JSON.stringify(obj);
    let hash = 0x811c9dc5; // Random prime number.
    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString.charCodeAt(i);
        hash ^= char;
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    const positiveHash = hash >>> 0;
    return positiveHash.toString(16);
}
