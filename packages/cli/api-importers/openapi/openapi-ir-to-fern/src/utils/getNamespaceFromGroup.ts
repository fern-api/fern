import { EndpointSdkName, Namespace, Schema, SdkGroupName } from "@fern-api/openapi-ir";

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
    if (namespacedErrors && schema?.type === "reference" && schema.namespace != null) {
        return schema.namespace;
    }
    return endpointNamespace;
}
