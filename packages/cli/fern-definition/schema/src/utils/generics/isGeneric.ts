import { parseGeneric } from "./parseGeneric";

export function isGeneric(name: string): boolean {
    return parseGeneric(name) != null;
}
