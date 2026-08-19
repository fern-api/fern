import { CaseConverter } from "@fern-api/base-generator";

/**
 * TypeScript-aware CaseConverter for use throughout the TypeScript SDK generator.
 *
 * Constructed with generationLanguage="typescript" so that *Safe casing variants
 * correctly escape TypeScript reserved keywords (e.g. "string" → "string_", "class" → "class_").
 *
 * Generators receive fully-inflated V65 IR (via the V66→V65 migration), so Name objects
 * already have all casing variants pre-computed with the correct settings. This converter
 * is used for forward-compatibility — handling any compressed string form that may arrive
 * in a future IR version that the generator consumes natively.
 *
 * smartCasing is false to match the production default used when generating IR.
 *
 * Import this singleton anywhere in the generator:
 *
 *   import { caseConverter } from "@fern-typescript/test-utils";
 *   caseConverter.camelCaseSafe(name)       // "string" → "string_"
 *   caseConverter.pascalCaseUnsafe(name)    // raw PascalCase, no keyword escaping
 */
export const caseConverter = new CaseConverter({
    generationLanguage: "typescript",
    keywords: undefined,
    smartCasing: false
});
