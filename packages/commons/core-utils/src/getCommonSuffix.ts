export function getCommonSuffix(strings: string[]): string {
    let suffix = "";

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
        const chars = strings.map((s) => s[s.length - suffix.length - 1]);
        const char = chars[0];
        if (char == null || chars.some((c) => c !== char)) {
            break;
        }
        suffix = char + suffix;
    }

    return suffix;
}
