import { EndpointSdkName, HttpError, Namespace, SdkGroupName } from "@fern-api/openapi-ir";

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
 * Namespace an error is declared in and shared within. An explicit namespace on the error's response
 * object (`x-fern-sdk-namespace` on `components.responses[...]`, honored only when that spec sets
 * `namespaced-errors`) wins; otherwise the endpoint's namespace.
 */
export function getErrorNamespace({
    endpointNamespace,
    error
}: {
    endpointNamespace: string | undefined;
    error: HttpError;
}): string | undefined {
    return error.namespace ?? endpointNamespace;
}
