import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpEndpoint, HttpHeader, HttpMethod, HttpService, PathParameter } from "@fern-fern/ir-model/services/http";
import { FernFileContext } from "../../FernFileContext";
import { ErrorResolver } from "../../resolvers/ErrorResolver";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { convertDeclaration } from "../convertDeclaration";
import { constructHttpPath } from "./constructHttpPath";
import { convertExampleEndpointCall } from "./convertExampleEndpointCall";
import { convertHttpRequestBody } from "./convertHttpRequestBody";
import { convertHttpResponse } from "./convertHttpResponse";
import { convertHttpSdkRequest } from "./convertHttpSdkRequest";
import { convertResponseErrors } from "./convertResponseErrors";
import { convertResponseErrorsV2 } from "./convertResponseErrorsV2";

export function convertHttpService({
    serviceDefinition,
    serviceId,
    file,
    errorResolver,
    typeResolver,
    exampleResolver,
}: {
    serviceDefinition: RawSchemas.HttpServiceSchema;
    serviceId: string;
    file: FernFileContext;
    errorResolver: ErrorResolver;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
}): HttpService {
    return {
        ...convertDeclaration(serviceDefinition),
        name: {
            name: serviceId,
            fernFilepath: file.fernFilepath,
            fernFilepathV2: file.fernFilepathV2,
        },
        basePath: serviceDefinition["base-path"],
        basePathV2: constructHttpPath(serviceDefinition["base-path"]),
        headers:
            serviceDefinition.headers != null
                ? Object.entries(serviceDefinition.headers).map(([headerKey, header]) =>
                      convertHttpHeader({ headerKey, header, file })
                  )
                : [],
        pathParameters:
            serviceDefinition["path-parameters"] != null
                ? Object.entries(serviceDefinition["path-parameters"]).map(([parameterName, parameter]) =>
                      convertPathParameter({
                          parameterName,
                          parameter,
                          file,
                      })
                  )
                : [],
        endpoints: Object.entries(serviceDefinition.endpoints).map(
            ([endpointKey, endpoint]): HttpEndpoint => ({
                ...convertDeclaration(endpoint),
                id: endpointKey,
                displayName: endpoint["display-name"],
                name: file.casingsGenerator.generateNameCasingsV1(endpointKey),
                nameV2: file.casingsGenerator.generateName(endpointKey),
                auth: endpoint.auth ?? serviceDefinition.auth,
                method: endpoint.method != null ? convertHttpMethod(endpoint.method) : HttpMethod.Post,
                path: constructHttpPath(endpoint.path),
                pathParameters:
                    endpoint["path-parameters"] != null
                        ? Object.entries(endpoint["path-parameters"]).map(([parameterName, parameter]) =>
                              convertPathParameter({
                                  parameterName,
                                  parameter,
                                  file,
                              })
                          )
                        : [],
                queryParameters:
                    typeof endpoint.request !== "string" && endpoint.request?.["query-parameters"] != null
                        ? Object.entries(endpoint.request["query-parameters"]).map(
                              ([queryParameterKey, queryParameter]) => {
                                  const { name } = getQueryParameterName({ queryParameterKey, queryParameter });
                                  const valueType = file.parseTypeReference(queryParameter);
                                  return {
                                      ...convertDeclaration(queryParameter),
                                      name: file.casingsGenerator.generateWireCasingsV1({
                                          wireValue: queryParameterKey,
                                          name,
                                      }),
                                      nameV2: file.casingsGenerator.generateNameAndWireValue({
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
                response: convertHttpResponse({ response: endpoint.response, file }),
                errors: convertResponseErrors({ errors: endpoint.errors, file }),
                errorsV2: convertResponseErrorsV2({ errors: endpoint.errors, file, errorResolver }),
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
        name: file.casingsGenerator.generateNameCasingsV1(parameterName),
        nameV2: file.casingsGenerator.generateName(parameterName),
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
        name: file.casingsGenerator.generateWireCasingsV1({
            wireValue: headerKey,
            name,
        }),
        nameV2: file.casingsGenerator.generateNameAndWireValue({
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
