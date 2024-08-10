import { APIConfigurationSchema } from "./schemas/APIConfigurationSchema";
import { ProtobufAPIDefinitionSchema } from "./schemas/apis/ProtobufDefinitionSchema";

export function isRawProtobufAPIDefinitionSchema(
    rawApiConfiguration: APIConfigurationSchema
): rawApiConfiguration is ProtobufAPIDefinitionSchema {
    return typeof rawApiConfiguration !== "string" && "proto" in rawApiConfiguration;
}
