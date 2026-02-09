export { Writer } from "./ast/core/Writer.js";
export * as ast from "./ast/index.js";
export { convertReadOnlyPrimitiveTypes } from "./ast/index.js";
export {
    type MinimalGeneratorConfig,
    type Support,
    type TAbsoluteFilePath,
    type TRelativeFilePath
} from "./context/common.js";
export { Generation } from "./context/generation-info.js";
export * from "./context/index.js";
export { NameRegistry } from "./context/name-registry.js";
export { CSharp } from "./csharp.js";
export { CsharpConfigSchema } from "./custom-config/index.js";
export { escapeForCSharpString } from "./utils/escapeForCSharpString.js";
export { lazy } from "./utils/lazy.js";
export * as text from "./utils/text.js";
export { camelCase } from "./utils/text.js";
export { type TypesOf } from "./utils/type-extractor.js";
export { is } from "./utils/type-guards.js";
export { WithGeneration } from "./with-generation.js";
