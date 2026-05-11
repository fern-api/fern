import { minimatch } from "minimatch";

import { MegaFixture } from "./discoverMegaFixtures.js";

// Must match `LANGUAGE_SPECIFIC_FIXTURE_PREFIXES` in `commands/test/testWorkspaceFixtures.ts`.
// Inlined to keep this module side-effect free (the other module reads the filesystem on import).
const LANGUAGE_SPECIFIC_FIXTURE_PREFIXES = ["csharp", "go", "java", "python", "ruby", "ts"] as const;

/**
 * Selects which fixtures participate in the mega-test for a given generator. Mirrors the
 * include/exclude/language-prefix semantics of `pnpm seed test`.
 */
export function filterFixtures({
    fixtures,
    include,
    exclude,
    generatorName
}: {
    fixtures: MegaFixture[];
    include?: string[];
    exclude?: string[];
    generatorName: string;
}): MegaFixture[] {
    return fixtures.filter((fixture) => {
        const matchingPrefix = LANGUAGE_SPECIFIC_FIXTURE_PREFIXES.find((prefix) => fixture.name.startsWith(prefix));
        if (matchingPrefix != null && !generatorName.startsWith(matchingPrefix)) {
            return false;
        }

        if (include != null && include.length > 0) {
            const matched = include.some((pattern) => minimatch(fixture.name, pattern));
            if (!matched) {
                return false;
            }
        }
        if (exclude != null && exclude.length > 0) {
            const excluded = exclude.some((pattern) => minimatch(fixture.name, pattern));
            if (excluded) {
                return false;
            }
        }
        return true;
    });
}
