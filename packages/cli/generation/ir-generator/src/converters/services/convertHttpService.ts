import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpEndpoint, HttpHeader, HttpMethod, HttpService, PathParameter } from "@fern-fern/ir-model/services/http";
import { FernFileContext } from "../../FernFileContext";
import { ErrorResolver } from "../../resolvers/ErrorResolver";
import { convertDeclaration } from "../convertDeclaration";
import { constructHttpPath } from "./constructHttpPath";
import { convertHttpRequest } from "./convertHttpRequest";
import { convertHttpResponse } from "./convertHttpResponse";
import { convertResponseErrors } from "./convertResponseErrors";
import { convertResponseErrorsV2 } from "./convertResponseErrorsV2";

export function convertHttpService({
    serviceDefinition,
    serviceId,
    file,
    errorResolver,
}: {
    serviceDefinition: RawSchemas.HttpServiceSchema;
    serviceId: string;
    file: FernFileContext;
    errorResolver: ErrorResolver;
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
                    endpoint["query-parameters"] != null
                        ? Object.entries(endpoint["query-parameters"]).map(([parameterName, parameter]) => {
                              const valueType = file.parseTypeReference(parameter);
                              return {
                                  ...convertDeclaration(parameter),
                                  name: file.casingsGenerator.generateWireCasingsV1({
                                      wireValue: parameterName,
                                      name:
                                          typeof parameter !== "string" && parameter.name != null
                                              ? parameter.name
                                              : parameterName,
                                  }),
                                  nameV2: file.casingsGenerator.generateNameAndWireValue({
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
                              convertHttpHeader({ headerKey, header, file })
                          )
                        : [],
                request: convertHttpRequest({ request: endpoint.request, file }),
                response: convertHttpResponse({ response: endpoint.response, file }),
                errors: convertResponseErrors({ errors: endpoint.errors, file }),
                errorsV2: convertResponseErrorsV2({ errors: endpoint.errors, file, errorResolver }),
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
    return {
        ...convertDeclaration(header),
        name: file.casingsGenerator.generateWireCasingsV1({
            wireValue: headerKey,
            name: typeof header !== "string" && header.name != null ? header.name : headerKey,
        }),
        nameV2: file.casingsGenerator.generateNameAndWireValue({
            wireValue: headerKey,
            name: typeof header !== "string" && header.name != null ? header.name : headerKey,
        }),
        valueType: file.parseTypeReference(header),
    };
}
