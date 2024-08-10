import { APIConfigurationSchema } from "./schemas/APIConfigurationSchema";
import { FernDefinitionSchema } from "./schemas/apis/FernDefinitionSchema";

export function isRawFernAPIDefinitionSchema(
    rawApiConfiguration: APIConfigurationSchema
): rawApiConfiguration is FernDefinitionSchema {
    return typeof rawApiConfiguration !== "string" && "fern" in rawApiConfiguration;
}
