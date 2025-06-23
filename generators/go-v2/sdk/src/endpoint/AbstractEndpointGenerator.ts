import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpService, PathParameter, SdkRequest, ServiceId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { EndpointSignatureInfo } from "./EndpointSignatureInfo";
import { EndpointRequest } from "./request/EndpointRequest";
import { getEndpointRequest } from "./utils/getEndpointRequest";
import { getEndpointReturnTypes } from "./utils/getEndpointReturnTypes";
import { getEndpointReturnZeroValues } from "./utils/getEndpointReturnZeroValue";
import { getRawEndpointReturnTypeReference } from "./utils/getRawEndpointReturnTypeReference";

export abstract class AbstractEndpointGenerator {
    protected readonly context: SdkGeneratorContext;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
    }

    public getEndpointSignatureInfo({
        serviceId,
        service,
        endpoint
    }: {
        serviceId: ServiceId;
        service: HttpService;
        endpoint: HttpEndpoint;
    }): EndpointSignatureInfo {
        const { pathParameters, pathParameterReferences } = this.getAllPathParameters({ serviceId, endpoint });
        const request = getEndpointRequest({ context: this.context, endpoint, serviceId, service });
        const requestParameter = request != null ? this.getRequestParameter({ request }) : undefined;
        const allParameters = [
            this.context.getContextParameter(),
            ...pathParameters,
            requestParameter,
            endpoint.idempotent
                ? this.context.getVariadicIdempotentRequestOptionParameter()
                : this.context.getVariadicRequestOptionParameter()
        ].filter((p): p is go.Parameter => p != null);
        const returnType = getEndpointReturnTypes({ context: this.context, endpoint });
        const rawReturnTypeReference = getRawEndpointReturnTypeReference({ context: this.context, endpoint });
        const returnZeroValue = getEndpointReturnZeroValues({ context: this.context, endpoint });
        return {
            allParameters,
            pathParameters,
            pathParameterReferences,
            request,
            requestParameter,
            returnType,
            rawReturnTypeReference,
            returnZeroValue
        };
    }

    private getAllPathParameters({
        serviceId,
        endpoint
    }: {
        serviceId: ServiceId;
        endpoint: HttpEndpoint;
    }): Pick<EndpointSignatureInfo, "pathParameters" | "pathParameterReferences"> {
        const service = this.context.getHttpServiceOrThrow(serviceId);
        const includePathParametersInSignature = this.includePathParametersInEndpointSignature({ endpoint });
        const pathParameters: go.Parameter[] = [];
        const pathParameterReferences: Record<string, string> = {};
        for (const pathParam of [
            ...this.context.ir.pathParameters,
            ...service.pathParameters,
            ...endpoint.pathParameters
        ]) {
            const parameterName = this.context.getParameterName(pathParam.name);
            pathParameterReferences[pathParam.name.originalName] = this.accessPathParameterValue({
                pathParameter: pathParam,
                sdkRequest: endpoint.sdkRequest,
                includePathParametersInEndpointSignature: includePathParametersInSignature
            });
            if (includePathParametersInSignature) {
                pathParameters.push(
                    go.parameter({
                        docs: pathParam.docs,
                        name: parameterName,
                        type: this.context.goTypeMapper.convert({ reference: pathParam.valueType })
                    })
                );
            }
        }
        return {
            pathParameters,
            pathParameterReferences
        };
    }

    private getRequestParameter({ request }: { request: EndpointRequest }): go.Parameter {
        return go.parameter({
            type: request.getRequestParameterType(),
            name: request.getRequestParameterName()
        });
    }

    private includePathParametersInEndpointSignature({ endpoint }: { endpoint: HttpEndpoint }): boolean {
        const shape = endpoint.sdkRequest?.shape;
        if (shape == null) {
            return true;
        }
        switch (shape.type) {
            case "wrapper": {
                return !this.context.includePathParametersInWrappedRequest({ endpoint, wrapper: shape });
            }
            case "justRequestBody": {
                return true;
            }
            default: {
                assertNever(shape);
            }
        }
    }

    private accessPathParameterValue({
        sdkRequest,
        pathParameter,
        includePathParametersInEndpointSignature
    }: {
        sdkRequest: SdkRequest | undefined;
        pathParameter: PathParameter;
        includePathParametersInEndpointSignature: boolean;
    }): string {
        if (sdkRequest == null || includePathParametersInEndpointSignature) {
            return this.context.getParameterName(pathParameter.name);
        }
        return this.context.accessRequestProperty({
            requestParameterName: sdkRequest.requestParameterName,
            propertyName: pathParameter.name
        });
    }
}
