export * as dependencies from "./ast/dependencies";
export * as csharp from "./csharp";
export { convertReadOnlyPrimitiveTypes, VALID_READ_ONLY_MEMORY_TYPES } from "./csharp";
export { BaseCsharpCustomConfigSchema, validateReadOnlyMemoryTypes } from "./custom-config";
export { allNamespacesOf, canonicalizeNamespace, isKnownIdentifier } from "./utils/canonicalization";
export { escapeForCSharpString } from "./utils/escapeForCSharpString";
export {
    type GeneratorState,
    loadGeneratorState,
    restoreGeneratorState,
    saveGeneratorState
} from "./utils/generatorState";
