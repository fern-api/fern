import { Rule } from "../../Rule";

export const NoGetRequestBodyRule: Rule = {
    name: "no-get-request-body",
    create: () => {
        return {
            serviceFile: {
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.method === "GET" && endpoint.request != null) {
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
