export function joinUrlSlugs(a: string, b: string): string {
    if (a === "") {
        return b;
    }
    return `${a}/${b}`;
}
