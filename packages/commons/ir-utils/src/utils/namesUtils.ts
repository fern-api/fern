import { constructFullCasingsGenerator } from "@fern-api/casings-generator";
import { Name, NameAndWireValue, NameAndWireValueOrString, NameOrString } from "@fern-api/ir-sdk";

/**
 * A unified input type that accepts any name-like value:
 * - string (compressed NameOrString or NameAndWireValueOrString)
 * - Name (full casing object)
 * - NameAndWireValue (wireValue + name pair, where name may itself be a string or a full Name)
 */
export type NameInput = NameOrString | NameAndWireValueOrString;

function isNameAndWireValue(value: Name | NameAndWireValue): value is NameAndWireValue {
    return "wireValue" in value && !("originalName" in value);
}

function extractNameOrString(input: NameInput): NameOrString {
    if (typeof input === "string") {
        return input;
    }
    if (isNameAndWireValue(input)) {
        return input.name;
    }
    return input;
}

/**
 * Extract the original name from any name-like input.
 * If the value is a string, it IS the original name.
 * If it's a Name object, extract .originalName.
 * If it's a NameAndWireValue, extract the inner name first.
 */
export function getOriginalName(input: NameInput): string {
    const name = extractNameOrString(input);
    return typeof name === "string" ? name : name.originalName;
}

/**
 * Extract the wire value from a NameAndWireValueOrString value.
 * If the value is a string, it IS the wire value (and the original name).
 * If it's a NameAndWireValue object, extract .wireValue.
 */
export function getWireValue(nameAndWireValue: NameAndWireValueOrString): string {
    return typeof nameAndWireValue === "string" ? nameAndWireValue : nameAndWireValue.wireValue;
}

/**
 * Extract the Name from a NameAndWireValueOrString value.
 * If the value is a string, returns the string (which is a valid NameOrString).
 * If it's a NameAndWireValue object, returns the .name field.
 */
export function getNameFromWireValue(nameAndWireValue: NameAndWireValueOrString): NameOrString {
    return typeof nameAndWireValue === "string" ? nameAndWireValue : nameAndWireValue.name;
}

/**
 * Coerce a NameAndWireValueOrString into a NameAndWireValue struct.
 * If the value is a string, creates { wireValue: s, name: s } (both fields are the same compressed string).
 * If the value is already a NameAndWireValue, returns it as-is.
 * Note: the returned .name may still be a string (NameOrString), not a full Name object.
 * Callers that need fully inflated casing variants should use CaseConverter or the V66→V65 migration.
 */
export function ensureNameAndWireValue(nameAndWireValue: NameAndWireValueOrString): NameAndWireValue {
    if (typeof nameAndWireValue === "string") {
        return { wireValue: nameAndWireValue, name: nameAndWireValue };
    }
    return nameAndWireValue;
}

/**
 * Get the snakeCase unsafe name from any name-like input.
 * Accepts NameOrString, NameAndWireValueOrString, or any combination.
 * If given a NameAndWireValue, extracts the inner name first.
 * If the value is a string, computes casing via the casings generator.
 * If it's a Name object, returns the pre-computed snakeCase.unsafeName.
 */
export function getSnakeCaseUnsafe(input: NameInput): string {
    const name = extractNameOrString(input);
    if (typeof name === "string") {
        return getDefaultCasingsGenerator().generateName(name).snakeCase.unsafeName;
    }
    return name.snakeCase.unsafeName;
}

// Lazy-initialized language-agnostic casings generator.
// Used only for the *Unsafe helpers, which are called from CLI-internal code (docs resolver, OpenAPI export)
// that operates on language-agnostic IR. Generators should use CaseConverter from @fern-api/base-generator
// instead, constructed with their own language and keywords, to get language-safe casing.
let _defaultCasingsGenerator: ReturnType<typeof constructFullCasingsGenerator> | undefined;
function getDefaultCasingsGenerator(): ReturnType<typeof constructFullCasingsGenerator> {
    if (_defaultCasingsGenerator == null) {
        _defaultCasingsGenerator = constructFullCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: true
        });
    }
    return _defaultCasingsGenerator;
}

/**
 * Get the camelCase unsafe name from any name-like input.
 * Accepts NameOrString, NameAndWireValueOrString, or any combination.
 * If given a NameAndWireValue, extracts the inner name first.
 * If the value is a string, computes casing via the casings generator.
 * If it's a Name object, returns the pre-computed camelCase.unsafeName.
 */
export function getCamelCaseUnsafe(input: NameInput): string {
    const name = extractNameOrString(input);
    if (typeof name === "string") {
        return getDefaultCasingsGenerator().generateName(name).camelCase.unsafeName;
    }
    return name.camelCase.unsafeName;
}

/**
 * Get the PascalCase unsafe name from any name-like input.
 * Accepts NameOrString, NameAndWireValueOrString, or any combination.
 * If given a NameAndWireValue, extracts the inner name first.
 * If the value is a string, computes casing via the casings generator.
 * If it's a Name object, returns the pre-computed pascalCase.unsafeName.
 */
export function getPascalCaseUnsafe(input: NameInput): string {
    const name = extractNameOrString(input);
    if (typeof name === "string") {
        return getDefaultCasingsGenerator().generateName(name).pascalCase.unsafeName;
    }
    return name.pascalCase.unsafeName;
}
