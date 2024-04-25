import { FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { RuleViolation } from "../../Rule";
import {
    getRequestPropertyComponents,
    getResponsePropertyComponents,
    maybePrimitiveType,
    PropertyValidator,
    requestTypeHasProperty,
    resolvedTypeHasProperty
} from "../../utils/propertyValidatorUtils";

export function validateRefreshTokenRequestProperty({
    endpointId,
    endpoint,
    typeResolver,
    file,
    refreshTokenProperty
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    refreshTokenProperty: string;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const refreshTokenPropertyComponents = getRequestPropertyComponents(refreshTokenProperty);
    if (refreshTokenPropertyComponents == null) {
        violations.push({
            severity: "error",
            message: `OAuth configuration for endpoint ${chalk.bold(
                endpointId
            )} must define a dot-delimited 'refresh-token' property starting with $request (e.g. $request.refresh_token).`
        });
        return violations;
    }

    if (
        !requestTypeHasProperty({
            typeResolver,
            file,
            endpoint,
            propertyComponents: refreshTokenPropertyComponents,
            validate: isValidTokenType
        })
    ) {
        violations.push({
            severity: "error",
            message: `OAuth configuration for endpoint ${chalk.bold(
                endpointId
            )} specifies 'refresh-token' ${refreshTokenProperty}, which is not a valid 'refresh-token' type.`
        });
    }

    return violations;
}

export function validateAccessTokenResponseProperty({
    endpointId,
    typeResolver,
    file,
    resolvedResponseType,
    accessTokenProperty
}: {
    endpointId: string;
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedResponseType: ResolvedType;
    accessTokenProperty: string;
}): RuleViolation[] {
    return validateResponseProperty({
        endpointId,
        typeResolver,
        file,
        resolvedResponseType,
        responseProperty: accessTokenProperty,
        propertyValidator: {
            propertyID: "access-token",
            validate: isValidTokenProperty
        }
    });
}

export function validateRefreshTokenResponseProperty({
    endpointId,
    typeResolver,
    file,
    resolvedResponseType,
    refreshTokenProperty
}: {
    endpointId: string;
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedResponseType: ResolvedType;
    refreshTokenProperty: string;
}): RuleViolation[] {
    return validateResponseProperty({
        endpointId,
        typeResolver,
        file,
        resolvedResponseType,
        responseProperty: refreshTokenProperty,
        propertyValidator: {
            propertyID: "refresh-token",
            validate: isValidTokenProperty
        }
    });
}

export function validateExpiresInResponseProperty({
    endpointId,
    typeResolver,
    file,
    resolvedResponseType,
    expiresInProperty
}: {
    endpointId: string;
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedResponseType: ResolvedType;
    expiresInProperty: string;
}): RuleViolation[] {
    return validateResponseProperty({
        endpointId,
        typeResolver,
        file,
        resolvedResponseType,
        responseProperty: expiresInProperty,
        propertyValidator: {
            propertyID: "expires-in",
            validate: isValidExpiresInProperty
        }
    });
}

function isValidExpiresInProperty({
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
        validate: isValidExpiryType
    });
}

function isValidExpiryType(resolvedType: ResolvedType | undefined): boolean {
    const primitiveType = maybePrimitiveType(resolvedType);
    if (primitiveType == null) {
        return false;
    }
    return primitiveType === "INTEGER";
}

function isValidTokenProperty({
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
        validate: isValidTokenType
    });
}

function isValidTokenType(resolvedType: ResolvedType | undefined): boolean {
    const primitiveType = maybePrimitiveType(resolvedType);
    if (primitiveType == null) {
        return false;
    }
    return primitiveType === "STRING";
}

function validateResponseProperty({
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
    propertyValidator: PropertyValidator;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const responsePropertyComponents = getResponsePropertyComponents(responseProperty);
    if (responsePropertyComponents == null) {
        violations.push({
            severity: "error",
            message: `OAuth configuration for endpoint ${chalk.bold(endpointId)} must define a dot-delimited '${
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
            message: `OAuth configuration for endpoint ${chalk.bold(endpointId)} specifies '${
                propertyValidator.propertyID
            }' ${responseProperty}, which is not a valid '${propertyValidator.propertyID}' type.`
        });
    }

    return violations;
}
