import { IrVersions } from "../../ir-versions";
import { convertNameAndWireValue } from "./convertCommons";
import { convertTypeReference } from "./convertTypes";

export function convertRequestProperty(requestProperty: IrVersions.V61.RequestProperty): IrVersions.V60.RequestProperty {
}

export function maybeConvertRequestProperty(requestProperty: IrVersions.V61.RequestProperty | undefined): IrVersions.V60.RequestProperty | undefined {
    return requestProperty != null ? convertRequestProperty(requestProperty) : undefined;
}

export function convertResponseProperty(responseProperty: IrVersions.V61.ResponseProperty): IrVersions.V60.ResponseProperty {
}

export function maybeConvertResponseProperty(responseProperty: IrVersions.V61.ResponseProperty | undefined): IrVersions.V60.ResponseProperty | undefined {
    return responseProperty != null ? convertResponseProperty(responseProperty) : undefined;
}

export function convertHttpHeaders(headers: IrVersions.V61.HttpHeader[]): IrVersions.V60.HttpHeader[] {
    return headers.map(header => ({
        ...header,
        name: convertNameAndWireValue(header.name),
        valueType: convertTypeReference(header.valueType)
    }));
}


export function convertServices(services: Record<IrVersions.V61.ServiceId, IrVersions.V61.HttpService>): Record<IrVersions.V60.ServiceId, IrVersions.V60.HttpService> {
    return Object.fromEntries(
        Object.entries(services).map(([key, service]) => [
            key,
            convertHttpService(service)
        ])
    );
}

function convertHttpService(service: IrVersions.V61.HttpService): IrVersions.V60.HttpService {
    return {
        ...service,
        name: convertDeclaredServiceName(service.name),
        endpoints: service.endpoints.map(convertHttpEndpoint),
        headers: service.headers.map(header => ({
            ...header,
            name: convertNameAndWireValue(header.name),
            valueType: convertTypeReference(header.valueType)
        })),
        pathParameters: service.pathParameters.map(pathParam => ({
            ...pathParam,
            name: convertName(pathParam.name),
            valueType: convertTypeReference(pathParam.valueType)
        }))
    };
}

function convertDeclaredServiceName(serviceName: IrVersions.V61.DeclaredServiceName): IrVersions.V60.DeclaredServiceName {
    return {
        ...serviceName,
        fernFilepath: {
            ...serviceName.fernFilepath,
            allParts: serviceName.fernFilepath.allParts.map(convertName),
            packagePath: serviceName.fernFilepath.packagePath.map(convertName),
            file: serviceName.fernFilepath.file != null ? convertName(serviceName.fernFilepath.file) : undefined
        }
    };
}

function convertHttpEndpoint(endpoint: IrVersions.V61.HttpEndpoint): IrVersions.V60.HttpEndpoint {
    return {
        ...endpoint,
        name: convertName(endpoint.name),
        queryParameters: endpoint.queryParameters.map(param => ({
            ...param,
            name: convertNameAndWireValue(param.name),
            valueType: convertTypeReference(param.valueType)
        })),
        headers: endpoint.headers.map(header => ({
            ...header,
            name: convertNameAndWireValue(header.name),
            valueType: convertTypeReference(header.valueType)
        })),
        pathParameters: endpoint.pathParameters.map(pathParam => ({
            ...pathParam,
            name: convertName(pathParam.name),
            valueType: convertTypeReference(pathParam.valueType)
        })),
        requestBody: endpoint.requestBody != null ? convertHttpRequestBody(endpoint.requestBody) : undefined,
        response: endpoint.response != null ? convertHttpResponse(endpoint.response) : undefined,
        errors: endpoint.errors.map(convertResponseError)
    };
}


function convertHttpResponse(response: IrVersions.V61.HttpResponse): IrVersions.V60.HttpResponse {
    return {
        ...response,
        body: response.body != null ? convertHttpResponseBody(response.body) : undefined
    };
}

function convertHttpResponseBody(responseBody: IrVersions.V61.HttpResponseBody): IrVersions.V60.HttpResponseBody {
    switch (responseBody.type) {
        case "json":
            return {
                ...responseBody,
                value: convertJsonResponse(responseBody.value)
            };
        case "fileDownload":
            return responseBody;
        case "text":
            return responseBody;
        case "streaming":
            return {
                ...responseBody,
                value: convertStreamingResponse(responseBody.value)
            };
        default:
            return assertNever(responseBody);
    }
}

function convertJsonResponse(jsonResponse: IrVersions.V61.JsonResponse): IrVersions.V60.JsonResponse {
    switch (jsonResponse.type) {
        case "response":
            return {
                ...jsonResponse,
                responseBodyType: convertTypeReference(jsonResponse.responseBodyType)
            };
        case "nestedPropertyAsResponse":
            return {
                ...jsonResponse,
                responseBodyType: convertTypeReference(jsonResponse.responseBodyType),
                responseProperty: jsonResponse.responseProperty != null ? {
                    ...jsonResponse.responseProperty,
                    name: convertNameAndWireValue(jsonResponse.responseProperty.name),
                    valueType: convertTypeReference(jsonResponse.responseProperty.valueType)
                } : undefined
            };
        default:
            return assertNever(jsonResponse);
    }
}

function convertStreamingResponse(streamingResponse: IrVersions.V61.StreamingResponse): IrVersions.V60.StreamingResponse {
    switch (streamingResponse.type) {
        case "json":
            return streamingResponse;
        case "sse":
            return streamingResponse;
        default:
            return assertNever(streamingResponse);
    }
}

