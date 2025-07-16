import { getLexicallyNearestNeighbors } from "./getLexicallyNearestNeighbors"

const NUM_MATCH_CANDIDATES = 3
const LEVENSHTEIN_THRESHOLD = 5

export function cannotFindSubpackageByLocatorError(locator: string, existingLocators: Iterable<string>): string {
    const nearestThreeMatches = getLexicallyNearestNeighbors(
        locator,
        existingLocators,
        NUM_MATCH_CANDIDATES,
        normalizeLocatorString,
        LEVENSHTEIN_THRESHOLD
    )
    const availableSections = Array.from(existingLocators)
    let msg = `Failed to locate API section ${locator}.`
    switch (nearestThreeMatches.length) {
        case 0:
            msg = `${msg} No similar API sections found. Available API sections:`
            return availableSections.length === 0
                ? `${msg} []`
                : `${msg} [\n${availableSections.map((s) => `\t${s}`).join(",\n")}\n]`
        case 1:
            return `${msg} Did you mean ${nearestThreeMatches[0]}?`
        case 2:
            return `${msg} Did you mean ${nearestThreeMatches[0]} or ${nearestThreeMatches[1]}?`
        default:
            return `${msg} Did you mean ${nearestThreeMatches[0]}, ${nearestThreeMatches[1]}, or ${nearestThreeMatches[2]}?`
    }
}

export function packageReuseError(name: string): string {
    return `API section ${name} is specified multiple times, however will be only rendered once.`
}

export function normalizeLocatorString(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]/g, "")
}
