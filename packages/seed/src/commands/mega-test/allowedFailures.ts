/**
 * Parse a generator's `allowedFailures` list into a set of fixture names. Entries are either
 * `fixtureName` or `fixtureName:outputFolder`; we match on the fixture name only so that any
 * configured-fixture variant on the list causes the whole fixture to be skipped in mega-test.
 */
export function parseAllowedFailures(allowedFailures: string[] | undefined): Set<string> {
    const names = new Set<string>();
    if (allowedFailures == null) {
        return names;
    }
    for (const entry of allowedFailures) {
        const trimmed = entry.trim();
        if (trimmed.length === 0) {
            continue;
        }
        const [fixtureName] = trimmed.split(":", 1);
        if (fixtureName != null && fixtureName.length > 0) {
            names.add(fixtureName);
        }
    }
    return names;
}
