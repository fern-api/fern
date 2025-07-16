import { sep } from "./sep";

export function relative(from: string, to: string): string {
    const fromParts = from.split(sep).filter(Boolean);
    const toParts = to.split(sep).filter(Boolean);
    let i = 0;
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
        i++;
    }
    const upLevels = fromParts.length - i;
    const result = [
        ...Array(upLevels).fill(".."), // Go up for each remaining directory in `from`
        ...toParts.slice(i) // Add the remaining path parts from `to`
    ];
    return result.join(sep) || ".";
}
