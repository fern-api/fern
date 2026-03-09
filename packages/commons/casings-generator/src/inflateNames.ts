import { generatorsYml } from "@fern-api/configuration";
import { FernFilepath, IntermediateRepresentation, Name, NameAndWireValue, NameOrString } from "@fern-api/ir-sdk";

import { CasingsGenerator, constructCasingsGenerator } from "./CasingsGenerator.js";

// ---------------------------------------------------------------------------
// InflatedIR type utility
// ---------------------------------------------------------------------------

/**
 * Recursively converts all NameOrString fields to Name throughout an IR type.
 * After inflation, every NameOrString is guaranteed to be a full Name object.
 */
export type InflatedIR<T> = T extends NameOrString
    ? Name
    : T extends (infer U)[]
      ? InflatedIR<U>[]
      : T extends Record<string, unknown>
        ? { [K in keyof T]: InflatedIR<T[K]> }
        : T;

// ---------------------------------------------------------------------------
// Core inflation helpers
// ---------------------------------------------------------------------------

/**
 * Inflates a single NameOrString to a full Name.
 * If the value is already a Name object, returns it as-is.
 * If it's a string, computes all casings using the CasingsGenerator.
 *
 * Detection: `typeof nameOrString === "string"` is the marker.
 */
export function inflateNameOrString(nameOrString: NameOrString, casingsGenerator: CasingsGenerator): Name {
    if (typeof nameOrString === "string") {
        return casingsGenerator.generateName(nameOrString) as Name;
    }
    return nameOrString;
}

/**
 * Inflates an optional NameOrString to a Name or undefined.
 */
export function inflateOptionalNameOrString(
    nameOrString: NameOrString | undefined,
    casingsGenerator: CasingsGenerator
): Name | undefined {
    if (nameOrString == null) {
        return undefined;
    }
    return inflateNameOrString(nameOrString, casingsGenerator);
}

/**
 * Inflates a NameAndWireValue (where name may be a string) to one with a full Name.
 */
export function inflateNameAndWireValue(
    nwv: NameAndWireValue,
    casingsGenerator: CasingsGenerator
): NameAndWireValue & { name: Name } {
    return {
        ...nwv,
        name: inflateNameOrString(nwv.name, casingsGenerator)
    };
}

/**
 * Inflates a FernFilepath (where parts may be strings) to one with full Names.
 */
export function inflateFernFilepath(
    fp: FernFilepath,
    casingsGenerator: CasingsGenerator
): FernFilepath & { allParts: Name[]; packagePath: Name[]; file: Name | undefined } {
    return {
        allParts: fp.allParts.map((n) => inflateNameOrString(n, casingsGenerator)),
        packagePath: fp.packagePath.map((n) => inflateNameOrString(n, casingsGenerator)),
        file: inflateOptionalNameOrString(fp.file, casingsGenerator)
    };
}

// ---------------------------------------------------------------------------
// IR-level inflation
// ---------------------------------------------------------------------------

/**
 * Creates a CasingsGenerator configured from IR metadata fields.
 * The returned generator produces full Name objects with all casings.
 * Used by generators and migration code to inflate slim Names.
 */
export function createCasingsGeneratorForInflation(ir: {
    smartCasing?: boolean | undefined;
    generationLanguage?: string | undefined;
}): CasingsGenerator {
    return constructCasingsGenerator({
        generationLanguage: ir.generationLanguage as generatorsYml.GenerationLanguage | undefined,
        keywords: undefined,
        smartCasing: ir.smartCasing ?? false
    });
}

/**
 * Inflates all NameOrString fields in an IntermediateRepresentation.
 *
 * This visitor walks the IR object graph and visits every NameOrString field,
 * converting strings to full Name objects with all casings computed.
 * The detection is simple: `typeof value === "string"` for known NameOrString keys.
 *
 * Known NameOrString keys are derived from the IR YAML type definitions:
 * - apiName, name, requestParameterName, wrapperName, bodyKey
 * - token, username, password, clientId, clientSecret
 * - FernFilepath.allParts[], FernFilepath.packagePath[], FernFilepath.file
 *
 * Uses smartCasing and generationLanguage from the IR metadata to configure
 * the CasingsGenerator for correct casing computation.
 *
 * Used by:
 * - The v66->v65 migration (to restore full Names for older generators)
 * - CLI code that needs full Names after reading v66 IR
 * - Generators that adopt v66 IR (to inflate Names at deserialization time)
 */
export function inflateIrNames(
    ir: IntermediateRepresentation,
    opts?: {
        generationLanguage?: generatorsYml.GenerationLanguage;
        keywords?: string[];
        smartCasing?: boolean;
    }
): InflatedIR<IntermediateRepresentation> {
    const casingsGenerator = constructCasingsGenerator({
        generationLanguage:
            opts?.generationLanguage ??
            (ir.generationLanguage as generatorsYml.GenerationLanguage | undefined) ??
            undefined,
        keywords: opts?.keywords ?? undefined,
        smartCasing: opts?.smartCasing ?? ir.smartCasing ?? false
    });

    return deepInflateValue(ir, casingsGenerator) as InflatedIR<IntermediateRepresentation>;
}

// ---------------------------------------------------------------------------
// Deep walk -- visits every NameOrString field by key name
// ---------------------------------------------------------------------------

/**
 * Set of keys that hold NameOrString values (singular) in the IR type schema.
 * Derived from all NameOrString field declarations in the IR YAML definitions.
 */
const NAME_OR_STRING_KEYS = new Set([
    // IntermediateRepresentation.apiName
    "apiName",
    // NameAndWireValue.name, Subpackage.name, DeclaredTypeName.name, DeclaredErrorName.name,
    // PathParameter.name, InlinedRequestBody.name, FileUploadRequest.name,
    // InlinedWebhookPayload.name, InlinedWebSocketMessageBody.name,
    // SingleBaseUrlEnvironment.name, MultipleBaseUrlsEnvironment.name,
    // EnvironmentBaseUrlWithId.name, ServerVariable.name, VariableDeclaration.name,
    // NamedType.name, PropertyPathItem.name, ExamplePathParameter.name,
    // ProtobufService.name, UserDefinedProtobufType.name,
    // ExampleType.name, ExampleError.name, ExampleEndpointCall.name,
    // ExampleWebhookCall.name, ExampleWebSocketSession.name,
    // ExampleCodeSampleLanguage.name, ExampleCodeSampleSdk.name,
    // Declaration.name (dynamic)
    "name",
    // SdkRequest.requestParameterName
    "requestParameterName",
    // SdkRequestWrapper.wrapperName
    "wrapperName",
    // SdkRequestWrapper.bodyKey, ReferencedRequestBody.bodyKey (dynamic)
    "bodyKey",
    // BearerAuthScheme.token, BearerAuth.token (dynamic)
    "token",
    // BasicAuthScheme.username, BasicAuth.username (dynamic)
    "username",
    // BasicAuthScheme.password, BasicAuth.password (dynamic)
    "password",
    // OAuth.clientId (dynamic)
    "clientId",
    // OAuth.clientSecret (dynamic)
    "clientSecret"
]);

/**
 * Set of keys that hold NameOrString[] (arrays of NameOrString).
 * Only FernFilepath.allParts and FernFilepath.packagePath.
 */
const NAME_OR_STRING_ARRAY_KEYS = new Set(["allParts", "packagePath"]);

/**
 * Checks if a key holds a NameOrString value in the current context.
 */
function isNameOrStringKey(key: string, parentObj: Record<string, unknown>): boolean {
    if (key === "file" && "allParts" in parentObj && "packagePath" in parentObj) {
        // FernFilepath.file is NameOrString | undefined
        return true;
    }
    return NAME_OR_STRING_KEYS.has(key);
}

/**
 * Checks if a key holds a NameOrString[] array value.
 * Only applies to FernFilepath.allParts and FernFilepath.packagePath.
 */
function isNameOrStringArrayKey(key: string, parentObj: Record<string, unknown>): boolean {
    if (!NAME_OR_STRING_ARRAY_KEYS.has(key)) {
        return false;
    }
    // Verify parent is a FernFilepath-shaped object
    return "allParts" in parentObj && "packagePath" in parentObj;
}

/**
 * Walks the IR object graph and inflates every NameOrString field.
 *
 * For each object property:
 * - If the key is a known NameOrString key and the value is a string, inflate to Name
 * - If the key is a known NameOrString[] key and the value is an array, inflate each string element
 * - Otherwise, recurse into nested objects/arrays to find more NameOrString fields
 */
function deepInflateValue(value: unknown, cg: CasingsGenerator): unknown {
    if (value == null || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        let changed = false;
        const result = value.map((item) => {
            const inflated = deepInflateValue(item, cg);
            if (inflated !== item) {
                changed = true;
            }
            return inflated;
        });
        return changed ? result : value;
    }

    // Preserve Set/Map/Date instances
    if (value instanceof Set || value instanceof Map || value instanceof Date) {
        return value;
    }

    const obj = value as Record<string, unknown>;
    let changed = false;
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(obj)) {
        if (val == null) {
            result[key] = val;
            continue;
        }

        if (typeof val === "string" && isNameOrStringKey(key, obj)) {
            // This is a NameOrString field with a string value -- inflate it
            result[key] = inflateNameOrString(val, cg);
            changed = true;
        } else if (Array.isArray(val) && isNameOrStringArrayKey(key, obj)) {
            // This is a NameOrString[] field -- inflate each string element
            const inflatedArr = val.map((item) => {
                if (typeof item === "string") {
                    return inflateNameOrString(item, cg);
                }
                return deepInflateValue(item, cg);
            });
            result[key] = inflatedArr;
            changed = true;
        } else if (typeof val === "object") {
            const inflated = deepInflateValue(val, cg);
            if (inflated !== val) {
                changed = true;
            }
            result[key] = inflated;
        } else {
            result[key] = val;
        }
    }

    return changed ? result : value;
}
