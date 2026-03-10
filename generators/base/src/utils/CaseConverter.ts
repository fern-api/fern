import { constructCasingsGenerator, CasingsGenerator } from "@fern-api/casings-generator";
import { generatorsYml } from "@fern-api/configuration";
import {
    Name,
    NameAndWireValue,
    NameAndWireValueOrString,
    NameOrString,
    SafeAndUnsafeString
} from "@fern-api/ir-sdk";

/**
 * Unified input type for CaseConverter methods.
 * Accepts a plain string (originalName), a full Name object, or a NameAndWireValue object.
 */
export type NameInput = string | Name | NameAndWireValue;

/**
 * CaseConverter provides a unified interface for accessing casing variants of names
 * in the IR. It transparently handles all three forms that a name can take:
 *
 * - `string`: just the originalName, needs casing computation
 * - `Name`: full object with all casing variants pre-computed
 * - `NameAndWireValue`: has wireValue + name (which itself may be string or Name)
 *
 * This class replaces direct property access patterns like `name.camelCase.safeName`
 * with method calls like `caseConverter.camelCaseSafe(name)`.
 */
export class CaseConverter {
    private readonly casingsGenerator: CasingsGenerator;

    constructor(opts: {
        generationLanguage: generatorsYml.GenerationLanguage | undefined;
        keywords: string[] | undefined;
        smartCasing: boolean;
    }) {
        this.casingsGenerator = constructCasingsGenerator(opts);
    }

    // --- Name resolution ---

    /**
     * Resolves any NameInput to a full Name object.
     * - string: generates Name via casings generator
     * - Name: returns as-is
     * - NameAndWireValue: extracts and resolves the inner name
     */
    resolveName(input: NameInput): Name {
        if (typeof input === "string") {
            return this.casingsGenerator.generateName(input);
        }
        if (isNameAndWireValue(input)) {
            return this.resolveNameOrString(input.name);
        }
        return input;
    }

    /**
     * Resolves a NameOrString to a full Name object.
     * - string: generates Name via casings generator
     * - Name: returns as-is
     */
    resolveNameOrString(nameOrString: NameOrString): Name {
        if (typeof nameOrString === "string") {
            return this.casingsGenerator.generateName(nameOrString);
        }
        return nameOrString;
    }

    /**
     * Resolves a NameAndWireValueOrString to a full NameAndWireValue object.
     * - string: wireValue and originalName are both the string
     * - NameAndWireValue: returns with name resolved
     */
    resolveNameAndWireValue(input: NameAndWireValueOrString): NameAndWireValue {
        if (typeof input === "string") {
            return {
                wireValue: input,
                name: this.casingsGenerator.generateName(input)
            };
        }
        return {
            wireValue: input.wireValue,
            name: this.resolveNameOrString(input.name)
        };
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

    wireValue(input: NameAndWireValue | NameAndWireValueOrString): string {
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
