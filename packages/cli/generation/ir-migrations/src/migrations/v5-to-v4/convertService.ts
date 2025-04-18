import { IrVersions } from "../../ir-versions";
import { ErrorResolver } from "./ErrorResolver";
import { convertDeclaredTypeName } from "./convertDeclaredTypeName";
import { convertExampleTypeReference } from "./convertExampleTypeReference";
import { convertFernFilepathV1, convertFernFilepathV2 } from "./convertFernFilepath";
import { convertHeader } from "./convertHeader";
import {
    convertNameAndWireValueToV1,
    convertNameAndWireValueToV2,
    convertNameToV1,
    convertNameToV2
} from "./convertName";
import { convertTypeReference } from "./convertTypeReference";

export function convertService({
    service,
    errorResolver
}: {
    service: IrVersions.V5.http.HttpService;
    errorResolver: ErrorResolver;
}): IrVersions.V4.services.http.HttpService {
    return {
        docs: service.docs,
        availability: service.availability,
        displayName: service.displayName,
        name: convertDeclaredServiceName(service.name),
        basePath: convertBasePathToString(service.basePath),
        basePathV2: service.basePath,
        endpoints: service.endpoints.map((endpoint) => convertEndpoint({ endpoint, errorResolver })),
        headers: service.headers.map((header) => convertHeader(header)),
        pathParameters: service.pathParameters.map((pathParameter) => convertPathParameter(pathParameter))
    };
}

function convertDeclaredServiceName(
    serviceName: IrVersions.V5.http.DeclaredServiceName
): IrVersions.V4.services.commons.DeclaredServiceName {
    return {
        name: serviceName.name.pascalCase.unsafeName,
        fernFilepath: convertFernFilepathV1(serviceName.fernFilepath),
        fernFilepathV2: convertFernFilepathV2(serviceName.fernFilepath)
    };
}

function convertBasePathToString(basePath: IrVersions.V5.http.HttpPath): string {
    return basePath.parts.reduce(
        (stringifiedBasePath, part) => stringifiedBasePath + `{${part.pathParameter}}` + part.tail,
        basePath.head
    );
}

function convertEndpoint({
    endpoint,
    errorResolver
}: {
    endpoint: IrVersions.V5.http.HttpEndpoint;
    errorResolver: ErrorResolver;
}): IrVersions.V4.services.http.HttpEndpoint {
    return {
        docs: endpoint.docs,
        availability: endpoint.availability,
        id: endpoint.name.originalName,
        name: convertNameToV1(endpoint.name),
        nameV2: convertNameToV2(endpoint.name),
        displayName: endpoint.displayName,
        method: endpoint.method,
        headers: endpoint.headers.map((header) => convertHeader(header)),
        path: endpoint.path,
        pathParameters: endpoint.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        queryParameters: endpoint.queryParameters.map((queryParameter) => convertQueryParameter(queryParameter)),
        requestBody: endpoint.requestBody != null ? convertRequestBody(endpoint.requestBody) : undefined,
        sdkRequest: endpoint.sdkRequest != null ? convertSdkRequest(endpoint.sdkRequest) : undefined,
        response: convertResponse(endpoint.response),
        errors: endpoint.errors.map((error) => convertResponseError(error)),
        errorsV2: convertResponseErrorsV2({ responseErrors: endpoint.errors, errorResolver }),
        auth: endpoint.auth,
        examples: endpoint.examples.map((example) => convertExampleEndpointCall(example))
    };
}

function convertPathParameter(
    pathParameter: IrVersions.V5.http.PathParameter
): IrVersions.V4.services.http.PathParameter {
    return {
        docs: pathParameter.docs,
        availability: pathParameter.availability,
        name: convertNameToV1(pathParameter.name),
        nameV2: convertNameToV2(pathParameter.name),
        valueType: convertTypeReference(pathParameter.valueType)
    };
}

function convertQueryParameter(
    queryParameter: IrVersions.V5.http.QueryParameter
): IrVersions.V4.services.http.QueryParameter {
    return {
        docs: queryParameter.docs,
        availability: queryParameter.availability,
        name: convertNameAndWireValueToV1(queryParameter.name),
        nameV2: convertNameAndWireValueToV2(queryParameter.name),
        valueType: convertTypeReference(queryParameter.valueType),
        allowMultiple: queryParameter.allowMultiple
    };
}

function convertRequestBody(
    requestBody: IrVersions.V5.http.HttpRequestBody
): IrVersions.V4.services.http.HttpRequestBody {
    return IrVersions.V5.http.HttpRequestBody._visit<IrVersions.V4.services.http.HttpRequestBody>(requestBody, {
        inlinedRequestBody: (inlinedRequestBody) =>
            IrVersions.V4.services.http.HttpRequestBody.inlinedRequestBody({
                name: convertNameToV2(inlinedRequestBody.name),
                extends: inlinedRequestBody.extends.map((typeName) => convertDeclaredTypeName(typeName)),
                properties: inlinedRequestBody.properties.map((property) => ({
                    docs: property.docs,
                    name: convertNameAndWireValueToV2(property.name),
                    valueType: convertTypeReference(property.valueType)
                }))
            }),
        reference: (reference) =>
            IrVersions.V4.services.http.HttpRequestBody.reference({
                docs: reference.docs,
                requestBodyType: convertTypeReference(reference.requestBodyType)
            }),
        _unknown: () => {
            throw new Error("Unknown HttpRequestBody type: " + requestBody.type);
        }
    });
}

function convertSdkRequest(sdkRequest: IrVersions.V5.http.SdkRequest): IrVersions.V4.services.http.SdkRequest {
    return {
        requestParameterName: convertNameToV2(sdkRequest.requestParameterName),
        shape: IrVersions.V5.http.SdkRequestShape._visit<IrVersions.V4.services.http.SdkRequestShape>(
            sdkRequest.shape,
            {
                justRequestBody: (requestBodyReference) =>
                    IrVersions.V4.services.http.SdkRequestShape.justRequestBody({
                        docs: requestBodyReference.docs,
                        requestBodyType: convertTypeReference(requestBodyReference.requestBodyType)
                    }),
                wrapper: (wrapper) =>
                    IrVersions.V4.services.http.SdkRequestShape.wrapper({
                        wrapperName: convertNameToV2(wrapper.wrapperName),
                        bodyKey: convertNameToV2(wrapper.bodyKey)
                    }),
                _unknown: () => {
                    throw new Error("Unknown SdkRequestShape type: " + sdkRequest.shape.type);
                }
            }
        )
    };
}

function convertResponse(response: IrVersions.V5.http.HttpResponse): IrVersions.V4.services.http.HttpResponse {
    const convertedType = response.type != null ? convertTypeReference(response.type) : undefined;
    return {
        docs: response.docs,
        type: convertedType ?? IrVersions.V4.types.TypeReference.void(),
        typeV2: convertedType
    };
}

function convertResponseError(
    responseError: IrVersions.V5.http.ResponseError
): IrVersions.V4.services.commons.ResponseError {
    return {
        docs: responseError.docs,
        error: convertDeclaredErrorName(responseError.error)
    };
}

function convertResponseErrorsV2({
    responseErrors,
    errorResolver
}: {
    responseErrors: IrVersions.V5.http.ResponseErrors;
    errorResolver: ErrorResolver;
}): IrVersions.V4.services.commons.ResponseErrorsV2 {
    return {
        discriminant: {
            originalValue: "errorName",
            camelCase: "errorName",
            snakeCase: "error_name",
            pascalCase: "ErrorName",
            screamingSnakeCase: "ERROR_NAME",
            wireValue: "errorName"
        },
        types: responseErrors.map((responseError) => convertResponseErrorV2({ responseError, errorResolver }))
    };
}

function convertResponseErrorV2({
    responseError,
    errorResolver
}: {
    responseError: IrVersions.V5.http.ResponseError;
    errorResolver: ErrorResolver;
}): IrVersions.V4.services.commons.ResponseErrorV2 {
    const declaration = errorResolver.getDeclaration(responseError.error);
    return {
        docs: responseError.docs,
        discriminantValue: convertNameAndWireValueToV1(declaration.discriminantValue),
        shape: convertResponseErrorShape({ responseError, declaration })
    };
}

function convertResponseErrorShape({
    responseError,
    declaration
}: {
    responseError: IrVersions.V5.http.ResponseError;
    declaration: IrVersions.V5.errors.ErrorDeclaration;
}): IrVersions.V4.services.commons.ResponseErrorShape {
    if (declaration.type == null) {
        return IrVersions.V4.services.commons.ResponseErrorShape.noProperties();
    }
    return IrVersions.V4.services.commons.ResponseErrorShape.singleProperty({
        name: {
            originalValue: "content",
            camelCase: "content",
            snakeCase: "content",
            pascalCase: "Content",
            screamingSnakeCase: "CONTENT",
            wireValue: "content"
        },
        error: convertDeclaredErrorName(responseError.error)
    });
}

function convertDeclaredErrorName(
    errorName: IrVersions.V5.errors.DeclaredErrorName
): IrVersions.V4.errors.DeclaredErrorName {
    return {
        name: errorName.name.originalName,
        nameV2: convertNameToV1(errorName.name),
        nameV3: convertNameToV2(errorName.name),
        fernFilepath: convertFernFilepathV1(errorName.fernFilepath),
        fernFilepathV2: convertFernFilepathV2(errorName.fernFilepath)
    };
}

function convertExampleEndpointCall(
    example: IrVersions.V5.http.ExampleEndpointCall
): IrVersions.V4.services.http.ExampleEndpointCall {
    return {
        docs: example.docs,
        name: example.name?.originalName,
        servicePathParameters: example.servicePathParameters.map((pathParameter) =>
            convertExamplePathParameter(pathParameter)
        ),
        endpointPathParameters: example.endpointPathParameters.map((pathParameter) =>
            convertExamplePathParameter(pathParameter)
        ),
        serviceHeaders: example.serviceHeaders.map((header) => convertExampleHeader(header)),
        endpointHeaders: example.endpointHeaders.map((header) => convertExampleHeader(header)),
        queryParameters: example.queryParameters.map((queryParameter) => convertExampleQueryParameter(queryParameter)),
        request: example.request != null ? convertExampleRequest(example.request) : undefined,
        response: convertExampleResponse(example.response)
    };
}

function convertExamplePathParameter(
    pathParameter: IrVersions.V5.http.ExamplePathParameter
): IrVersions.V4.services.http.ExamplePathParameter {
    return {
        key: pathParameter.key,
        value: convertExampleTypeReference(pathParameter.value)
    };
}

function convertExampleHeader(header: IrVersions.V5.http.ExampleHeader): IrVersions.V4.services.http.ExampleHeader {
    return {
        wireKey: header.wireKey,
        value: convertExampleTypeReference(header.value)
    };
}

function convertExampleQueryParameter(
    queryParameter: IrVersions.V5.http.ExampleQueryParameter
): IrVersions.V4.services.http.ExampleQueryParameter {
    return {
        wireKey: queryParameter.wireKey,
        value: convertExampleTypeReference(queryParameter.value)
    };
}

function convertExampleRequest(
    request: IrVersions.V5.http.ExampleRequestBody
): IrVersions.V4.services.http.ExampleRequestBody {
    return IrVersions.V5.http.ExampleRequestBody._visit<IrVersions.V4.services.http.ExampleRequestBody>(request, {
        inlinedRequestBody: (inlinedRequestBody) =>
            IrVersions.V4.services.http.ExampleRequestBody.inlinedRequestBody({
                jsonExample: inlinedRequestBody.jsonExample,
                properties: inlinedRequestBody.properties.map((property) =>
                    convertExampleInlinedRequestBodyProperty(property)
                )
            }),
        reference: (reference) =>
            IrVersions.V4.services.http.ExampleRequestBody.reference(convertExampleTypeReference(reference)),
        _unknown: () => {
            throw new Error("Unknown ExampleRequestBody: " + request.type);
        }
    });
}

function convertExampleInlinedRequestBodyProperty(
    property: IrVersions.V5.http.ExampleInlinedRequestBodyProperty
): IrVersions.V4.services.http.ExampleInlinedRequestBodyProperty {
    return {
        wireKey: property.wireKey,
        value: convertExampleTypeReference(property.value),
        originalTypeDeclaration:
            property.originalTypeDeclaration != null
                ? convertDeclaredTypeName(property.originalTypeDeclaration)
                : undefined
    };
}

function convertExampleResponse(
    response: IrVersions.V5.http.ExampleResponse
): IrVersions.V4.services.http.ExampleResponse {
    return IrVersions.V5.http.ExampleResponse._visit<IrVersions.V4.services.http.ExampleResponse>(response, {
        ok: (okResponse) =>
            IrVersions.V4.services.http.ExampleResponse.ok({
                body: okResponse.body != null ? convertExampleTypeReference(okResponse.body) : undefined
            }),
        error: (errorResponse) =>
            IrVersions.V4.services.http.ExampleResponse.error({
                error: convertDeclaredErrorName(errorResponse.error),
                body: errorResponse.body != null ? convertExampleTypeReference(errorResponse.body) : undefined
            }),
        _unknown: () => {
            throw new Error("Unknown ExampleResponse: " + response.type);
        }
    });
}
