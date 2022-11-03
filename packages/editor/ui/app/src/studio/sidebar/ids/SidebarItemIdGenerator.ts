import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { SidebarItemId } from "./SidebarItemId";

export interface SidebarItemIdGenerator {
    readonly API_CONFIGURATION: SidebarItemId;
    readonly SDKs: SidebarItemId;
    readonly package: (package_: FernApiEditor.Package) => SidebarItemId;
    readonly endpoint: (endpoint: FernApiEditor.Endpoint) => SidebarItemId;
    readonly type: (type: FernApiEditor.Type) => SidebarItemId;
    readonly error: (error: FernApiEditor.Error) => SidebarItemId;
    readonly types: (package_: FernApiEditor.Package) => SidebarItemId;
    readonly errors: (package_: FernApiEditor.Package) => SidebarItemId;
}

export const SidebarItemIdGenerator: SidebarItemIdGenerator = {
    API_CONFIGURATION: { type: "apiConfiguration" },
    SDKs: { type: "sdkConfiguration" },
    package: (package_) => ({ type: "package", packageName: package_.packageName, packageId: package_.packageId }),
    endpoint: (endpoint) => ({
        type: "endpoint",
        endpointName: endpoint.endpointName,
        endpointId: endpoint.endpointId,
    }),
    type: (type) => ({ type: "type", typeName: type.typeName, typeId: type.typeId }),
    error: (error) => ({ type: "error", errorName: error.errorName, errorId: error.errorId }),
    types: (package_) => ({ type: "typesGroup", packageName: package_.packageName, packageId: package_.packageId }),
    errors: (package_) => ({ type: "errorsGroup", packageName: package_.packageName, packageId: package_.packageId }),
};
