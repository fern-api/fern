import { generatorsYml } from "@fern-api/configuration";
import { IntermediateRepresentation, Name } from "@fern-api/ir-sdk";

import { CasingsGenerator, constructCasingsGenerator } from "./CasingsGenerator.js";

/**
 * A slim Name object — has `originalName` but is missing some or all casings.
 * This is the wire format for Name in IR v66+.
 */
export type SlimName = Partial<Name> & Pick<Name, "originalName">;

/**
 * Inflates a single slim Name object (only originalName) into a full Name with all casings.
 * If all casings are already present, returns the Name as-is.
 */
export function inflateName(name: SlimName, casingsGenerator: CasingsGenerator): Name {
    if (
        name.camelCase != null &&
        name.pascalCase != null &&
        name.snakeCase != null &&
        name.screamingSnakeCase != null
    ) {
        return name as Name;
    }
    const generated = casingsGenerator.generateName(name.originalName);
    return {
        originalName: name.originalName,
        camelCase: name.camelCase ?? generated.camelCase,
        pascalCase: name.pascalCase ?? generated.pascalCase,
        snakeCase: name.snakeCase ?? generated.snakeCase,
        screamingSnakeCase: name.screamingSnakeCase ?? generated.screamingSnakeCase
    };
}

/**
 * Returns true if the given object looks like a slim Name (has originalName but missing casings).
 * A slim Name is identified by:
 *  - Having `originalName: string`
 *  - Either having at least one known casing key with a null/undefined value,
 *    OR being a minimal object with only `originalName` as its sole key.
 */
function isSlimName(record: Record<string, unknown>): boolean {
    if (typeof record.originalName !== "string") {
        return false;
    }
    const hasCasingKey =
        "camelCase" in record || "pascalCase" in record || "snakeCase" in record || "screamingSnakeCase" in record;
    const isOnlyOriginalName = !hasCasingKey && Object.keys(record).length === 1;

    if (!hasCasingKey && !isOnlyOriginalName) {
        return false;
    }

    // If it has casing keys, check if any are missing
    if (hasCasingKey) {
        return (
            record.camelCase == null ||
            record.pascalCase == null ||
            record.snakeCase == null ||
            record.screamingSnakeCase == null
        );
    }

    return true;
}

/**
 * Recursively walks any object/array and inflates all slim Name objects found within.
 * A slim Name is an object with `originalName` but missing casing fields.
 */
function inflateNamesDeep(obj: unknown, casingsGenerator: CasingsGenerator): unknown {
    if (obj == null || typeof obj !== "object") {
        return obj;
    }

    if (Array.isArray(obj)) {
        let changed = false;
        const result = obj.map((item) => {
            const inflated = inflateNamesDeep(item, casingsGenerator);
            if (inflated !== item) {
                changed = true;
            }
            return inflated;
        });
        return changed ? result : obj;
    }

    // Preserve Set/Map/Date instances
    if (obj instanceof Set || obj instanceof Map || obj instanceof Date) {
        return obj;
    }

    const record = obj as Record<string, unknown>;

    // Check if this is a slim Name that needs inflation
    if (isSlimName(record)) {
        const name = record as unknown as SlimName;
        return inflateName(name, casingsGenerator);
    }

    // Recurse into all properties
    let changed = false;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
        const inflated = inflateNamesDeep(value, casingsGenerator);
        result[key] = inflated;
        if (inflated !== value) {
            changed = true;
        }
    }
    return changed ? result : obj;
}

/**
 * Inflates all slim Name objects in an IntermediateRepresentation.
 * Uses the IR's smartCasing and generationLanguage fields to configure the CasingsGenerator.
 * After inflation, all Name objects have their casings fully populated.
 *
 * Accepts `unknown` because the v66 wire format has slim Names that don't match
 * the full Name type. After inflation, the result conforms to IntermediateRepresentation.
 */
export function inflateIrNames(ir: unknown): IntermediateRepresentation {
    const record = ir as Record<string, unknown>;
    const generationLanguage = record.generationLanguage as generatorsYml.GenerationLanguage | undefined;
    const smartCasing = (record.smartCasing as boolean) ?? false;

    const casingsGenerator = constructCasingsGenerator({
        generationLanguage,
        keywords: undefined,
        smartCasing
    });

    return inflateNamesDeep(ir, casingsGenerator) as IntermediateRepresentation;
}

/**
 * Checks if a record looks like a full Name object (has originalName + at least one casing key present).
 */
function isFullName(record: Record<string, unknown>): boolean {
    return (
        typeof record.originalName === "string" &&
        (record.camelCase != null ||
            record.pascalCase != null ||
            record.snakeCase != null ||
            record.screamingSnakeCase != null)
    );
}

/**
 * Recursively walks any object/array and strips casing fields from all Name objects,
 * leaving only { originalName: "..." }.
 * This produces the v66 slim wire format.
 */
function slimNamesDeep(obj: unknown): unknown {
    if (obj == null || typeof obj !== "object") {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(slimNamesDeep);
    }

    // Preserve Set/Map/Date instances
    if (obj instanceof Set || obj instanceof Map || obj instanceof Date) {
        return obj;
    }

    const record = obj as Record<string, unknown>;

    // If this is a full Name object, strip it to just originalName
    if (isFullName(record)) {
        return { originalName: record.originalName };
    }

    // Recurse into all properties
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
        result[key] = slimNamesDeep(value);
    }
    return result;
}

/**
 * Strips Name casings from an IntermediateRepresentation, leaving only { originalName: "..." }
 * for each Name object. This produces the v66 slim wire format.
 * Used by the IR generator to produce the v66 output.
 */
export function slimIrNames(ir: IntermediateRepresentation): unknown {
    return slimNamesDeep(ir);
}
