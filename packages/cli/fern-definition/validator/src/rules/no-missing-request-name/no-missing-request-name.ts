import { size } from "lodash-es";

import { isInlineRequestBody } from "@fern-api/fern-definition-schema";

import { Rule } from "../../Rule";

export const NoMissingRequestNameRule: Rule = {
    name: "no-missing-request-name",
    create: () => {
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint, service }) => {
                    if (typeof endpoint.request !== "string" && endpoint.request?.name != null) {
                        return [];
                    }

                    if (endpoint.request != null && typeof endpoint.request !== "string") {
                        if (endpoint.request.body != null && isInlineRequestBody(endpoint.request.body)) {
                            return [
                                {
                                    severity: "error",
                                    message: "Request name is required because request body is defined inline"
                                }
                            ];
                        }

                        if (
                            endpoint.request["query-parameters"] != null &&
                            size(endpoint.request["query-parameters"]) > 0
                        ) {
                            return [
                                {
                                    severity: "error",
                                    message: "Request name is required because request has query parameters"
                                }
                            ];
                        }

                        if (size(endpoint.request.headers) > 0) {
                            return [
                                {
                                    severity: "error",
                                    message: "Request name is required because request has headers"
                                }
                            ];
                        }
                    }

                    if (size(service.headers) > 0) {
                        return [
                            {
                                severity: "error",
                                message: "Request name is required because service has headers"
                            }
                        ];
                    }

                    return [];
                }
            }
        };
    }
};
