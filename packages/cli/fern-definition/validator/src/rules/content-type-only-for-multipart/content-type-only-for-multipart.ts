import { isInlineRequestBody, parseFileUploadRequest } from "@fern-api/fern-definition-schema";

import { Rule, RuleViolation } from "../../Rule";

export const ContentTypeOnlyForMultipartRule: Rule = {
    name: "content-type-only-for-multipart",
    DISABLE_RULE: false,
    create: () => {
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.request == null) {
                        return [];
                    }

                    const parsedFileUploadRequest = parseFileUploadRequest(endpoint.request);
                    if (parsedFileUploadRequest != null) {
                        return [];
                    }

                    if (
                        typeof endpoint.request !== "string" &&
                        endpoint.request.body != null &&
                        isInlineRequestBody(endpoint.request.body)
                    ) {
                        const violations: RuleViolation[] = [];
                        for (const [propertyName, propertyDeclaration] of Object.entries(
                            endpoint.request.body.properties ?? {}
                        )) {
                            if (typeof propertyDeclaration === "string") {
                                continue;
                            }
                            if (propertyDeclaration["content-type"] != null) {
                                violations.push({
                                    severity: "error",
                                    message: `${propertyName} has content-type, but the request is not multipart`
                                });
                            }
                        }
                        return violations;
                    }

                    return [];
                }
            }
        };
    }
};
