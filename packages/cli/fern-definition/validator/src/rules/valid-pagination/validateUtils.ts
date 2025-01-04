import chalk from "chalk";

import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule";
import {
    RequestPropertyValidator,
    ResponsePropertyValidator,
    getRequestPropertyComponents,
    getResponsePropertyComponents,
    requestTypeHasProperty,
    resolvedTypeHasProperty
} from "../../utils/propertyValidatorUtils";

export function validateResultsProperty({
    endpointId,
    typeResolver,
    file,
    resolvedResponseType,
    resultsProperty
}: {
    endpointId: string;
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedResponseType: ResolvedType;
    resultsProperty: string;
}): RuleViolation[] {
    return validateResponseProperty({
        endpointId,
        typeResolver,
        file,
        resolvedResponseType,
        responseProperty: resultsProperty,
        propertyValidator: {
            propertyID: "results",
            validate: isValidResultsProperty
        }
    });
}

export function validateRequestProperty({
    endpointId,
    endpoint,
    typeResolver,
    file,
    requestProperty,
    propertyValidator
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    requestProperty: string;
    propertyValidator: RequestPropertyValidator;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const requestPropertyComponents = getRequestPropertyComponents(requestProperty);
    if (requestPropertyComponents == null) {
        violations.push({
            severity: "error",
            message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} must define a dot-delimited '${
                propertyValidator.propertyID
            }' property starting with $request (e.g. $request.${propertyValidator.propertyID}).`
        });
        return violations;
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
        violations.push({
            severity: "error",
            message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} specifies '${
                propertyValidator.propertyID
            }' ${requestProperty}, which is not a valid '${propertyValidator.propertyID}' type.`
        });
    }

    return violations;
}

export function validateResponseProperty({
    endpointId,
    typeResolver,
    file,
    resolvedResponseType,
    responseProperty,
    propertyValidator
}: {
    endpointId: string;
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedResponseType: ResolvedType;
    responseProperty: string;
    propertyValidator: ResponsePropertyValidator;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const responsePropertyComponents = getResponsePropertyComponents(responseProperty);
    if (responsePropertyComponents == null) {
        violations.push({
            severity: "error",
            message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} must define a dot-delimited '${
                propertyValidator.propertyID
            }' property starting with $response (e.g. $response.${propertyValidator.propertyID}).`
        });
    }

    if (
        responsePropertyComponents != null &&
        !propertyValidator.validate({
            typeResolver,
            file,
            resolvedType: resolvedResponseType,
            propertyComponents: responsePropertyComponents
        })
    ) {
        violations.push({
            severity: "error",
            message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} specifies '${
                propertyValidator.propertyID
            }' ${responseProperty}, which is not a valid '${propertyValidator.propertyID}' type.`
        });
    }

    return violations;
}

function isValidResultsProperty({
    typeResolver,
    file,
    resolvedType,
    propertyComponents
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedType: ResolvedType | undefined;
    propertyComponents: string[];
}): boolean {
    return resolvedTypeHasProperty({
        typeResolver,
        file,
        resolvedType,
        propertyComponents,
        validate: isValidResultsType
    });
}

function isValidResultsType({ resolvedType }: { resolvedType: ResolvedType | undefined }): boolean {
    return true;
}
