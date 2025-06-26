import { getLexicallyNearestNeighbors } from "./getKLexicallyNearestNeighbors";

export function cannotFindSubpackageByLocatorError(locator: string, existingLocators: Iterable<string>) {
    const nearestThreeMatches = getLexicallyNearestNeighbors(locator, existingLocators, 3);
    const msg = `Failed to locate API section ${locator}.`;
    switch (nearestThreeMatches.length) {
        case 0:
            return msg;
        case 1:
            return `${msg} Did you mean ${nearestThreeMatches[0]}?`;
        case 2:
            return `${msg} Did you mean ${nearestThreeMatches[0]} or ${nearestThreeMatches[1]}?`;
        default:
            return `${msg} Did you mean ${nearestThreeMatches[0]}, ${nearestThreeMatches[1]}, or ${nearestThreeMatches[2]}?`;
    }
}

export function packageReuseError(name: string): string {
    return `API section ${name} is specified multiple times, however will be only rendered once.`;
}
