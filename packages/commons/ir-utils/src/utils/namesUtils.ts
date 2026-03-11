import { constructFullCasingsGenerator } from "@fern-api/casings-generator";
import { Name, NameAndWireValue, NameAndWireValueOrString, NameOrString } from "@fern-api/ir-sdk";

/**
 * A unified input type that accepts any name-like value:
 * - string (compressed NameOrString or NameAndWireValueOrString)
 * - Name (full casing object)
 * - NameAndWireValue (wireValue + name pair)
 */
export type NameInput = NameOrString | NameAndWireValueOrString;

function isNameAndWireValue(value: Name | NameAndWireValue): value is NameAndWireValue {
    return "wireValue" in value;
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
 * Ensure a NameAndWireValueOrString is a full NameAndWireValue object.
 * If the value is a string, creates a NameAndWireValue with both wireValue and name set to the string.
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

// Lazy-initialized default casings generator for fallback casing computation.
// Used only when a NameOrString is a plain string and we need to compute casings.
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

/**
 * Get the PascalCase safe name from any name-like input.
 * Same as getPascalCaseUnsafe but returns the safe (keyword-escaped) variant.
 */
export function getPascalCaseSafe(input: NameInput): string {
    const name = extractNameOrString(input);
    if (typeof name === "string") {
        return getDefaultCasingsGenerator().generateName(name).pascalCase.safeName;
    }
    return name.pascalCase.safeName;
}

/**
 * Get the snakeCase safe name from any name-like input.
 * Same as getSnakeCaseUnsafe but returns the safe (keyword-escaped) variant.
 */
export function getSnakeCaseSafe(input: NameInput): string {
    const name = extractNameOrString(input);
    if (typeof name === "string") {
        return getDefaultCasingsGenerator().generateName(name).snakeCase.safeName;
    }
    return name.snakeCase.safeName;
}

/**
 * Get the camelCase safe name from any name-like input.
 * Same as getCamelCaseUnsafe but returns the safe (keyword-escaped) variant.
 */
export function getCamelCaseSafe(input: NameInput): string {
    const name = extractNameOrString(input);
    if (typeof name === "string") {
        return getDefaultCasingsGenerator().generateName(name).camelCase.safeName;
    }
    return name.camelCase.safeName;
}
