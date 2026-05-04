export {
    API_ORIGIN_LOCATION_KEY,
    API_SETTINGS_KEY,
    ASYNC_API_LOCATION_KEY,
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    DEFAULT_GROUP_NAME,
    OPENAPI_LOCATION_KEY,
    OPENAPI_OVERRIDES_LOCATION_KEY
} from "../constants.js";
export {
    type APIDefinition,
    type APIDefinitionLocation,
    type APIDefinitionSettings,
    GenerationLanguage,
    type GeneratorGroup,
    type GeneratorInvocation,
    type GeneratorsConfiguration,
    getPackageName,
    type ProtoAPIDefinitionSchema,
    type ResolvedAutomationConfig,
    type SingleNamespaceAPIDefinition
} from "./GeneratorsConfiguration.js";
export { isRawProtobufAPIDefinitionSchema } from "./isRawProtobufAPIDefinitionSchema.js";
export { resolveAutomationConfig } from "./resolveAutomationConfig.js";
export * from "./schemas/index.js";
export * from "./utils/index.js";
