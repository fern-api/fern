export function getCommonPrefix(strings: string[]): string {
    let prefix = "";

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
        const chars = strings.map((s) => s[prefix.length]);
        const char = chars[0];
        if (char == null || chars.some((c) => c !== char)) {
            break;
        }
        prefix = prefix + char;
    }

    return prefix;
}
