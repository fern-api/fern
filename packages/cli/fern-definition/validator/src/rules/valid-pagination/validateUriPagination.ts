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

export function validateUriPagination({
    endpointId,
    endpoint,
    typeResolver,
    file,
    uriPagination
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    uriPagination: RawSchemas.UriPaginationSchema;
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
        ...validateNextUriProperty({
            endpointId,
            typeResolver,
            file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
            resolvedResponseType,
            nextProperty: uriPagination.next_uri
        })
    );

    violations.push(
        ...validateResultsProperty({
            endpointId,
            typeResolver,
            file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
            resolvedResponseType,
            resultsProperty: uriPagination.results
        })
    );

    return violations;
}

function validateNextUriProperty({
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
            propertyID: "next_uri",
            validate: isValidUriProperty
        }
    });
}

function isValidUriProperty({
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
        validate: isValidUriType
    });
}

function isValidUriType({ resolvedType }: { resolvedType: ResolvedType | undefined }): boolean {
    const primitiveType = maybePrimitiveType(resolvedType);
    return primitiveType === "STRING";
}
