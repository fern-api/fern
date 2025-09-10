export * as dependencies from "./ast/dependencies";
export { AbstractCsharpGeneratorContext } from "./context/AbstractCsharpGeneratorContext";
export * as csharp from "./csharp";
export { convertReadOnlyPrimitiveTypes, System, VALID_READ_ONLY_MEMORY_TYPES } from "./csharp";
export { BaseCsharpCustomConfigSchema, validateReadOnlyMemoryTypes } from "./custom-config";
export { type GrpcClientInfo } from "./grpc/GrpcClientInfo";
export { precalculate } from "./project/precalculate";
export { CsharpProtobufTypeMapper } from "./proto/CsharpProtobufTypeMapper";
export * from "./proto/constants";
export { escapeForCSharpString } from "./utils/escapeForCSharpString";
export {
    type GeneratorState,
    loadGeneratorState,
    restoreGeneratorState,
    saveGeneratorState
} from "./utils/generatorState";
export { NameRegistry, nameRegistry } from "./utils/nameRegistry";
