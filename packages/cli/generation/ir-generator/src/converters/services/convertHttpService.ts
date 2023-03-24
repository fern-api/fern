import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import {
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpService,
    PathParameter,
    ResponseErrors,
} from "@fern-fern/ir-model/http";
import urlJoin from "url-join";
import { FernFileContext } from "../../FernFileContext";
import { ErrorResolver } from "../../resolvers/ErrorResolver";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { convertAvailability, convertDeclaration } from "../convertDeclaration";
import { constructHttpPath } from "./constructHttpPath";
import { convertExampleEndpointCall } from "./convertExampleEndpointCall";
import { convertHttpRequestBody } from "./convertHttpRequestBody";
import { convertHttpResponse } from "./convertHttpResponse";
import { convertHttpSdkRequest } from "./convertHttpSdkRequest";
import { convertResponseErrors } from "./convertResponseErrors";

export function convertHttpService({
    serviceDefinition,
    file,
    errorResolver,
    typeResolver,
    exampleResolver,
    globalErrors,
}: {
    serviceDefinition: RawSchemas.HttpServiceSchema;
    file: FernFileContext;
    errorResolver: ErrorResolver;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    globalErrors: ResponseErrors;
}): HttpService {
    return {
        availability: convertAvailability(serviceDefinition.availability),
        name: { fernFilepath: file.fernFilepath },
        displayName: serviceDefinition["display-name"] ?? undefined,
        baseUrl: serviceDefinition.url,
        basePath: constructHttpPath(serviceDefinition["base-path"]),
        headers:
            serviceDefinition.headers != null
                ? Object.entries(serviceDefinition.headers).map(([headerKey, header]) =>
                      convertHttpHeader({ headerKey, header, file })
                  )
                : [],
        pathParameters: convertPathParameters({
            pathParameters: serviceDefinition["path-parameters"],
            file,
        }),
        endpoints: Object.entries(serviceDefinition.endpoints).map(
            ([endpointKey, endpoint]): HttpEndpoint => ({
                ...convertDeclaration(endpoint),
                name: file.casingsGenerator.generateName(endpointKey),
                displayName: endpoint["display-name"],
                auth: endpoint.auth ?? serviceDefinition.auth,
                method: endpoint.method != null ? convertHttpMethod(endpoint.method) : HttpMethod.Post,
                path: constructHttpPath(endpoint.path),
                fullPath: constructHttpPath(urlJoin(serviceDefinition["base-path"], endpoint.path)),
                pathParameters: convertPathParameters({
                    pathParameters: endpoint["path-parameters"],
                    file,
                }),
                allPathParameters: convertPathParameters({
                    pathParameters: {
                        ...serviceDefinition["path-parameters"],
                        ...endpoint["path-parameters"],
                    },
                    file,
                }),
                queryParameters:
                    typeof endpoint.request !== "string" && endpoint.request?.["query-parameters"] != null
                        ? Object.entries(endpoint.request["query-parameters"]).map(
                              ([queryParameterKey, queryParameter]) => {
                                  const { name } = getQueryParameterName({ queryParameterKey, queryParameter });
                                  const valueType = file.parseTypeReference(queryParameter);
                                  return {
                                      ...convertDeclaration(queryParameter),
                                      name: file.casingsGenerator.generateNameAndWireValue({
                                          wireValue: queryParameterKey,
                                          name,
                                      }),
                                      valueType,
                                      allowMultiple:
                                          typeof queryParameter !== "string" && queryParameter["allow-multiple"] != null
                                              ? queryParameter["allow-multiple"]
                                              : false,
                                  };
                              }
                          )
                        : [],
                headers:
                    typeof endpoint.request !== "string" && endpoint.request?.headers != null
                        ? Object.entries(endpoint.request.headers).map(([headerKey, header]) =>
                              convertHttpHeader({ headerKey, header, file })
                          )
                        : [],
                requestBody: convertHttpRequestBody({ request: endpoint.request, file }),
                sdkRequest: convertHttpSdkRequest({ request: endpoint.request, file }),
                ...convertHttpResponse({ endpoint, file }),
                errors: [...convertResponseErrors({ errors: endpoint.errors, file }), ...globalErrors],
                examples:
                    endpoint.examples != null
                        ? endpoint.examples.map((example) =>
                              convertExampleEndpointCall({
                                  service: serviceDefinition,
                                  endpoint,
                                  example,
                                  typeResolver,
                                  errorResolver,
                                  exampleResolver,
                                  file,
                              })
                          )
                        : [],
            })
        ),
    };
}

function convertPathParameters({
    pathParameters,
    file,
}: {
    pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> | undefined;
    file: FernFileContext;
}): PathParameter[] {
    if (pathParameters == null) {
        return [];
    }
    return Object.entries(pathParameters).map(([parameterName, parameter]) =>
        convertPathParameter({
            parameterName,
            parameter,
            file,
        })
    );
}

function convertPathParameter({
    parameterName,
    parameter,
    file,
}: {
    parameterName: string;
    parameter: RawSchemas.HttpPathParameterSchema;
    file: FernFileContext;
}): PathParameter {
    return {
        ...convertDeclaration(parameter),
        name: file.casingsGenerator.generateName(parameterName),
        valueType: file.parseTypeReference(parameter),
    };
}

export function getQueryParameterName({
    queryParameterKey,
    queryParameter,
}: {
    queryParameterKey: string;
    queryParameter: RawSchemas.HttpQueryParameterSchema;
}): { name: string; wasExplicitlySet: boolean } {
    if (typeof queryParameter !== "string") {
        if (queryParameter.name != null) {
            return { name: queryParameter.name, wasExplicitlySet: true };
        }
    }
    return { name: queryParameterKey, wasExplicitlySet: false };
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
    file,
}: {
    headerKey: string;
    header: RawSchemas.HttpHeaderSchema;
    file: FernFileContext;
}): HttpHeader {
    const { name } = getHeaderName({ headerKey, header });
    return {
        ...convertDeclaration(header),
        name: file.casingsGenerator.generateNameAndWireValue({
            wireValue: headerKey,
            name,
        }),
        valueType: file.parseTypeReference(header),
    };
}

export function getHeaderName({ headerKey, header }: { headerKey: string; header: RawSchemas.HttpHeaderSchema }): {
    name: string;
    wasExplicitlySet: boolean;
} {
    if (typeof header !== "string") {
        if (header.name != null) {
            return {
                name: header.name,
                wasExplicitlySet: true,
            };
        }
    }
    return {
        name: headerKey,
        wasExplicitlySet: false,
    };
}
