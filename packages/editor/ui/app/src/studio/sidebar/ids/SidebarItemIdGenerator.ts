import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { SidebarItemId } from "./SidebarItemId";

export interface SidebarItemIdGenerator {
    readonly API_CONFIGURATION: SidebarItemId;
    readonly SDKs: SidebarItemId;
    readonly package: (packageId: FernApiEditor.PackageId) => SidebarItemId;
    readonly endpoints: (packageId: FernApiEditor.PackageId) => SidebarItemId;
    readonly endpoint: (endpointId: FernApiEditor.EndpointId) => SidebarItemId;
    readonly types: (packageId: FernApiEditor.PackageId) => SidebarItemId;
    readonly type: (typeId: FernApiEditor.TypeId) => SidebarItemId;
    readonly errors: (packageId: FernApiEditor.PackageId) => SidebarItemId;
    readonly error: (errorId: FernApiEditor.ErrorId) => SidebarItemId;
}

export const SidebarItemIdGenerator: SidebarItemIdGenerator = {
    API_CONFIGURATION: SidebarItemId.of("apiConfiguration"),
    SDKs: SidebarItemId.of("sdks"),
    package: (packageId) => SidebarItemId.of(`package.${packageId}`),
    endpoints: (packageId) => SidebarItemId.of(`${SidebarItemIdGenerator.package(packageId)}.endpoints`),
    endpoint: (endpointId) => SidebarItemId.of(`endpoint.${endpointId}`),
    types: (packageId) => SidebarItemId.of(`${SidebarItemIdGenerator.package(packageId)}.types`),
    type: (typeId) => SidebarItemId.of(`type.${typeId}`),
    errors: (packageId) => SidebarItemId.of(`${SidebarItemIdGenerator.package(packageId)}.errors`),
    error: (errorId) => SidebarItemId.of(`error.${errorId}`),
};
