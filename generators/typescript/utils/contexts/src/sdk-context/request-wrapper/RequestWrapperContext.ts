import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { GeneratedRequestWrapper } from "./GeneratedRequestWrapper.js";

export interface RequestWrapperContext {
    getGeneratedRequestWrapper: (packageId: PackageId, endpointName: FernIr.Name) => GeneratedRequestWrapper;
    getReferenceToRequestWrapper: (packageId: PackageId, endpointName: FernIr.Name) => ts.TypeNode;
    shouldInlinePathParameters: (sdkRequest: FernIr.SdkRequest | undefined | null) => boolean;
}
