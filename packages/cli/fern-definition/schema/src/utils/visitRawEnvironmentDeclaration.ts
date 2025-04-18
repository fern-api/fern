import { assertNever } from "@fern-api/core-utils";

import { EnvironmentSchema, MultipleBaseUrlsEnvironmentSchema, SingleBaseUrlEnvironmentSchema } from "../schemas";

export interface EnvironmentDeclarationVisitor<R> {
    singleBaseUrl: (environment: string | SingleBaseUrlEnvironmentSchema) => R;
    multipleBaseUrls: (environment: MultipleBaseUrlsEnvironmentSchema) => R;
}

export function visitRawEnvironmentDeclaration<R>(
    environment: EnvironmentSchema,
    visitor: EnvironmentDeclarationVisitor<R>
): R {
    if (isRawSingleBaseUrlEnvironment(environment)) {
        return visitor.singleBaseUrl(environment);
    }
    if (isRawMultipleBaseUrlsEnvironment(environment)) {
        return visitor.multipleBaseUrls(environment);
    }
    assertNever(environment);
}

export function isRawSingleBaseUrlEnvironment(
    environment: EnvironmentSchema
): environment is string | SingleBaseUrlEnvironmentSchema {
    return typeof environment === "string" || "url" in environment;
}

export function isRawMultipleBaseUrlsEnvironment(
    environment: EnvironmentSchema
): environment is MultipleBaseUrlsEnvironmentSchema {
    return typeof environment !== "string" && "urls" in environment;
}
