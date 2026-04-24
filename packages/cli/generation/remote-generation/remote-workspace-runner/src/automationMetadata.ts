import { generatorsYml } from "@fern-api/configuration";
import { readFile } from "fs/promises";

/**
 * Returns `https://github.com/{owner}/{repo}` when a generator's output targets a GitHub repo,
 * or undefined for local-file-system / publish-only targets.
 *
 * `githubV2` is a nested discriminated union (commitAndRelease | pullRequest | push); each
 * variant carries owner/repo at the same position, so the inner visitor collapses them.
 */
export function getOutputRepoUrl(generatorInvocation: generatorsYml.GeneratorInvocation): string | undefined {
    return generatorInvocation.outputMode._visit<string | undefined>({
        downloadFiles: () => undefined,
        github: (val) => `https://github.com/${val.owner}/${val.repo}`,
        githubV2: (val) =>
            val._visit<string | undefined>({
                commitAndRelease: (v) => `https://github.com/${v.owner}/${v.repo}`,
                pullRequest: (v) => `https://github.com/${v.owner}/${v.repo}`,
                push: (v) => `https://github.com/${v.owner}/${v.repo}`,
                _other: () => undefined
            }),
        publish: () => undefined,
        publishV2: () => undefined,
        _other: () => undefined
    });
}

/**
 * Returns the 1-indexed line where `name: {generatorName}` appears in the given `generators.yml`
 * content. When a generator name appears multiple times in the file (e.g. the same generator
 * configured twice for different outputs), `occurrenceIndex` disambiguates — callers should
 * increment it across invocations of the same name.
 *
 * Matches either the full canonicalized name (`fernapi/fern-typescript-sdk`) or the short form
 * (`fern-typescript-sdk`) the user wrote in YAML — the configuration loader adds the `fernapi/`
 * prefix at parse time, but the raw file still uses whichever form the user typed.
 *
 * Returns undefined when the path isn't readable or no match is found. Callers treat an absent
 * line number as "link to the file without an anchor."
 */
export async function findGeneratorLineNumber(
    absolutePathToGeneratorsYml: string,
    generatorName: string,
    occurrenceIndex: number
): Promise<number | undefined> {
    let content: string;
    try {
        content = await readFile(absolutePathToGeneratorsYml, "utf8");
    } catch {
        return undefined;
    }
    const candidateNames = new Set([generatorName]);
    // `fernapi/foo` is the canonicalized form the loader produces; the raw YAML commonly has the
    // short `foo`. Match both so users who wrote either form get a working deep link.
    const fernapiPrefix = "fernapi/";
    if (generatorName.startsWith(fernapiPrefix)) {
        candidateNames.add(generatorName.slice(fernapiPrefix.length));
    }

    const lines = content.split("\n");
    let matchCount = 0;
    // Require the `- name:` list-item form so we don't accidentally hit a nested non-generator
    // `name:` key (reviewers, license info, etc.). The capture is tight enough to reject
    // free-form values — generator names are slashed identifiers, never sentences.
    const namePattern = /^\s*-\s+name:\s*["']?([A-Za-z0-9/_.\-@]+)["']?\s*$/;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line == null) {
            continue;
        }
        const match = line.match(namePattern);
        if (match == null || match[1] == null) {
            continue;
        }
        if (candidateNames.has(match[1])) {
            if (matchCount === occurrenceIndex) {
                return i + 1;
            }
            matchCount++;
        }
    }
    return undefined;
}

/**
 * Assigns a stable `generators.yml`-order occurrence index to each generator invocation.
 *
 * `recordOccurrences` walks a list of generators in declaration order and stamps each one with
 * its index among same-named siblings seen so far. `lookup` then returns that index by object
 * identity — so regardless of whether callers record generators in skipped-before-running
 * order or intermixed order, the index matches YAML position.
 *
 * Shared per workspace: call `recordOccurrences` once per group (in `generators.yml` order) at
 * the top of the run, then `lookup` anywhere downstream.
 */
export class GeneratorOccurrenceTracker {
    readonly #byInvocation = new WeakMap<generatorsYml.GeneratorInvocation, number>();
    readonly #counts = new Map<string, number>();

    public recordOccurrences(generators: readonly generatorsYml.GeneratorInvocation[]): void {
        for (const g of generators) {
            const current = this.#counts.get(g.name) ?? 0;
            this.#byInvocation.set(g, current);
            this.#counts.set(g.name, current + 1);
        }
    }

    public lookup(generator: generatorsYml.GeneratorInvocation): number {
        return this.#byInvocation.get(generator) ?? 0;
    }
}
