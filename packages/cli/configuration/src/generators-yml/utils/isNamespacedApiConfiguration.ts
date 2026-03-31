import { ApiConfigurationSchemaInternal, NamespacedApiConfigurationSchema } from "../schemas/index.js";

export function isNamespacedApiConfiguration(
    api: ApiConfigurationSchemaInternal | NamespacedApiConfigurationSchema
): api is NamespacedApiConfigurationSchema {
    return (api as NamespacedApiConfigurationSchema)?.namespaces != null;
}
