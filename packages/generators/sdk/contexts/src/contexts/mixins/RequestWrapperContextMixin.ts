import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpointId } from "@fern-fern/ir-model/services/http";
import { ts } from "ts-morph";
import { GeneratedRequestWrapper } from "../../generated-types/GeneratedRequestWrapper";

export interface RequestWrapperContextMixin {
    getGeneratedRequestWrapper: (
        serviceName: DeclaredServiceName,
        endpointId: HttpEndpointId
    ) => GeneratedRequestWrapper;
    getReferenceToRequestWrapper: (serviceName: DeclaredServiceName, endpointId: HttpEndpointId) => ts.TypeNode;
}

export interface WithRequestWrapperContextMixin {
    requestWrapper: RequestWrapperContextMixin;
}
