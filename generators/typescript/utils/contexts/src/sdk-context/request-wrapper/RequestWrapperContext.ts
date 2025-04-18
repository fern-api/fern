import { PackageId } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { Name, SdkRequest } from "@fern-fern/ir-sdk/api";

import { GeneratedRequestWrapper } from "./GeneratedRequestWrapper";

export interface RequestWrapperContext {
    getGeneratedRequestWrapper: (packageId: PackageId, endpointName: Name) => GeneratedRequestWrapper;
    getReferenceToRequestWrapper: (packageId: PackageId, endpointName: Name) => ts.TypeNode;
    shouldInlinePathParameters: (sdkRequest: SdkRequest | undefined | null) => boolean;
}
