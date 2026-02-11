import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";
import chalk from "chalk";

import { RuleViolation } from "../../Rule.js";
import {
    maybeFileFromResolvedType,
    maybePrimitiveType,
    resolvedTypeHasProperty,
    resolveResponseType
} from "../../utils/propertyValidatorUtils.js";
import { validateResponseProperty, validateResultsProperty } from "./validateUtils.js";

export function validatePathPagination({
    endpointId,
    endpoint,
    typeResolver,
    file,
    pathPagination
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    pathPagination: RawSchemas.PathPaginationSchema;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const resolvedResponseType = resolveResponseType({ endpoint, typeResolver, file });
    if (resolvedResponseType == null) {
        violations.push({
            severity: "fatal",
            message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} must define a response type.`
        });
        return violations;
    }

    violations.push(
        ...validateNextPathProperty({
            endpointId,
            typeResolver,
            file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
            resolvedResponseType,
            nextProperty: pathPagination.next_path
        })
    );

    violations.push(
        ...validateResultsProperty({
            endpointId,
            typeResolver,
            file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
            resolvedResponseType,
            resultsProperty: pathPagination.results
        })
    );

    return violations;
}

function validateNextPathProperty({
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
}): RuleViolation[] {
    return validateResponseProperty({
        endpointId,
        typeResolver,
        file,
        resolvedResponseType,
        responseProperty: nextProperty,
        propertyValidator: {
            propertyID: "next_path",
            validate: isValidPathProperty
        }
    });
}

function isValidPathProperty({
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
        validate: isValidPathType
    });
}

function isValidPathType({ resolvedType }: { resolvedType: ResolvedType | undefined }): boolean {
    const primitiveType = maybePrimitiveType(resolvedType);
    return primitiveType === "STRING";
}
