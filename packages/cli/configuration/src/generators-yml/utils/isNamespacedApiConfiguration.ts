import { ApiConfigurationSchemaInternal, NamespacedApiConfigurationSchema } from "../schemas";

export function isNamespacedApiConfiguration(
    api: ApiConfigurationSchemaInternal | NamespacedApiConfigurationSchema
): api is NamespacedApiConfigurationSchema {
    return (api as NamespacedApiConfigurationSchema)?.namespaces != null;
}
