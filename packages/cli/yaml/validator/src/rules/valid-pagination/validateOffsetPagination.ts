import { FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { RuleViolation } from "../../Rule";
import {
    maybeFileFromResolvedType,
    maybePrimitiveType,
    resolvedTypeHasProperty,
    resolveResponseType
} from "../../utils/propertyValidatorUtils";
import { validateQueryParameterProperty, validateResultsProperty } from "./validateUtils";

export async function validateOffsetPagination({
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
}): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    violations.push(
        ...(await validateOffsetProperty({
            endpointId,
            endpoint,
            typeResolver,
            file,
            offsetPagination
        }))
    );

    const resolvedResponseType = await resolveResponseType({ endpoint, typeResolver, file });
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

async function validateOffsetProperty({
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
}): Promise<RuleViolation[]> {
    return await validateQueryParameterProperty({
        endpointId,
        endpoint,
        typeResolver,
        file,
        queryParameterProperty: offsetPagination.offset,
        propertyValidator: {
            propertyID: "offset",
            validate: isValidOffsetProperty
        }
    });
}

async function isValidOffsetProperty({
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
        validate: isValidOffsetType
    });
}

function isValidOffsetType({ resolvedType }: { resolvedType: ResolvedType | undefined }): boolean {
    const primitiveType = maybePrimitiveType(resolvedType);
    if (primitiveType == null) {
        return false;
    }
    return primitiveType === "INTEGER" || primitiveType === "LONG" || primitiveType === "DOUBLE";
}
