import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import {
    ApiConfigurationSidebarItemId,
    EndpointSidebarItemId,
    ErrorsGroupSidebarItemId,
    ErrorSidebarItemId,
    PackageSidebarItemId,
    SdkConfigurationSidebarItemId,
    TypesGroupSidebarItemId,
    TypeSidebarItemId,
} from "./SidebarItemId";

export interface SidebarItemIdGenerator {
    readonly API_CONFIGURATION: ApiConfigurationSidebarItemId;
    readonly SDKs: SdkConfigurationSidebarItemId;
    readonly package: (package_: FernApiEditor.Package) => PackageSidebarItemId;
    readonly endpoint: (endpoint: FernApiEditor.Endpoint) => EndpointSidebarItemId;
    readonly type: (type: FernApiEditor.Type) => TypeSidebarItemId;
    readonly error: (error: FernApiEditor.Error) => ErrorSidebarItemId;
    readonly types: (package_: FernApiEditor.Package) => TypesGroupSidebarItemId;
    readonly errors: (package_: FernApiEditor.Package) => ErrorsGroupSidebarItemId;
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
