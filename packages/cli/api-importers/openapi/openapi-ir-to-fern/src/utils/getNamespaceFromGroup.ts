import { EndpointSdkName, HttpError, Namespace, ReferencedSchema, Schema, SdkGroupName } from "@fern-api/openapi-ir";

export function getNamespaceFromGroup(groupName: SdkGroupName): string | undefined {
    return groupName.find((group): group is Namespace => typeof group !== "string" && group.type === "namespace")?.name;
}

export function getEndpointNamespace(
    sdkName: EndpointSdkName | undefined,
    namespaceOverride: string | undefined
): string | undefined {
    return namespaceOverride != null
        ? namespaceOverride
        : sdkName?.groupName != null
          ? getNamespaceFromGroup(sdkName.groupName)
          : undefined;
}

/**
 * Namespace an error is declared in and shared within. With `namespacedErrors`, a namespace on the
 * response object (`x-fern-sdk-namespace` on `components.responses[...]`) wins, then one on the
 * (possibly nullable/optional) referenced body schema; otherwise the endpoint's namespace.
 */
export function getErrorNamespace({
    endpointNamespace,
    error,
    namespacedErrors
}: {
    endpointNamespace: string | undefined;
    error: HttpError;
    namespacedErrors: boolean;
}): string | undefined {
    if (namespacedErrors) {
        if (error.namespace != null) {
            return error.namespace;
        }
        const referenced = unwrapReferencedSchema(error.schema);
        if (referenced?.namespace != null) {
            return referenced.namespace;
        }
    }
    return endpointNamespace;
}

function unwrapReferencedSchema(schema: Schema | undefined): ReferencedSchema | undefined {
    if (schema == null) {
        return undefined;
    }
    switch (schema.type) {
        case "reference":
            return schema;
        case "nullable":
        case "optional":
            return unwrapReferencedSchema(schema.value);
        default:
            return undefined;
    }
}
