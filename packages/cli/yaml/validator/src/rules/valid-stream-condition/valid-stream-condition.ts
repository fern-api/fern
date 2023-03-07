import { constructStreamCondition, ResolvedType } from "@fern-api/ir-generator";
import { PrimitiveType } from "@fern-fern/ir-model/types";
import { Rule } from "../../Rule";
import { getAllPropertiesForRequest } from "../../utils/getAllPropertiesForRequest";

export const ValidStreamConditionRule: Rule = {
    name: "valid-stream-condition",
    create: async ({ workspace }) => {
        return {
            serviceFile: {
                streamCondition: ({ endpoint, streamCondition }, { relativeFilepath, contents }) => {
                    if (endpoint.response == null || endpoint["response-stream"] == null) {
                        if (streamCondition == null) {
                            return [];
                        }
                        return [
                            {
                                severity: "error",
                                message:
                                    "stream-condition can only be used if both response and response-stream are specified.",
                            },
                        ];
                    }

                    if (streamCondition == null) {
                        return [
                            {
                                severity: "error",
                                message:
                                    "stream-condition must be specified when both response and response-stream are specified.",
                            },
                        ];
                    }

                    const parsedStreamCondition = constructStreamCondition(streamCondition);
                    if (parsedStreamCondition == null) {
                        return [
                            {
                                severity: "error",
                                message:
                                    "stream-condition is not valid. You should specify a selector for a boolean request body property, e.g. $request.yourProperty.",
                            },
                        ];
                    }

                    const properties = getAllPropertiesForRequest({
                        endpoint,
                        filepath: relativeFilepath,
                        serviceFile: contents,
                        workspace,
                    });

                    if (properties == null) {
                        return [
                            {
                                severity: "error",
                                message:
                                    "A request body is required when the response can be either streaming or non-streaming.",
                            },
                        ];
                    }

                    const streamConditionProperty = properties.find(
                        (property) => property.wireKey === parsedStreamCondition.requestPropertyKey
                    );

                    if (streamConditionProperty == null) {
                        return [
                            {
                                severity: "error",
                                message: `Property "${parsedStreamCondition.requestPropertyKey}" does not exist on the request.`,
                            },
                        ];
                    }

                    if (!isBooleanOrOptionalBoolean(streamConditionProperty.resolvedPropertyType)) {
                        return [
                            {
                                severity: "error",
                                message: `Property "${parsedStreamCondition.requestPropertyKey}" is not a boolean.`,
                            },
                        ];
                    }

                    return [];
                },
            },
        };
    },
};

function isBooleanOrOptionalBoolean(resolvedType: ResolvedType): boolean {
    if (resolvedType._type === "primitive") {
        return resolvedType.primitive === PrimitiveType.Boolean;
    }
    return (
        resolvedType._type === "container" &&
        resolvedType.container._type === "optional" &&
        isBooleanOrOptionalBoolean(resolvedType.container.itemType)
    );
}
