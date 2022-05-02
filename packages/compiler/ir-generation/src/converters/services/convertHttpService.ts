import { FernFilepath, HttpAuth, HttpEndpoint, HttpMethod, HttpService } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { assertNever } from "../../utils/assertNever";
import { getDocs } from "../../utils/getDocs";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { convertResponseErrors } from "./convertResponseErrors";
import { convertWireMessage } from "./convertWireMessage";

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
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    return {
        docs: serviceDefinition.docs,
        auth: serviceDefinition.auth !== undefined ? convertHttpAuth(serviceDefinition.auth) : null,
        name: {
            name: serviceId,
            fernFilepath,
        },
        basePath: serviceDefinition["base-path"] ?? "/",
        headers:
            serviceDefinition.headers != null
                ? Object.entries(serviceDefinition.headers).map(([header, headerType]) => ({
                      header,
                      valueType: parseTypeReference(headerType),
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
                              valueType: parseTypeReference(parameterType),
                          }))
                        : [],
                queryParameters:
                    endpoint.queryParameters != null
                        ? Object.entries(endpoint.queryParameters).map(([parameterName, parameterType]) => ({
                              docs: typeof parameterType !== "string" ? parameterType.docs : undefined,
                              key: parameterName,
                              valueType: parseTypeReference(parameterType),
                          }))
                        : [],
                headers:
                    endpoint.headers != null
                        ? Object.entries(endpoint.headers).map(([header, headerType]) => ({
                              header,
                              valueType: parseTypeReference(headerType),
                              docs: getDocs(headerType),
                          }))
                        : [],
                request:
                    endpoint.request != null
                        ? convertWireMessage({ wireMessage: endpoint.request, fernFilepath, imports })
                        : undefined,
                response:
                    endpoint.response != null
                        ? convertWireMessage({ wireMessage: endpoint.response, fernFilepath, imports })
                        : undefined,
                errors: convertResponseErrors({ rawResponseErrors: endpoint.errors, fernFilepath, imports }),
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
        case "PATCH":
            return HttpMethod.Patch;
        case "DELETE":
            return HttpMethod.Delete;
        default:
            assertNever(method);
    }
}

function convertHttpAuth(auth: RawSchemas.AuthSchema): HttpAuth {
    switch (auth) {
        case "bearer":
            return HttpAuth.Bearer;
        default:
            assertNever(auth);
    }
}
