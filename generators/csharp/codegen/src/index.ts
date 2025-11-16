export * as ast from "./ast";
export { convertReadOnlyPrimitiveTypes } from "./ast";
export { Writer } from "./ast/core/Writer";
export {
    type MinimalGeneratorConfig,
    type Support,
    type TAbsoluteFilePath,
    type TRelativeFilePath
} from "./context/common";
export { Generation } from "./context/generation-info";
export { NameRegistry } from "./context/name-registry";
export { CSharp } from "./csharp";
export { CsharpConfigSchema } from "./custom-config";
export { escapeForCSharpString } from "./utils/escapeForCSharpString";
export { lazy } from "./utils/lazy";
export * as text from "./utils/text";
export { camelCase } from "./utils/text";
export { type TypesOf } from "./utils/type-extractor";
export { is } from "./utils/type-guards";
export { WithGeneration } from "./with-generation";
