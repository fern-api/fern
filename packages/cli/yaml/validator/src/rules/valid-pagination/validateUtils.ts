import { FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { RuleViolation } from "../../Rule";
import {
    getRequestPropertyComponents,
    getResponsePropertyComponents,
    maybeFileFromResolvedType,
    resolvedTypeHasProperty,
    ResponsePropertyValidator
} from "../../utils/propertyValidatorUtils";

export async function validateResultsProperty({
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
}): Promise<RuleViolation[]> {
    return await validateResponseProperty({
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

export async function validateQueryParameterProperty({
    endpointId,
    endpoint,
    typeResolver,
    file,
    queryParameterProperty,
    propertyValidator
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    queryParameterProperty: string;
    propertyValidator: ResponsePropertyValidator;
}): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    const queryPropertyComponents = getRequestPropertyComponents(queryParameterProperty);
    if (queryPropertyComponents == null) {
        violations.push({
            severity: "error",
            message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} must define a dot-delimited '${
                propertyValidator.propertyID
            }' property starting with $request (e.g. $request.${propertyValidator.propertyID}).`
        });
        return violations;
    }

    const queryPropertyName = queryPropertyComponents?.[0];
    if (queryPropertyName == null || queryPropertyComponents.length !== 1) {
        violations.push({
            severity: "error",
            message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} is only compatible with '${
                propertyValidator.propertyID
            }' properties that are defined as query parameters (e.g. $request.${propertyValidator.propertyID}).`
        });
        return violations;
    }

    const queryParameters = typeof endpoint.request !== "string" ? endpoint.request?.["query-parameters"] : null;
    if (queryParameters == null) {
        violations.push({
            severity: "error",
            message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} specifies '${
                propertyValidator.propertyID
            }' ${queryParameterProperty}, but that query parameter does not exist.`
        });
        return violations;
    }

    const queryParameter = queryParameters[queryPropertyName];
    if (queryParameter == null) {
        violations.push({
            severity: "error",
            message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} specifies '${
                propertyValidator.propertyID
            }' ${queryParameterProperty}, but that query parameter does not exist.`
        });
        return violations;
    }

    const queryParameterType = typeof queryParameter !== "string" ? queryParameter.type : queryParameter;
    const resolvedQueryParameterType = await typeResolver.resolveType({
        type: queryParameterType,
        file
    });
    if (
        !(await propertyValidator.validate({
            typeResolver,
            file: maybeFileFromResolvedType(resolvedQueryParameterType) ?? file,
            resolvedType: resolvedQueryParameterType,
            propertyComponents: queryPropertyComponents.slice(1)
        }))
    ) {
        violations.push({
            severity: "error",
            message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} specifies '${
                propertyValidator.propertyID
            }' ${queryParameterProperty}, which is not a valid '${propertyValidator.propertyID}' type.`
        });
    }

    return violations;
}

export async function validateResponseProperty({
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
}): Promise<RuleViolation[]> {
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
        !(await propertyValidator.validate({
            typeResolver,
            file,
            resolvedType: resolvedResponseType,
            propertyComponents: responsePropertyComponents
        }))
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

async function isValidResultsProperty({
    typeResolver,
    file,
    resolvedType,
    propertyComponents
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedType: ResolvedType | undefined;
    propertyComponents: string[];
}): Promise<boolean> {
    return await resolvedTypeHasProperty({
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
