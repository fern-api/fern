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
import { validateQueryParameterProperty, validateResponseProperty, validateResultsProperty } from "./validateUtils";

export async function validateCursorPagination({
    endpointId,
    endpoint,
    typeResolver,
    file,
    cursorPagination
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    cursorPagination: RawSchemas.CursorPaginationSchema;
}): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    violations.push(
        ...(await validateCursorProperty({
            endpointId,
            endpoint,
            typeResolver,
            file,
            cursorPagination
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
        ...(await validateNextCursorProperty({
            endpointId,
            typeResolver,
            file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
            resolvedResponseType,
            nextProperty: cursorPagination.next_cursor
        }))
    );

    violations.push(
        ...(await validateResultsProperty({
            endpointId,
            typeResolver,
            file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
            resolvedResponseType,
            resultsProperty: cursorPagination.results
        }))
    );

    return violations;
}

async function validateCursorProperty({
    endpointId,
    endpoint,
    typeResolver,
    file,
    cursorPagination
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    cursorPagination: RawSchemas.CursorPaginationSchema;
}): Promise<RuleViolation[]> {
    return await validateQueryParameterProperty({
        endpointId,
        endpoint,
        typeResolver,
        file,
        queryParameterProperty: cursorPagination.cursor,
        propertyValidator: {
            propertyID: "cursor",
            validate: isValidCursorProperty
        }
    });
}

async function validateNextCursorProperty({
    endpointId,
    typeResolver,
    file,
    resolvedResponseType,
    nextProperty
}: {
    endpointId: string;
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedResponseType: ResolvedType;
    nextProperty: string;
}): Promise<RuleViolation[]> {
    return await validateResponseProperty({
        endpointId,
        typeResolver,
        file,
        resolvedResponseType,
        responseProperty: nextProperty,
        propertyValidator: {
            propertyID: "next_cursor",
            validate: isValidCursorProperty
        }
    });
}

async function isValidCursorProperty({
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
        validate: isValidCursorType
    });
}

function isValidCursorType({ resolvedType }: { resolvedType: ResolvedType | undefined }): boolean {
    const primitiveType = maybePrimitiveType(resolvedType);
    if (primitiveType == null) {
        return false;
    }
    return primitiveType !== "BOOLEAN";
}
