import path from "node:path";

export function isAbsolute(value: string): boolean {
    return path.isAbsolute(value);
}
