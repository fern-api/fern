import { generatorsYml } from "@fern-api/configuration";
import { IntermediateRepresentation, Name } from "@fern-api/ir-sdk";

import { CasingsGenerator, constructCasingsGenerator } from "./CasingsGenerator.js";

/**
 * A Name type with all casings guaranteed to be present (non-undefined).
 * Use this after inflation to avoid null checks throughout generator code.
 */
export interface InflatedName extends Name {
    camelCase: NonNullable<Name["camelCase"]>;
    pascalCase: NonNullable<Name["pascalCase"]>;
    snakeCase: NonNullable<Name["snakeCase"]>;
    screamingSnakeCase: NonNullable<Name["screamingSnakeCase"]>;
}

/**
 * Inflates a single Name object by computing any missing casings.
 * If all casings are already present, returns the Name as-is.
 */
export function inflateName(name: Name, casingsGenerator: CasingsGenerator): InflatedName {
    if (
        name.camelCase != null &&
        name.pascalCase != null &&
        name.snakeCase != null &&
        name.screamingSnakeCase != null
    ) {
        return name as InflatedName;
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
 * Recursively walks any object/array and inflates all Name objects found within.
 * A Name object is identified by having an `originalName` string property.
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

    const record = obj as Record<string, unknown>;

    // Check if this looks like a Name object.
    // A Name must have `originalName: string` and typically has casing keys (camelCase, etc.).
    // We require at least one known casing key OR that it's a slim Name (only originalName).
    // To avoid false positives on arbitrary objects with an `originalName` property,
    // we check that the object looks Name-shaped: either it has at least one casing key,
    // or it has exactly one key (originalName) making it a slim Name.
    if (typeof record.originalName === "string") {
        const hasCasingKey =
            "camelCase" in record ||
            "pascalCase" in record ||
            "snakeCase" in record ||
            "screamingSnakeCase" in record;
        const isSlimName = !hasCasingKey && Object.keys(record).length === 1;

        if (hasCasingKey || isSlimName) {
            const name = record as unknown as Name;
            // Only inflate if at least one casing is missing
            if (
                name.camelCase == null ||
                name.pascalCase == null ||
                name.snakeCase == null ||
                name.screamingSnakeCase == null
            ) {
                const inflated = inflateName(name, casingsGenerator);
                return inflated;
            }
        }
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
 * Inflates all Name objects in an IntermediateRepresentation.
 * Uses the IR's smartCasing and generationLanguage fields to configure the CasingsGenerator.
 * After inflation, all Name objects have their casings populated.
 */
export function inflateIrNames(ir: IntermediateRepresentation): IntermediateRepresentation {
    const generationLanguage = ir.generationLanguage as generatorsYml.GenerationLanguage | undefined;
    const smartCasing = ir.smartCasing ?? false;

    const casingsGenerator = constructCasingsGenerator({
        generationLanguage,
        keywords: undefined,
        smartCasing
    });

    return inflateNamesDeep(ir, casingsGenerator) as IntermediateRepresentation;
}
