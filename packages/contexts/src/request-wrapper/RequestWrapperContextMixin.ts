import { Name } from "@fern-fern/ir-model/commons";
import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { ts } from "ts-morph";
import { GeneratedRequestWrapper } from "./GeneratedRequestWrapper";

export interface RequestWrapperContextMixin {
    getGeneratedRequestWrapper: (service: DeclaredServiceName, endpointName: Name) => GeneratedRequestWrapper;
    getReferenceToRequestWrapper: (service: DeclaredServiceName, endpointName: Name) => ts.TypeNode;
}

export interface WithRequestWrapperContextMixin {
    requestWrapper: RequestWrapperContextMixin;
}
