import { ApiConfigurationSchema, ProtobufApiDefinitionSchema } from "./schemas";

export function isRawProtobufAPIDefinitionSchema(
    rawApiConfiguration: ApiConfigurationSchema
): rawApiConfiguration is ProtobufApiDefinitionSchema {
    return typeof rawApiConfiguration !== "string" && "proto" in rawApiConfiguration;
}
