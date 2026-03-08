import { generatorsYml } from "@fern-api/configuration";
import { FernFilepath, Name, NameAndWireValue } from "@fern-api/ir-sdk";

import { constructCasingsGenerator, FullCasingsGenerator, FullName, FullNameAndWireValue } from "./CasingsGenerator.js";

/**
 * In v66 IR, Name is a plain string (the original name).
 * This type alias makes the intent clear.
 */
export type SlimName = Name; // Name = string in v66

/**
 * A fully-resolved FernFilepath with FullName objects instead of strings.
 */
export interface FullFernFilepath {
    allParts: FullName[];
    packagePath: FullName[];
    file: FullName | undefined;
}

/**
 * Inflates a single slim Name (string) into a FullName with all casings computed.
 * Detection: `typeof name === "string"` — if it's a string, it needs inflation.
 */
export function inflateName(name: string, casingsGenerator: FullCasingsGenerator): FullName {
    return casingsGenerator.generateName(name);
}

/**
 * Inflates a NameAndWireValue (where name is a string) into a FullNameAndWireValue.
 */
export function inflateNameAndWireValue(
    nwv: NameAndWireValue,
    casingsGenerator: FullCasingsGenerator
): FullNameAndWireValue {
    return {
        name: inflateName(nwv.name, casingsGenerator),
        wireValue: nwv.wireValue
    };
}

/**
 * Inflates a FernFilepath (where names are strings) into a FullFernFilepath.
 */
export function inflateFernFilepath(fp: FernFilepath, casingsGenerator: FullCasingsGenerator): FullFernFilepath {
    return {
        allParts: fp.allParts.map((name) => inflateName(name, casingsGenerator)),
        packagePath: fp.packagePath.map((name) => inflateName(name, casingsGenerator)),
        file: fp.file != null ? inflateName(fp.file, casingsGenerator) : undefined
    };
}

/**
 * Creates a FullCasingsGenerator from the IR's metadata fields.
 * Used by generators and migration code to inflate slim Names.
 */
export function createCasingsGeneratorFromIr(ir: {
    smartCasing: boolean;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
}): FullCasingsGenerator {
    return constructCasingsGenerator({
        generationLanguage: ir.generationLanguage,
        keywords: undefined,
        smartCasing: ir.smartCasing
    });
}

// --- Deep IR inflation ---

/**
 * Keys that ALWAYS hold Name values when the value is a string.
 * Derived from the IR YAML schema (commons.yml, http.yml, auth.yml, etc.).
 */
const ALWAYS_NAME_KEYS = new Set([
    "apiName",
    "requestParameterName",
    "wrapperName",
    "bodyKey",
    "token", // BearerAuthScheme.token: Name
    "username", // BasicAuthScheme.username: Name
    "password", // BasicAuthScheme.password: Name
    "clientId", // OAuthScheme.clientId: Name
    "clientSecret" // OAuthScheme.clientSecret: Name
]);

/**
 * Detects a FernFilepath-shaped object: { allParts, packagePath, file }.
 * In v66 IR, allParts/packagePath are string[] and file is string | undefined.
 */
function isFernFilepathShape(obj: Record<string, unknown>): boolean {
    return "allParts" in obj && "packagePath" in obj;
}

/**
 * Detects objects where the `name` field is optional<string> (NOT a Name).
 * These are example types that use plain string names for display purposes.
 */
function hasNonNameNameField(obj: Record<string, unknown>): boolean {
    // ExampleEndpointCall: has endpointPathParameters/servicePathParameters/rootPathParameters
    if ("endpointPathParameters" in obj || "servicePathParameters" in obj || "rootPathParameters" in obj) {
        return true;
    }
    // V2HttpEndpointCodeSample: has language + code
    if ("language" in obj && "code" in obj) {
        return true;
    }
    // V2WebhookExample: has payload but no wireValue/fernFilepath
    if ("payload" in obj && !("wireValue" in obj) && !("fernFilepath" in obj)) {
        return true;
    }
    return false;
}

/**
 * Determines if a string value at a given key should be inflated as a Name.
 */
function shouldInflateStringField(key: string, parentObj: Record<string, unknown>): boolean {
    if (ALWAYS_NAME_KEYS.has(key)) {
        return true;
    }
    // FernFilepath.file
    if (key === "file" && isFernFilepathShape(parentObj)) {
        return true;
    }
    // The `name` key holds a Name in most IR types, EXCEPT example types
    if (key === "name" && !hasNonNameNameField(parentObj)) {
        return true;
    }
    return false;
}

/**
 * Recursively walks a value and inflates all Name strings into FullName objects.
 * Uses structural heuristics to detect which strings are Names:
 * - Known Name keys (apiName, token, username, etc.)
 * - The `name` key in non-example contexts
 * - FernFilepath arrays (allParts, packagePath) and file field
 */
function deepInflateValue(value: unknown, cg: FullCasingsGenerator): unknown {
    if (value == null || typeof value !== "object") {
        return value;
    }
    if (Array.isArray(value)) {
        let changed = false;
        const result = value.map((v) => {
            const inflated = deepInflateValue(v, cg);
            if (inflated !== v) {
                changed = true;
            }
            return inflated;
        });
        return changed ? result : value;
    }

    const obj = value as Record<string, unknown>;
    const fp = isFernFilepathShape(obj);
    let changed = false;
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(obj)) {
        if (typeof val === "string" && shouldInflateStringField(key, obj)) {
            result[key] = inflateName(val, cg);
            changed = true;
        } else if (Array.isArray(val) && fp && (key === "allParts" || key === "packagePath")) {
            // FernFilepath: allParts and packagePath are Name arrays
            const inflatedArr = val.map((v) => (typeof v === "string" ? inflateName(v, cg) : deepInflateValue(v, cg)));
            result[key] = inflatedArr;
            changed = true;
        } else {
            const inflated = deepInflateValue(val, cg);
            if (inflated !== val) {
                changed = true;
            }
            result[key] = inflated;
        }
    }

    return changed ? result : value;
}

/**
 * Inflates an entire v66 IR: converts all string Names into FullName objects
 * with all casings computed. Uses smartCasing and generationLanguage from the
 * IR metadata to produce correct casings.
 *
 * Used by:
 * - The v66→v65 migration (to restore full Names for older generators)
 * - Generators that adopt v66 IR (to inflate Names at deserialization time)
 */
export function inflateIrNames<
    T extends { smartCasing: boolean; generationLanguage: generatorsYml.GenerationLanguage | undefined }
>(ir: T): T {
    const casingsGenerator = createCasingsGeneratorFromIr(ir);
    return deepInflateValue(ir, casingsGenerator) as T;
}
