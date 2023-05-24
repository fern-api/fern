export function joinUrlSlugs(...parts: [string, ...string[]]): string {
    return parts.reduce((a, b) => {
        if (a === "") {
            return b;
        }
        return `${a}/${b}`;
    });
}
