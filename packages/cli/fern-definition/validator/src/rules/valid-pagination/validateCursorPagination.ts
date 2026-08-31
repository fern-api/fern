import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernFileContext, parseNextCursorPath, ResolvedType, TypeResolver } from "@fern-api/ir-generator";
import chalk from "chalk";

import { RuleViolation } from "../../Rule.js";
import {
    getResponsePropertyComponents,
    maybeFileFromResolvedType,
    maybePrimitiveType,
    resolvedTypeHasProperty,
    resolvedTypeListItemHasProperty,
    resolveResponseType
} from "../../utils/propertyValidatorUtils.js";
import { validateRequestProperty, validateResponseProperty, validateResultsProperty } from "./validateUtils.js";

export function validateCursorPagination({
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
            severity: "fatal",
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
            cursorPagination
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
    return validateRequestProperty({
        endpointId,
        endpoint,
        typeResolver,
        file,
        requestProperty: cursorPagination.cursor,
        propertyValidator: {
            propertyID: "cursor",
            validate: isValidCursorType
        }
    });
}

function validateNextCursorProperty({
    endpointId,
    typeResolver,
    file,
    resolvedResponseType,
    cursorPagination
}: {
    endpointId: string;
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedResponseType: ResolvedType;
    cursorPagination: RawSchemas.CursorPaginationSchema;
}): RuleViolation[] {
    const nextCursorComponents = getResponsePropertyComponents(cursorPagination.next_cursor);
    const parsedNextCursor = nextCursorComponents != null ? parseNextCursorPath(nextCursorComponents) : undefined;

    if (parsedNextCursor == null || parsedNextCursor.type === "responseProperty") {
        return validateResponseProperty({
            endpointId,
            typeResolver,
            file,
            resolvedResponseType,
            responseProperty: cursorPagination.next_cursor,
            propertyValidator: {
                propertyID: "next_cursor",
                validate: isValidCursorProperty
            }
        });
    }

    switch (parsedNextCursor.type) {
        case "invalid":
            return [
                {
                    severity: "fatal",
                    message: `Pagination configuration for endpoint ${chalk.bold(endpointId)} specifies 'next_cursor' ${
                        cursorPagination.next_cursor
                    }, but ${parsedNextCursor.message}.`
                }
            ];
        case "itemCursor": {
            const resultsComponents = getResponsePropertyComponents(cursorPagination.results);
            if (resultsComponents != null && !isSamePath(resultsComponents, parsedNextCursor.resultsComponents)) {
                return [
                    {
                        severity: "fatal",
                        message: `Pagination configuration for endpoint ${chalk.bold(
                            endpointId
                        )} specifies 'next_cursor' ${cursorPagination.next_cursor}, which must index into 'results' ${
                            cursorPagination.results
                        }.`
                    }
                ];
            }
            if (
                !resolvedTypeListItemHasProperty({
                    typeResolver,
                    file,
                    resolvedType: resolvedResponseType,
                    listPropertyComponents: parsedNextCursor.resultsComponents,
                    itemPropertyComponents: parsedNextCursor.itemComponents,
                    validate: isValidCursorType
                })
            ) {
                return [
                    {
                        severity: "fatal",
                        message: `Pagination configuration for endpoint ${chalk.bold(
                            endpointId
                        )} specifies 'next_cursor' ${
                            cursorPagination.next_cursor
                        }, which is not a valid 'next_cursor' type on the elements of the results.`
                    }
                ];
            }
            return [];
        }
        default:
            assertNever(parsedNextCursor);
    }
}

function isSamePath(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((component, index) => component === b[index]);
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

function isValidCursorType({ resolvedType }: { resolvedType: ResolvedType | undefined }): boolean {
    const primitiveType = maybePrimitiveType(resolvedType);
    if (primitiveType == null) {
        return false;
    }
    return primitiveType !== "BOOLEAN";
}
