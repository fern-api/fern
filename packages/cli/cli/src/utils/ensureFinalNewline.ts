export function ensureFinalNewline(content: string): string {
    return content.endsWith("\n") ? content : content + "\n";
}
