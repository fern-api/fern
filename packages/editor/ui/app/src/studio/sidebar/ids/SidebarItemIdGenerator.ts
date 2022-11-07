import { MaybeDraftEndpoint, MaybeDraftError, MaybeDraftPackage, MaybeDraftType } from "../drafts/DraftableItem";
import { SidebarItemId } from "./SidebarItemId";

export interface SidebarItemIdGenerator {
    readonly API_CONFIGURATION: SidebarItemId;
    readonly SDKs: SidebarItemId;
    readonly package: (package_: MaybeDraftPackage) => SidebarItemId;
    readonly endpoint: (endpoint: MaybeDraftEndpoint) => SidebarItemId;
    readonly type: (type: MaybeDraftType) => SidebarItemId;
    readonly error: (error: MaybeDraftError) => SidebarItemId;
    readonly types: (package_: MaybeDraftPackage) => SidebarItemId;
    readonly errors: (package_: MaybeDraftPackage) => SidebarItemId;
}

export const SidebarItemIdGenerator: SidebarItemIdGenerator = {
    API_CONFIGURATION: { type: "apiConfiguration" },
    SDKs: { type: "sdkConfiguration" },
    package: (package_) => ({
        type: "package",
        packageName: package_.isDraft ? undefined : package_.packageName,
        packageId: package_.packageId,
    }),
    endpoint: (endpoint) => ({
        type: "endpoint",
        endpointName: endpoint.isDraft ? undefined : endpoint.endpointName,
        endpointId: endpoint.endpointId,
    }),
    type: (type) => ({
        type: "type",
        typeName: type.isDraft ? undefined : type.typeName,
        typeId: type.typeId,
    }),
    error: (error) => ({
        type: "error",
        errorName: error.isDraft ? undefined : error.errorName,
        errorId: error.errorId,
    }),
    types: (package_) => ({
        type: "typesGroup",
        packageName: package_.isDraft ? undefined : package_.packageName,
        packageId: package_.packageId,
    }),
    errors: (package_) => ({
        type: "errorsGroup",
        packageName: package_.isDraft ? undefined : package_.packageName,
        packageId: package_.packageId,
    }),
};
