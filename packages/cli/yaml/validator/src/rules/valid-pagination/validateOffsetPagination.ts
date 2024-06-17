import { FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { RuleViolation } from "../../Rule";
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
