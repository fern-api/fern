import { ApiConfigurationSchema, ApiConfigurationV2Schema } from "../schemas";

export function isApiConfigurationV2Schema(api: ApiConfigurationSchema): api is ApiConfigurationV2Schema {
    return (api as ApiConfigurationV2Schema)?.specs != null;
}
