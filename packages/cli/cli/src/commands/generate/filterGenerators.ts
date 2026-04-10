import type { generatorsYml } from "@fern-api/configuration-loader";

export type FilterResult = { ok: true; generators: generatorsYml.GeneratorInvocation[] } | { ok: false; error: string };

/**
 * Parses a `--generator` argument as either a 0-based index or a generator name.
 * Returns `{ generatorName, generatorIndex }` with exactly one set and the other undefined.
 * If the argument is undefined, both are undefined (no filter).
 */
export function parseGeneratorArg(generatorArg: string | undefined): {
    generatorName: string | undefined;
    generatorIndex: number | undefined;
} {
    if (generatorArg == null) {
        return { generatorName: undefined, generatorIndex: undefined };
    }
    const parsed = generatorArg.length > 0 ? Number(generatorArg) : Number.NaN;
    if (!Number.isNaN(parsed) && Number.isInteger(parsed) && parsed >= 0) {
        return { generatorName: undefined, generatorIndex: parsed };
    }
    return { generatorName: generatorArg, generatorIndex: undefined };
}

/**
 * Filters a list of generators by index or name.
 * Index takes precedence over name when both are provided.
 * Returns the filtered list, or an error message if the filter doesn't match.
 */
export function filterGenerators({
    generators,
    generatorIndex,
    generatorName,
    groupName
}: {
    generators: generatorsYml.GeneratorInvocation[];
    generatorIndex: number | undefined;
    generatorName: string | undefined;
    groupName: string;
}): FilterResult {
    if (generatorIndex != null) {
        const generator = generators[generatorIndex];
        if (generator == null) {
            return {
                ok: false,
                error:
                    `Generator index ${generatorIndex} is out of bounds in group '${groupName}' ` +
                    `(${generators.length} generators available)`
            };
        }
        return { ok: true, generators: [generator] };
    }

    if (generatorName != null) {
        const filtered = generators.filter((gen) => gen.name === generatorName);
        if (filtered.length === 0) {
            const available = generators.map((gen) => gen.name);
            return {
                ok: false,
                error:
                    `Generator '${generatorName}' not found in group '${groupName}'. ` +
                    `Available generators: ${available.join(", ")}`
            };
        }
        return { ok: true, generators: filtered };
    }

    // No filter — return all generators
    return { ok: true, generators };
}
