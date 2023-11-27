import { Rule } from "../../Rule";

export const NoMaybeStreamingRule: Rule = {
    name: "no-maybe-streaming",
    create: () => {
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.response != null && endpoint["response-stream"] != null) {
                        return [
                            {
                                severity: "error",
                                message: "You cannot specify both response and response-stream"
                            }
                        ];
                    } else {
                        return [];
                    }
                }
            }
        };
    }
};
