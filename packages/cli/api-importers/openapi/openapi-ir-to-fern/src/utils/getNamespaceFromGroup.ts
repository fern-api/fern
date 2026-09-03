import { EndpointSdkName, Namespace, ReferencedSchema, Schema, SdkGroupName } from "@fern-api/openapi-ir";

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
 * The namespace an error is declared in and shared within. Defaults to the endpoint's namespace.
 * With `namespacedErrors` enabled, an error body schema carrying `x-fern-sdk-namespace` takes precedence,
 * so errors can be scoped per namespace while the endpoint itself stays at the root.
 */
export function getErrorNamespace({
    endpointNamespace,
    schema,
    namespacedErrors
}: {
    endpointNamespace: string | undefined;
    schema: Schema | undefined;
    namespacedErrors: boolean;
}): string | undefined {
    if (namespacedErrors) {
        const referenced = unwrapReferencedSchema(schema);
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
