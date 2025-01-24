import { getRequestBody } from "@fern-api/fern-definition-schema";

import { Rule } from "../../Rule";

export const NoGetRequestBodyRule: Rule = {
    name: "no-get-request-body",
    create: () => {
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.method === "GET" && getRequestBody(endpoint) != null) {
                        return [
                            {
                                severity: "fatal",
                                message: "Endpoint is a GET, so it cannot have a request body."
                            }
                        ];
                    }
                    return [];
                }
            }
        };
    }
};
