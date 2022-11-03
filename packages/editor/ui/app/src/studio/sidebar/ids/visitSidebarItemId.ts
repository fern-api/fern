import { assertNever } from "@fern-api/core-utils";
import {
    ApiConfigurationSidebarItemId,
    EndpointSidebarItemId,
    ErrorsGroupSidebarItemId,
    ErrorSidebarItemId,
    PackageSidebarItemId,
    SdkConfigurationSidebarItemId,
    SidebarItemId,
    TypesGroupSidebarItemId,
    TypeSidebarItemId,
} from "./SidebarItemId";

export interface SidebarItemIdVisitor<R> {
    apiConfiguration: (sidebarItemId: ApiConfigurationSidebarItemId) => R;
    sdkConfiguration: (sidebarItemId: SdkConfigurationSidebarItemId) => R;
    package: (sidebarItemId: PackageSidebarItemId) => R;
    endpoint: (sidebarItemId: EndpointSidebarItemId) => R;
    type: (sidebarItemId: TypeSidebarItemId) => R;
    error: (sidebarItemId: ErrorSidebarItemId) => R;
    typesGroup: (sidebarItemId: TypesGroupSidebarItemId) => R;
    errorsGroup: (sidebarItemId: ErrorsGroupSidebarItemId) => R;
}

export function visitSidebarItemId<R>(sidebarItemId: SidebarItemId, visitor: SidebarItemIdVisitor<R>): R {
    switch (sidebarItemId.type) {
        case "apiConfiguration":
            return visitor.apiConfiguration(sidebarItemId);
        case "sdkConfiguration":
            return visitor.sdkConfiguration(sidebarItemId);
        case "package":
            return visitor.package(sidebarItemId);
        case "endpoint":
            return visitor.endpoint(sidebarItemId);
        case "type":
            return visitor.type(sidebarItemId);
        case "error":
            return visitor.error(sidebarItemId);
        case "typesGroup":
            return visitor.typesGroup(sidebarItemId);
        case "errorsGroup":
            return visitor.errorsGroup(sidebarItemId);
        default:
            assertNever(sidebarItemId);
    }
}
