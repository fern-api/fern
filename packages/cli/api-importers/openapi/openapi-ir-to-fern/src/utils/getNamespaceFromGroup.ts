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
 * The namespace an error is declared in and shared within. Defaults to the endpoint's namespace;
 * for un-namespaced endpoints, an error body schema carrying `x-fern-sdk-namespace` scopes the error instead.
 */
export function getErrorNamespace({
    endpointNamespace,
    schema
}: {
    endpointNamespace: string | undefined;
    schema: Schema | undefined;
}): string | undefined {
    if (endpointNamespace != null) {
        return endpointNamespace;
    }
    return schema?.type === "reference" ? schema.namespace : undefined;
}
