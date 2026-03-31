import { constructFullCasingsGenerator, FullCasingsGenerator } from "@fern-api/casings-generator";
import { generatorsYml } from "@fern-api/configuration";
import { Name, NameAndWireValue, NameAndWireValueOrString, NameOrString, SafeAndUnsafeString } from "@fern-api/ir-sdk";

/**
 * Unified input type for CaseConverter methods.
 * Accepts any name-like value: a plain string, a full Name object, a NameAndWireValue
 * (where .name may itself be a string or full Name), or a compressed NameAndWireValueOrString string.
 */
export type NameInput = NameOrString | NameAndWireValueOrString;

/**
 * CaseConverter provides a unified interface for accessing casing variants of names
 * in the IR. It transparently handles all forms a name can take:
 *
 * - `string`: compressed NameOrString or NameAndWireValueOrString — needs casing computation
 * - `Name`: full object with all casing variants pre-computed
 * - `NameAndWireValue`: wireValue + name, where name may itself be a string or full Name
 *
 * Accessed as `ctx.case` in generator contexts:
 *   ctx.case.camelSafe(name)
 *   ctx.case.snakeSafe(name)
 */
export class CaseConverter {
    private readonly casingsGenerator: FullCasingsGenerator;

    constructor(opts: {
        generationLanguage: generatorsYml.GenerationLanguage | undefined;
        keywords: string[] | undefined;
        smartCasing: boolean;
    }) {
        this.casingsGenerator = constructFullCasingsGenerator(opts);
    }

    /**
     * Creates a CaseConverter for a known generation language.
     * Keywords are derived automatically from the language's reserved word list.
     * Use `smartCasing: true` for initialisms (e.g. HTTP → HTTP), `false` for standard casing.
     */
    static fromLanguage(language: generatorsYml.GenerationLanguage, smartCasing: boolean): CaseConverter {
        return new CaseConverter({ generationLanguage: language, keywords: undefined, smartCasing });
    }

    // --- Name resolution ---

    resolve(input: NameInput): Name {
        return this.casingsGenerator.generateName(input);
    }

    resolveNameOrString(nameOrString: NameOrString): Name {
        return this.casingsGenerator.generateName(nameOrString);
    }

    resolveNameAndWireValue(input: NameAndWireValueOrString): NameAndWireValue {
        return this.casingsGenerator.generateNameAndWireValue(input);
    }

    // --- camel ---

    camel(input: NameInput): SafeAndUnsafeString {
        return this.resolve(input).camelCase;
    }

    camelSafe(input: NameInput): string {
        return this.camel(input).safeName;
    }

    camelUnsafe(input: NameInput): string {
        return this.camel(input).unsafeName;
    }

    // --- pascal ---

    pascal(input: NameInput): SafeAndUnsafeString {
        return this.resolve(input).pascalCase;
    }

    pascalSafe(input: NameInput): string {
        return this.pascal(input).safeName;
    }

    pascalUnsafe(input: NameInput): string {
        return this.pascal(input).unsafeName;
    }

    // --- snake ---

    snake(input: NameInput): SafeAndUnsafeString {
        return this.resolve(input).snakeCase;
    }

    snakeSafe(input: NameInput): string {
        return this.snake(input).safeName;
    }

    snakeUnsafe(input: NameInput): string {
        return this.snake(input).unsafeName;
    }

    // --- screamingSnake ---

    screamingSnake(input: NameInput): SafeAndUnsafeString {
        return this.resolve(input).screamingSnakeCase;
    }

    screamingSnakeSafe(input: NameInput): string {
        return this.screamingSnake(input).safeName;
    }

    screamingSnakeUnsafe(input: NameInput): string {
        return this.screamingSnake(input).unsafeName;
    }
}

/**
 * Standalone helper to safely extract the wire value from a NameAndWireValueOrString.
 * Handles both compressed string form (V66+ IR) and full NameAndWireValue object form.
 */
export function getWireValue(input: NameAndWireValueOrString): string {
    if (typeof input === "string") {
        return input;
    }
    return input.wireValue;
}

/**
 * Standalone helper to safely extract the original name from any name-like input.
 * Handles all forms: compressed string (V66+ IR), full Name, and NameAndWireValue
 * (where the inner .name may itself be a string or full Name).
 */
export function getOriginalName(input: NameInput): string {
    if (typeof input === "string") {
        return input;
    }
    if (isNameAndWireValue(input)) {
        return getOriginalName(input.name);
    }
    return input.originalName;
}

/**
 * Type guard to distinguish NameAndWireValue from Name.
 * NameAndWireValue has { wireValue: string, name: NameOrString }
 * Name has { originalName: string, camelCase: ..., ... }
 */
function isNameAndWireValue(value: Name | NameAndWireValue): value is NameAndWireValue {
    return "wireValue" in value;
}
