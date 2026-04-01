import { constructFullCasingsGenerator, FullCasingsGenerator } from "@fern-api/casings-generator";
import { generatorsYml } from "@fern-api/configuration";
import { Name, NameAndWireValue, NameAndWireValueOrString, NameOrString, SafeAndUnsafeString } from "@fern-api/ir-sdk";

export { getOriginalName, getWireValue } from "./NameHelpers.js";

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

    public constructor(opts: {
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
    public static fromLanguage(language: generatorsYml.GenerationLanguage, smartCasing: boolean): CaseConverter {
        return new CaseConverter({ generationLanguage: language, keywords: undefined, smartCasing });
    }

    // --- Name resolution ---

    public resolve(input: NameInput): Name {
        return this.casingsGenerator.generateName(input);
    }

    public resolveNameOrString(nameOrString: NameOrString): Name {
        return this.casingsGenerator.generateName(nameOrString);
    }

    public resolveNameAndWireValue(input: NameAndWireValueOrString): NameAndWireValue {
        return this.casingsGenerator.generateNameAndWireValue(input);
    }

    // --- camel ---

    public camel(input: NameInput): SafeAndUnsafeString {
        return this.resolve(input).camelCase;
    }

    public camelSafe(input: NameInput): string {
        return this.camel(input).safeName;
    }

    public camelUnsafe(input: NameInput): string {
        return this.camel(input).unsafeName;
    }

    // --- pascal ---

    public pascal(input: NameInput): SafeAndUnsafeString {
        return this.resolve(input).pascalCase;
    }

    public pascalSafe(input: NameInput): string {
        return this.pascal(input).safeName;
    }

    public pascalUnsafe(input: NameInput): string {
        return this.pascal(input).unsafeName;
    }

    // --- snake ---

    public snake(input: NameInput): SafeAndUnsafeString {
        return this.resolve(input).snakeCase;
    }

    public snakeSafe(input: NameInput): string {
        return this.snake(input).safeName;
    }

    public snakeUnsafe(input: NameInput): string {
        return this.snake(input).unsafeName;
    }

    // --- screamingSnake ---

    public screamingSnake(input: NameInput): SafeAndUnsafeString {
        return this.resolve(input).screamingSnakeCase;
    }

    public screamingSnakeSafe(input: NameInput): string {
        return this.screamingSnake(input).safeName;
    }

    public screamingSnakeUnsafe(input: NameInput): string {
        return this.screamingSnake(input).unsafeName;
    }
}
