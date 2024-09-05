import { APIConfigurationSchema, APIConfigurationV2Schema } from "../APIConfigurationSchema";

export function isApiConfigurationV2Schema(api: APIConfigurationSchema): api is APIConfigurationV2Schema {
    return (api as APIConfigurationV2Schema)?.specs != null;
}
