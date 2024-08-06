import { APIConfigurationSchema, ProtobufAPIDefinitionSchema } from "./schemas/APIConfigurationSchema";

export function isRawProtobufAPIDefinitionSchema(
    rawApiConfiguration: APIConfigurationSchema
): rawApiConfiguration is ProtobufAPIDefinitionSchema {
    return typeof rawApiConfiguration !== "string" && "proto" in rawApiConfiguration;
}
