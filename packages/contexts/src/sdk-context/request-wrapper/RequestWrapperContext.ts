import { Name } from "@fern-fern/ir-model/commons";
import { PackageId } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { GeneratedRequestWrapper } from "./GeneratedRequestWrapper";

export interface RequestWrapperContext {
    getGeneratedRequestWrapper: (packageId: PackageId, endpointName: Name) => GeneratedRequestWrapper;
    getReferenceToRequestWrapper: (packageId: PackageId, endpointName: Name) => ts.TypeNode;
}
