import { RawSchemas } from "@fern-api/fern-definition-schema";
import {
    constructFernFileContext,
    FernFileContext,
    ResolvedType,
    TypeResolver,
    TypeResolverImpl
} from "@fern-api/ir-generator";

import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import {
    getRequestPropertyComponents,
    maybePrimitiveType,
    RequestPropertyValidator,
    requestTypeHasProperty
} from "../../utils/propertyValidatorUtils";

export const ValidStreamConditionRule: Rule = {
    name: "valid-stream-condition",
    create: ({ workspace }) => {
        return {
            definitionFile: {
                streamCondition: (
                    { endpoint, streamCondition: rawStreamCondition },
                    { relativeFilepath, contents: definitionFile }
                ) => {
                    const typeResolver = new TypeResolverImpl(workspace);

                    const file = constructFernFileContext({
                        relativeFilepath,
                        definitionFile,
                        casingsGenerator: CASINGS_GENERATOR,
                        rootApiFile: workspace.definition.rootApiFile.contents
                    });

                    if (endpoint.response == null || endpoint["response-stream"] == null) {
                        if (rawStreamCondition == null) {
                            return [];
                        }
                        return [
                            {
                                severity: "fatal",
                                message:
                                    "stream-condition can only be used if both response and response-stream are specified."
                            }
                        ];
                    }

                    if (rawStreamCondition == null) {
                        return [
                            {
                                severity: "fatal",
                                message:
                                    "stream-condition must be specified when both response and response-stream are specified."
                            }
                        ];
                    }

                    return validateRequestProperty({
                        endpoint,
                        typeResolver,
                        file,
                        requestProperty: rawStreamCondition,
                        propertyValidator: {
                            propertyID: "stream-condition",
                            validate: isValidStreamCondition
                        }
                    });
                }
            }
        };
    }
};

function isValidStreamCondition({ resolvedType }: { resolvedType: ResolvedType | undefined }): boolean {
    const primitiveType = maybePrimitiveType(resolvedType);
    if (primitiveType == null) {
        return false;
    }
    return primitiveType === "BOOLEAN";
}

export function validateRequestProperty({
    endpoint,
    typeResolver,
    file,
    requestProperty,
    propertyValidator
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    requestProperty: string;
    propertyValidator: RequestPropertyValidator;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const requestPropertyComponents = getRequestPropertyComponents(requestProperty);

    if (requestPropertyComponents == null) {
        return [
            {
                severity: "fatal",
                message: "Please specify path to a valid property (e.g. $request.stream)"
            }
        ];
    }

    if (
        !requestTypeHasProperty({
            typeResolver,
            file,
            endpoint,
            propertyComponents: requestPropertyComponents,
            validate: propertyValidator.validate
        })
    ) {
        return [
            {
                severity: "fatal",
                message: `Property "${requestProperty}" does not exist on the request.`
            }
        ];
    }

    return violations;
}
