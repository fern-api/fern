import { Namespace, SdkGroupName, EndpointSdkName } from "@fern-api/openapi-ir-sdk";

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
