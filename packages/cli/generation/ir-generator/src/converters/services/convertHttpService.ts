import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpEndpoint, HttpHeader, HttpMethod, HttpService, PathParameter } from "@fern-fern/ir-model/services/http";
import { FernFileContext } from "../../FernFileContext";
import { generateStringWithAllCasings, generateWireStringWithAllCasings } from "../../utils/generateCasings";
import { getDocs } from "../../utils/getDocs";
import { constructHttpPath } from "./constructHttpPath";
import { convertHttpRequest } from "./convertHttpRequest";
import { convertHttpResponse } from "./convertHttpResponse";
import { convertResponseErrors } from "./convertResponseErrors";

export function convertHttpService({
    serviceDefinition,
    serviceId,
    file,
}: {
    serviceDefinition: RawSchemas.HttpServiceSchema;
    serviceId: string;
    file: FernFileContext;
}): HttpService {
    return {
        docs: serviceDefinition.docs,
        name: {
            name: serviceId,
            fernFilepath: file.fernFilepath,
        },
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
                id: endpointKey,
                name: generateStringWithAllCasings(endpointKey),
                auth: endpoint.auth ?? serviceDefinition.auth,
                docs: endpoint.docs,
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
                              convertHttpHeader({ headerKey, header, file })
                          )
                        : [],
                request: convertHttpRequest({ request: endpoint.request, file }),
                response: convertHttpResponse({ response: endpoint.response, file }),
                errors: convertResponseErrors({ errors: endpoint.errors, file }),
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
        docs: typeof parameter !== "string" ? parameter.docs : undefined,
        name: generateStringWithAllCasings(parameterName),
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
        name: generateWireStringWithAllCasings({
            wireValue: headerKey,
            name: typeof header !== "string" && header.name != null ? header.name : headerKey,
        }),
        valueType: file.parseTypeReference(header),
        docs: getDocs(header),
    };
}
