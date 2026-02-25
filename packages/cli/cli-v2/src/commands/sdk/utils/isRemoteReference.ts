/**
 * Returns true if the value looks like a remote reference but is not a
 * recognized git URL (e.g. plain http/https/ssh URLs, or user@host patterns).
 */
export function isRemoteReference(value: string): boolean {
    return (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("ssh://") ||
        (value.includes("@") && value.includes(":"))
    );
}
