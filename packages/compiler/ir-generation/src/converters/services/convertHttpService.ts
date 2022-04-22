import { FernFilepath, HttpEndpoint, HttpMethod, HttpService } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { getDocs } from "../../utils/getDocs";
import { createInlinableTypeParser } from "../../utils/parseInlineType";
import { convertErrorReferences } from "./convertErrorReferences";

export function convertHttpService({
    serviceDefinition,
    serviceId,
    fernFilepath,
    imports,
}: {
    serviceDefinition: RawSchemas.HttpServiceSchema;
    serviceId: string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): HttpService {
    const parseInlinableType = createInlinableTypeParser({ fernFilepath, imports });

    return {
        docs: serviceDefinition.docs,
        name: {
            name: serviceId,
            fernFilepath,
        },
        displayName: serviceDefinition.name ?? serviceId,
        basePath: serviceDefinition["base-path"] ?? "/",
        headers:
            serviceDefinition.headers != null
                ? Object.entries(serviceDefinition.headers).map(([header, headerType]) => ({
                      header,
                      valueType: parseInlinableType(headerType),
                      docs: getDocs(headerType),
                  }))
                : [],
        endpoints: Object.entries(serviceDefinition.endpoints).map(
            ([endpointId, endpoint]): HttpEndpoint => ({
                endpointId,
                docs: endpoint.docs,
                method: convertHttpMethod(endpoint.method),
                path: endpoint.path,
                parameters:
                    endpoint.parameters != null
                        ? Object.entries(endpoint.parameters).map(([parameterName, parameterType]) => ({
                              docs: typeof parameterType !== "string" ? parameterType.docs : undefined,
                              key: parameterName,
                              valueType: parseInlinableType(parameterType),
                          }))
                        : [],
                queryParameters:
                    endpoint.queryParameters != null
                        ? Object.entries(endpoint.queryParameters).map(([parameterName, parameterType]) => ({
                              docs: typeof parameterType !== "string" ? parameterType.docs : undefined,
                              key: parameterName,
                              valueType: parseInlinableType(parameterType),
                          }))
                        : [],
                headers:
                    endpoint.headers != null
                        ? Object.entries(endpoint.headers).map(([header, headerType]) => ({
                              header,
                              valueType: parseInlinableType(headerType),
                              docs: getDocs(headerType),
                          }))
                        : [],
                request:
                    endpoint.request != null
                        ? {
                              docs: typeof endpoint.request !== "string" ? endpoint.request.type : undefined,
                              bodyType: parseInlinableType(endpoint.request),
                          }
                        : undefined,
                response:
                    endpoint.response != null
                        ? {
                              docs: typeof endpoint.response !== "string" ? endpoint.response.type : undefined,
                              bodyType: parseInlinableType(endpoint.response),
                          }
                        : undefined,
                errors: convertErrorReferences({ errors: endpoint.errors, fernFilepath, imports }),
            })
        ),
    };
}

function convertHttpMethod(method: RawSchemas.HttpEndpointSchema["method"]): HttpMethod {
    switch (method) {
        case "GET":
            return HttpMethod.Get;
        case "POST":
            return HttpMethod.Post;
        case "PUT":
            return HttpMethod.Put;
        case "DELETE":
            return HttpMethod.Delete;
        case "PATCH":
            return HttpMethod.Patch;
    }
}
