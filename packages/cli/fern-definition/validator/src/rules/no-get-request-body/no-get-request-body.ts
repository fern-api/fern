import { getRequestBody } from "@fern-api/fern-definition-schema"

import { Rule } from "../../Rule"

export const NoGetRequestBodyRule: Rule = {
    name: "no-get-request-body",
    create: () => {
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }) => {
                    const method = endpoint.method
                    if ((method === "GET" || method === "HEAD") && getRequestBody(endpoint) != null) {
                        return [
                            {
                                severity: "fatal",
                                message: `Endpoint is a ${method}, so it cannot have a request body.`
                            }
                        ]
                    }
                    return []
                }
            }
        }
    }
}
