import { APIConfigurationSchema, ProtobufAPIDefinitionSchema } from "./schemas";

export function isRawProtobufAPIDefinitionSchema(
    rawApiConfiguration: APIConfigurationSchema
): rawApiConfiguration is ProtobufAPIDefinitionSchema {
    return typeof rawApiConfiguration !== "string" && "proto" in rawApiConfiguration;
}
