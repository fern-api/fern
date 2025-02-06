
import { HttpRequestSchema } from "@fern-api/fern-definition-schema/src/schemas";
import { Rule } from "../../Rule";

export const NoDuplicateExampleNamesRule: Rule = {
    name: "no-duplicate-example-names",
    create: () => {
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.request == null || typeof endpoint.request === "string" || endpoint.request?.body == null || typeof endpoint.request.body === "string") {
                        return [];
                    }
                    const violations = [];

                    if ()

                    for (const property of endpoint.request.body) {
                        if (property.style === "exploded") {
                            const type = property.valueType;
                            const isListType = 
                                type.container?.type === "list" ||
                                (type.container?.type === "optional" && type.container.value.container?.type === "list") ||
                                (type.container?.type === "nullable" && type.container.value.container?.type === "list");

                            if (!isListType) {
                                violations.push({
                                    severity: "fatal",
                                    message: `Property ${property.name.name} has style 'exploded' but is not a list type. Exploded properties must be lists.`
                                });
                            }
                        }
                    }

                    return violations;
                }
            }
        };
    }
};

function isHttpInlineRequestBodySchema(body: HttpRequestSchema): body is FernDefinition.HttpInlineRequestBodySchema {
    return typeof body === "object" && "properties" in body;
}

