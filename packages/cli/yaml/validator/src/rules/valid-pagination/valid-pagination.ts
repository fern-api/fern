import {
    constructFernFileContext,
    FernFileContext,
    ResolvedType,
    TypeResolver,
    TypeResolverImpl
} from "@fern-api/ir-generator";
import { isRawObjectDefinition, RawSchemas } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

const REQUEST_PREFIX = "$request.";
const RESPONSE_PREFIX = "$response.";

interface PropertyValidator {
    propertyID: string;
    validate: PropertyValidatorFunc;
}

type PropertyValidatorFunc = ({
    typeResolver,
    file,
    resolvedType,
    propertyComponents
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedType: ResolvedType | undefined;
    propertyComponents: string[];
}) => boolean;

export const ValidPaginationRule: Rule = {
    name: "valid-pagination",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        const defaultPagination = workspace.definition.rootApiFile.contents.pagination;

        return {
            definitionFile: {
                httpEndpoint: ({ endpointId, endpoint }, { relativeFilepath, contents: definitionFile }) => {
                    const endpointPagination =
                        typeof endpoint.pagination === "boolean" ? defaultPagination : endpoint.pagination;
                    if (!endpointPagination) {
                        return [];
                    }

                    const file = constructFernFileContext({
                        relativeFilepath,
                        definitionFile,
                        casingsGenerator: CASINGS_GENERATOR,
                        rootApiFile: workspace.definition.rootApiFile.contents
                    });

                    if (isRawCursorPaginationSchema(endpointPagination)) {
                        return validateCursorPagination({
                            endpointId,
                            endpoint,
                            typeResolver,
                            file,
                            cursorPagination: endpointPagination
                        });
                    }
                    return validateOffsetPagination({
                        endpointId,
                        endpoint,
                        typeResolver,
                        file,
                        offsetPagination: endpointPagination
                    });
                }
            }
        };
    }
};

function validateCursorPagination({
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
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    violations.push(
        ...validateCursorProperty({
            endpointId,
            endpoint,
            typeResolver,
            file,
            cursorPagination
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
        ...validateNextCursorProperty({
            endpointId,
            typeResolver,
            file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
            resolvedResponseType,
            nextProperty: cursorPagination.next_cursor
        })
    );

    violations.push(
        ...validateResultsProperty({
            endpointId,
            typeResolver,
            file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
            resolvedResponseType,
            resultsProperty: cursorPagination.results
        })
    );

    return violations;
}

function validateOffsetPagination({
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

function validateCursorProperty({
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
}): RuleViolation[] {
    return validateQueryParameterProperty({
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
    return validateQueryParameterProperty({
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

function validateNextCursorProperty({
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
            propertyID: "next_cursor",
            validate: isValidCursorProperty
        }
    });
}

function validateResultsProperty({
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

function validateQueryParameterProperty({
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
    propertyValidator: PropertyValidator;
}): RuleViolation[] {
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
    const resolvedQueryParameterType = typeResolver.resolveType({
        type: queryParameterType,
        file
    });
    if (
        !propertyValidator.validate({
            typeResolver,
            file: maybeFileFromResolvedType(resolvedQueryParameterType) ?? file,
            resolvedType: resolvedQueryParameterType,
            propertyComponents: queryPropertyComponents.slice(1)
        })
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

function isValidOffsetProperty({
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
        validate: isValidOffsetType
    });
}

function isValidCursorProperty({
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
        validate: isValidCursorType
    });
}

function resolvedTypeHasProperty({
    typeResolver,
    file,
    resolvedType,
    propertyComponents,
    validate
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedType: ResolvedType | undefined;
    propertyComponents: string[];
    validate: (resolvedType: ResolvedType | undefined) => boolean;
}): boolean {
    if (propertyComponents.length === 0) {
        return validate(resolvedType);
    }
    const objectSchema = maybeObjectSchema(resolvedType);
    if (objectSchema == null) {
        return false;
    }
    const property = getPropertyTypeFromObjectSchema({
        typeResolver,
        file,
        objectSchema,
        property: propertyComponents[0] ?? ""
    });
    if (property == null) {
        return false;
    }
    const resolvedTypeProperty = typeResolver.resolveType({
        type: property,
        file
    });
    return resolvedTypeHasProperty({
        typeResolver,
        file: maybeFileFromResolvedType(resolvedTypeProperty) ?? file,
        resolvedType: resolvedTypeProperty,
        propertyComponents: propertyComponents.slice(1),
        validate
    });
}

function getPropertyTypeFromObjectSchema({
    typeResolver,
    file,
    objectSchema,
    property
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    objectSchema: RawSchemas.ObjectSchema;
    property: string;
}): string | undefined {
    const properties = getAllPropertiesForRawObjectSchema({
        typeResolver,
        file,
        objectSchema
    });
    return properties[property];
}

function getAllPropertiesForRawObjectSchema({
    typeResolver,
    file,
    objectSchema
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    objectSchema: RawSchemas.ObjectSchema;
}): Record<string, string> {
    let extendedTypes: string[] = [];
    if (typeof objectSchema.extends === "string") {
        extendedTypes = [objectSchema.extends];
    } else if (Array.isArray(objectSchema.extends)) {
        extendedTypes = objectSchema.extends;
    }

    const properties: Record<string, string> = {};
    for (const extendedType of extendedTypes) {
        const extendedProperties = getAllPropertiesForExtendedType({
            typeResolver,
            file,
            extendedType
        });
        Object.entries(extendedProperties).map(([propertyKey, propertyType]) => {
            properties[propertyKey] = propertyType;
        });
    }

    if (objectSchema.properties != null) {
        Object.entries(objectSchema.properties).map(([propertyKey, propertyType]) => {
            properties[propertyKey] = typeof propertyType === "string" ? propertyType : propertyType.type;
        });
    }

    return properties;
}

function getAllPropertiesForExtendedType({
    typeResolver,
    file,
    extendedType
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    extendedType: string;
}): Record<string, string> {
    const resolvedType = typeResolver.resolveNamedTypeOrThrow({
        referenceToNamedType: extendedType,
        file
    });
    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return getAllPropertiesForRawObjectSchema({
            typeResolver,
            file: maybeFileFromResolvedType(resolvedType) ?? file,
            objectSchema: resolvedType.declaration
        });
    }
    return {};
}

function resolveResponseType({
    endpoint,
    typeResolver,
    file
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): ResolvedType | undefined {
    const responseType = typeof endpoint.response !== "string" ? endpoint.response?.type : endpoint.response;
    if (responseType == null) {
        return undefined;
    }
    return typeResolver.resolveType({
        type: responseType,
        file
    });
}

function isValidCursorType(resolvedType: ResolvedType | undefined): boolean {
    const primitiveType = maybePrimitiveType(resolvedType);
    if (primitiveType == null) {
        return false;
    }
    return primitiveType !== "BOOLEAN";
}

function isValidOffsetType(resolvedType: ResolvedType | undefined): boolean {
    const primitiveType = maybePrimitiveType(resolvedType);
    if (primitiveType == null) {
        return false;
    }
    return primitiveType === "INTEGER" || primitiveType === "LONG" || primitiveType === "DOUBLE";
}

function isValidResultsType(resolvedType: ResolvedType | undefined): boolean {
    return true;
}

function maybeObjectSchema(resolvedType: ResolvedType | undefined): RawSchemas.ObjectSchema | undefined {
    if (resolvedType == null) {
        return undefined;
    }
    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return resolvedType.declaration;
    }
    if (resolvedType._type === "container" && resolvedType.container._type === "optional") {
        return maybeObjectSchema(resolvedType.container.itemType);
    }
    return undefined;
}

function maybePrimitiveType(resolvedType: ResolvedType | undefined): string | undefined {
    if (resolvedType?._type === "primitive") {
        return resolvedType.primitive;
    }
    if (resolvedType?._type === "container" && resolvedType.container._type === "optional") {
        return maybePrimitiveType(resolvedType.container.itemType);
    }
    return undefined;
}

function maybeFileFromResolvedType(resolvedType: ResolvedType | undefined): FernFileContext | undefined {
    if (resolvedType == null) {
        return undefined;
    }
    if (resolvedType._type === "named") {
        return resolvedType.file;
    }
    if (resolvedType._type === "container" && resolvedType.container._type === "optional") {
        return maybeFileFromResolvedType(resolvedType.container.itemType);
    }
    return undefined;
}

function getRequestPropertyComponents(value: string): string[] | undefined {
    const trimmed = trimPrefix(value, REQUEST_PREFIX);
    return trimmed?.split(".");
}

function getResponsePropertyComponents(value: string): string[] | undefined {
    const trimmed = trimPrefix(value, RESPONSE_PREFIX);
    return trimmed?.split(".");
}

function trimPrefix(value: string, prefix: string): string | null {
    if (value.startsWith(prefix)) {
        return value.substring(prefix.length);
    }
    return null;
}

function isRawCursorPaginationSchema(
    rawPaginationSchema: RawSchemas.PaginationSchema
): rawPaginationSchema is RawSchemas.CursorPaginationSchema {
    return (
        (rawPaginationSchema as RawSchemas.CursorPaginationSchema).cursor != null &&
        (rawPaginationSchema as RawSchemas.CursorPaginationSchema).next_cursor != null &&
        (rawPaginationSchema as RawSchemas.CursorPaginationSchema).results != null
    );
}
