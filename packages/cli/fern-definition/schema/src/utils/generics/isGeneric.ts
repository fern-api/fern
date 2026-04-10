import { parseGeneric } from "./parseGeneric.js";

export function isGeneric(name: string): boolean {
    return parseGeneric(name) != null;
}
