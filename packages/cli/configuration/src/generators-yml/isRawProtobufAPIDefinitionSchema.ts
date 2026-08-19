import { ApiConfigurationSchema, ProtobufApiDefinitionSchema } from "./schemas/index.js";

export function isRawProtobufAPIDefinitionSchema(
    rawApiConfiguration: ApiConfigurationSchema
): rawApiConfiguration is ProtobufApiDefinitionSchema {
    return typeof rawApiConfiguration !== "string" && "proto" in rawApiConfiguration;
}
