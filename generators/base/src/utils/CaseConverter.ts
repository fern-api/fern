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
 * This class replaces direct property access patterns like `name.camelCase.safeName`
 * with method calls like `caseConverter.camelCaseSafe(name)`.
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

    // --- Name resolution ---

    /**
     * Resolves any NameInput to a full Name object.
     * - string: generates Name via casings generator
     * - Name: returns as-is
     * - NameAndWireValue: extracts and resolves the inner name
     */
    resolveName(input: NameInput): Name {
        return this.casingsGenerator.generateName(input);
    }

    resolveNameOrString(nameOrString: NameOrString): Name {
        return this.casingsGenerator.generateName(nameOrString);
    }

    resolveNameAndWireValue(input: NameAndWireValueOrString): NameAndWireValue {
        return this.casingsGenerator.generateNameAndWireValue(input);
    }

    // --- Original name ---

    originalName(input: NameInput): string {
        if (typeof input === "string") {
            return input;
        }
        if (isNameAndWireValue(input)) {
            return this.originalNameFromNameOrString(input.name);
        }
        return input.originalName;
    }

    originalNameFromNameOrString(nameOrString: NameOrString): string {
        if (typeof nameOrString === "string") {
            return nameOrString;
        }
        return nameOrString.originalName;
    }

    // --- Wire value ---

    wireValue(input: NameAndWireValueOrString): string {
        if (typeof input === "string") {
            return input;
        }
        return input.wireValue;
    }

    // --- camelCase ---

    camelCase(input: NameInput): SafeAndUnsafeString {
        return this.resolveName(input).camelCase;
    }

    camelCaseSafe(input: NameInput): string {
        return this.camelCase(input).safeName;
    }

    camelCaseUnsafe(input: NameInput): string {
        return this.camelCase(input).unsafeName;
    }

    // --- PascalCase ---

    pascalCase(input: NameInput): SafeAndUnsafeString {
        return this.resolveName(input).pascalCase;
    }

    pascalCaseSafe(input: NameInput): string {
        return this.pascalCase(input).safeName;
    }

    pascalCaseUnsafe(input: NameInput): string {
        return this.pascalCase(input).unsafeName;
    }

    // --- snake_case ---

    snakeCase(input: NameInput): SafeAndUnsafeString {
        return this.resolveName(input).snakeCase;
    }

    snakeCaseSafe(input: NameInput): string {
        return this.snakeCase(input).safeName;
    }

    snakeCaseUnsafe(input: NameInput): string {
        return this.snakeCase(input).unsafeName;
    }

    // --- SCREAMING_SNAKE_CASE ---

    screamingSnakeCase(input: NameInput): SafeAndUnsafeString {
        return this.resolveName(input).screamingSnakeCase;
    }

    screamingSnakeCaseSafe(input: NameInput): string {
        return this.screamingSnakeCase(input).safeName;
    }

    screamingSnakeCaseUnsafe(input: NameInput): string {
        return this.screamingSnakeCase(input).unsafeName;
    }
}

/**
 * Type guard to distinguish NameAndWireValue from Name.
 * NameAndWireValue has { wireValue: string, name: NameOrString }
 * Name has { originalName: string, camelCase: ..., ... }
 */
function isNameAndWireValue(value: Name | NameAndWireValue): value is NameAndWireValue {
    return "wireValue" in value;
}
