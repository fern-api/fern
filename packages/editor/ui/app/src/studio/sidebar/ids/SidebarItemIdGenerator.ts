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
    API_CONFIGURATION: "apiConfiguration" as SidebarItemId,
    SDKs: "sdks" as SidebarItemId,
    package: (packageId) => `package:${packageId}` as SidebarItemId,
    endpoints: (packageId) => `${SidebarItemIdGenerator.package(packageId)}:endpoints` as SidebarItemId,
    endpoint: (endpointId) => `endpoint:${endpointId}` as SidebarItemId,
    types: (packageId) => `${SidebarItemIdGenerator.package(packageId)}:types` as SidebarItemId,
    type: (typeId) => `type:${typeId}` as SidebarItemId,
    errors: (packageId) => `${SidebarItemIdGenerator.package(packageId)}:errors` as SidebarItemId,
    error: (errorId) => `error:${errorId}` as SidebarItemId,
};
