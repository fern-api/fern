import chalk from "chalk";

import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule";
import { getPathFromSelector } from "../../utils/property-validator/getPathFromSelector";
import { validatePropertyInType } from "../../utils/property-validator/validatePropertyInType";
import { maybeFileFromResolvedType, maybePrimitiveType, resolveResponseType } from "../../utils/propertyValidatorUtils";
import { validateRequestProperty, validateResultsProperty } from "./validateUtils";

export function validateOffsetPagination({
    endpointId,
    endpoint,
    typeResolver,
    file,
    offsetPagination
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    offsetPagination: RawSchemas.OffsetPaginationSchema;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    violations.push(
        ...validateOffsetProperty({
            endpointId,
            endpoint,
            typeResolver,
            file,
            offsetPagination
        })
    );

    violations.push(
        ...validateStepProperty({
            endpointId,
            endpoint,
            typeResolver,
            file,
            offsetPagination
        })
    );

    const resolvedResponseType = resolveResponseType({ endpoint, typeResolver, file });
    if (resolvedResponseType == null) {
        violations.push({
            severity: "error",
            message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} must define a response type.`
        });
        return violations;
    }

    violations.push(
        ...validateResultsProperty({
            endpointId,
            typeResolver,
            file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
            resolvedResponseType,
            resultsProperty: offsetPagination.results
        })
    );

    violations.push(
        ...validateHasNextPageProperty({
            endpointId,
            resolvedResponseType,
            typeResolver,
            file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
            offsetPagination
        })
    );

    return violations;
}

function validateOffsetProperty({
    endpointId,
    endpoint,
    typeResolver,
    file,
    offsetPagination
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    offsetPagination: RawSchemas.OffsetPaginationSchema;
}): RuleViolation[] {
    return validateRequestProperty({
        endpointId,
        endpoint,
        typeResolver,
        file,
        requestProperty: offsetPagination.offset,
        propertyValidator: {
            propertyID: "offset",
            validate: isValidOffsetType
        }
    });
}

function validateStepProperty({
    endpointId,
    endpoint,
    typeResolver,
    file,
    offsetPagination
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    offsetPagination: RawSchemas.OffsetPaginationSchema;
}): RuleViolation[] {
    if (offsetPagination.step == null) {
        return [];
    }
    return validateRequestProperty({
        endpointId,
        endpoint,
        typeResolver,
        file,
        requestProperty: offsetPagination.step,
        propertyValidator: {
            propertyID: "step",
            validate: isValidOffsetType
        }
    });
}

function isValidOffsetType({ resolvedType }: { resolvedType: ResolvedType | undefined }): boolean {
    const primitiveType = maybePrimitiveType(resolvedType);
    if (primitiveType == null) {
        return false;
    }
    return primitiveType === "INTEGER" || primitiveType === "LONG" || primitiveType === "DOUBLE";
}

function validateHasNextPageProperty({
    resolvedResponseType,
    typeResolver,
    file,
    offsetPagination
}: {
    endpointId: string;
    resolvedResponseType: ResolvedType;
    typeResolver: TypeResolver;
    file: FernFileContext;
    offsetPagination: RawSchemas.OffsetPaginationSchema;
}): RuleViolation[] {
    if (offsetPagination["has-next-page"] == null) {
        return [];
    }
    return validatePropertyInType({
        typeResolver,
        file,
        path: getPathFromSelector(offsetPagination["has-next-page"]),
        resolvedType: resolvedResponseType,
        validate: ({ resolvedType }) => {
            const primitiveType = maybePrimitiveType(resolvedType);
            if (primitiveType !== "BOOLEAN") {
                return [
                    {
                        message: `"has-next-page" selector, ${offsetPagination["has-next-page"]}, does not point to a boolean property`,
                        severity: "error"
                    }
                ];
            }
            return [];
        }
    });
}
