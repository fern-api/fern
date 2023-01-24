import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { ts } from "ts-morph";
import { GeneratedRequestWrapper } from "../../generated-types/GeneratedRequestWrapper";

export interface RequestWrapperContextMixin {
    getGeneratedRequestWrapper: (service: FernFilepath, endpointName: Name) => GeneratedRequestWrapper;
    getReferenceToRequestWrapper: (service: FernFilepath, endpointName: Name) => ts.TypeNode;
}

export interface WithRequestWrapperContextMixin {
    requestWrapper: RequestWrapperContextMixin;
}
