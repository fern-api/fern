import { Namespace, SdkGroupName, EndpointSdkName } from "@fern-api/openapi-ir-sdk";

export function getNamespaceFromGroup(groupName: SdkGroupName): string | undefined {
    return groupName.find((group): group is Namespace => typeof group != "string" && group.type == "namespace")?.name;
}

export function getEndpointNamespace(sdkName: EndpointSdkName | undefined): string | undefined {
    return sdkName?.groupName != null ? getNamespaceFromGroup(sdkName.groupName) : undefined;
}
