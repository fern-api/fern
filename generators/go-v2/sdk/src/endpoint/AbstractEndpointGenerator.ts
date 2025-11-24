import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";

import {
    FilePropertyArray,
    FilePropertySingle,
    FileUploadRequestProperty,
    HttpEndpoint,
    HttpRequestBody,
    HttpService,
    PathParameter,
    SdkRequest,
    ServiceId
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { EndpointSignatureInfo } from "./EndpointSignatureInfo";
import { EndpointRequest } from "./request/EndpointRequest";
import { getEndpointPageReturnType } from "./utils/getEndpointPageReturnType";
import { getEndpointRequest } from "./utils/getEndpointRequest";
import { getEndpointReturnType } from "./utils/getEndpointReturnType";
import { getEndpointReturnZeroValue } from "./utils/getEndpointReturnZeroValue";
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
        const requestParameter = this.getRequestParameter({ endpoint, request });
        const fileParameters = this.getEndpointFileParameters({ endpoint });
        const allParameters = [
            this.context.getContextParameter(),
            ...pathParameters,
            ...fileParameters,
            requestParameter,
            endpoint.idempotent
                ? this.context.getVariadicIdempotentRequestOptionParameter()
                : this.context.getVariadicRequestOptionParameter()
        ].filter((p): p is go.Parameter => p != null);

        const pagination = this.context.getPagination(endpoint);
        const isCustomPagination = pagination?.type === "custom" && this.context.customConfig.customPagerName != null;

        return {
            pathParameters,
            pathParameterReferences,
            request,
            requestParameter,
            allParameters,
            returnType: isCustomPagination
                ? this.context.getReturnTypeForEndpoint(endpoint)
                : getEndpointReturnType({ context: this.context, endpoint }),
            pageReturnType: getEndpointPageReturnType({ context: this.context, endpoint }),
            rawReturnTypeReference: getRawEndpointReturnTypeReference({ context: this.context, endpoint }),
            returnZeroValue: getEndpointReturnZeroValue({ context: this.context, endpoint })
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

    private getEndpointFileParameters({ endpoint }: { endpoint: HttpEndpoint }): go.Parameter[] {
        const requestBody = endpoint.requestBody;
        if (requestBody == null || this.context.customConfig.inlineFileProperties) {
            return [];
        }
        return this.getFileParametersFromRequestBody({ requestBody });
    }

    private getFileParametersFromRequestBody({ requestBody }: { requestBody: HttpRequestBody }): go.Parameter[] {
        switch (requestBody.type) {
            case "fileUpload":
                return this.getFileParametersFromFileUpload({ properties: requestBody.properties });
            case "reference":
            case "inlinedRequestBody":
            case "bytes":
                return [];
            default:
                assertNever(requestBody);
        }
    }

    private getFileParametersFromFileUpload({
        properties
    }: {
        properties: FileUploadRequestProperty[];
    }): go.Parameter[] {
        const fileParameters: go.Parameter[] = [];
        for (const property of properties) {
            switch (property.type) {
                case "file":
                    fileParameters.push(this.getFileParameterFromProperty({ property }));
                    break;
                case "bodyProperty":
                    break;
                default: {
                    assertNever(property);
                }
            }
        }
        return fileParameters;
    }

    private getFileParameterFromProperty({ property }: { property: FileUploadRequestProperty.File_ }): go.Parameter {
        const filePropertyType = property.value.type;
        switch (filePropertyType) {
            case "file":
                return this.getSingleFileParameter({ fileProperty: property.value });
            case "fileArray":
                return this.getFileArrayParameter({ fileProperty: property.value });
            default:
                assertNever(filePropertyType);
        }
    }

    private getSingleFileParameter({ fileProperty }: { fileProperty: FilePropertySingle }): go.Parameter {
        return go.parameter({
            docs: fileProperty.docs,
            type: go.Type.reference(this.context.getIoReaderTypeReference()),
            name: this.context.getParameterName(fileProperty.key.name)
        });
    }

    private getFileArrayParameter({ fileProperty }: { fileProperty: FilePropertyArray }): go.Parameter {
        return go.parameter({
            docs: fileProperty.docs,
            type: go.Type.slice(go.Type.reference(this.context.getIoReaderTypeReference())),
            name: this.context.getParameterName(fileProperty.key.name)
        });
    }

    private getRequestParameter({
        endpoint,
        request
    }: {
        endpoint: HttpEndpoint;
        request: EndpointRequest | undefined;
    }): go.Parameter | undefined {
        if (request == null) {
            return undefined;
        }
        if (endpoint.sdkRequest?.shape.type === "wrapper") {
            if (this.context.shouldSkipWrappedRequest({ endpoint, wrapper: endpoint.sdkRequest.shape })) {
                return undefined;
            }
        }
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
