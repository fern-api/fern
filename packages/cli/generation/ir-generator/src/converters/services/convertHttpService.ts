import { assertNever, RelativeFilePath } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { HttpEndpoint, HttpHeader, HttpMethod, HttpService, PathParameter } from "@fern-fern/ir-model/services/http";
import { generateStringWithAllCasings, generateWireStringWithAllCasings } from "../../utils/generateCasings";
import { getDocs } from "../../utils/getDocs";
import { createTypeReferenceParser, TypeReferenceParser } from "../../utils/parseInlineType";
import { constructHttpPath } from "./constructHttpPath";
import { convertHttpRequest } from "./convertHttpRequest";
import { convertHttpResponse } from "./convertHttpResponse";
import { convertResponseErrors } from "./convertResponseErrors";

export function convertHttpService({
    serviceDefinition,
    serviceId,
    fernFilepath,
    imports,
}: {
    serviceDefinition: RawSchemas.HttpServiceSchema;
    serviceId: string;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
}): HttpService {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    return {
        docs: serviceDefinition.docs,
        name: {
            name: serviceId,
            fernFilepath,
        },
        basePath: serviceDefinition["base-path"],
        basePathV2: constructHttpPath(serviceDefinition["base-path"]),
        headers:
            serviceDefinition.headers != null
                ? Object.entries(serviceDefinition.headers).map(([headerKey, header]) =>
                      convertHttpHeader({ headerKey, header, fernFilepath, imports })
                  )
                : [],
        endpoints: Object.entries(serviceDefinition.endpoints).map(
            ([endpointKey, endpoint]): HttpEndpoint => ({
                id: endpointKey,
                name: generateStringWithAllCasings(endpointKey),
                auth: endpoint.auth ?? serviceDefinition.auth,
                docs: endpoint.docs,
                method: endpoint.method != null ? convertHttpMethod(endpoint.method) : HttpMethod.Post,
                path: constructHttpPath(endpoint.path),
                pathParameters: getEndpointPathParameters({
                    servicePathParameters: serviceDefinition["path-parameters"],
                    endpointPathParameters: endpoint["path-parameters"],
                    parseTypeReference,
                }),
                queryParameters:
                    endpoint["query-parameters"] != null
                        ? Object.entries(endpoint["query-parameters"]).map(([parameterName, parameter]) => {
                              const valueType = parseTypeReference(parameter);
                              return {
                                  docs: typeof parameter !== "string" ? parameter.docs : undefined,
                                  name: generateWireStringWithAllCasings({
                                      wireValue: parameterName,
                                      name:
                                          typeof parameter !== "string" && parameter.name != null
                                              ? parameter.name
                                              : parameterName,
                                  }),
                                  valueType,
                              };
                          })
                        : [],
                headers:
                    endpoint.headers != null
                        ? Object.entries(endpoint.headers).map(([headerKey, header]) =>
                              convertHttpHeader({ headerKey, header, fernFilepath, imports })
                          )
                        : [],
                request: convertHttpRequest({
                    request: endpoint.request,
                    fernFilepath,
                    imports,
                }),
                response: convertHttpResponse({
                    response: endpoint.response,
                    fernFilepath,
                    imports,
                }),
                errors: convertResponseErrors({
                    errors: endpoint.errors,
                    fernFilepath,
                    imports,
                }),
            })
        ),
    };
}

function getEndpointPathParameters({
    servicePathParameters,
    endpointPathParameters,
    parseTypeReference,
}: {
    servicePathParameters: Record<string, RawSchemas.HttpPathParameterSchema> | undefined;
    endpointPathParameters: Record<string, RawSchemas.HttpPathParameterSchema> | undefined;
    parseTypeReference: TypeReferenceParser;
}): PathParameter[] {
    const result: PathParameter[] = [];
    if (servicePathParameters != null) {
        Object.entries(servicePathParameters).forEach(([parameterName, parameter]) =>
            result.push(
                convertPathParameter({
                    parameterName,
                    parameter,
                    parseTypeReference,
                })
            )
        );
    }
    if (endpointPathParameters != null) {
        Object.entries(endpointPathParameters).forEach(([parameterName, parameter]) =>
            result.push(
                convertPathParameter({
                    parameterName,
                    parameter,
                    parseTypeReference,
                })
            )
        );
    }
    return result;
}

function convertPathParameter({
    parameterName,
    parameter,
    parseTypeReference,
}: {
    parameterName: string;
    parameter: RawSchemas.HttpPathParameterSchema;
    parseTypeReference: TypeReferenceParser;
}): PathParameter {
    return {
        docs: typeof parameter !== "string" ? parameter.docs : undefined,
        name: generateStringWithAllCasings(parameterName),
        valueType: parseTypeReference(parameter),
    };
}

function convertHttpMethod(method: Exclude<RawSchemas.HttpEndpointSchema["method"], null | undefined>): HttpMethod {
    switch (method) {
        case "GET":
            return HttpMethod.Get;
        case "POST":
            return HttpMethod.Post;
        case "PUT":
            return HttpMethod.Put;
        case "PATCH":
            return HttpMethod.Patch;
        case "DELETE":
            return HttpMethod.Delete;
        default:
            assertNever(method);
    }
}

export function convertHttpHeader({
    headerKey,
    header,
    fernFilepath,
    imports,
}: {
    headerKey: string;
    header: RawSchemas.HttpHeaderSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
}): HttpHeader {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    return {
        name: generateWireStringWithAllCasings({
            wireValue: headerKey,
            name: typeof header !== "string" && header.name != null ? header.name : headerKey,
        }),
        valueType: parseTypeReference(header),
        docs: getDocs(header),
    };
}
