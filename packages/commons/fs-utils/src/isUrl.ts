export function isURL(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}
