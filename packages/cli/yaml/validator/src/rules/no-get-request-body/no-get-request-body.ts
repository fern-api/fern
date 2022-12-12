import { RawSchemas } from "@fern-api/yaml-schema";
import { Rule } from "../../Rule";

export const NoGetRequestBodyRule: Rule = {
    name: "no-get-request-body",
    create: () => {
        return {
            serviceFile: {
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.method === "GET" && hasRequestBody(endpoint.request)) {
                        return [
                            {
                                severity: "error",
                                message: "Endpoint is a GET, so it cannot have a request body.",
                            },
                        ];
                    }
                    return [];
                },
            },
        };
    },
};

function hasRequestBody(request: RawSchemas.HttpRequestSchema | string | undefined): boolean {
    return typeof request === "string" || request?.body != null;
}
