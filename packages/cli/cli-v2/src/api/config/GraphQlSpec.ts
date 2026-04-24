import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { ApiSpec } from "./ApiSpec.js";

/**
 * A GraphQL specification.
 *
 * GraphQL specs are only rendered in documentation; they are ignored by SDK generators.
 */
export interface GraphQlSpec {
    /** Path to the GraphQL schema file */
    graphql: AbsoluteFilePath;

    /** URL origin for the GraphQL endpoint */
    origin?: string;

    /** Path to the overrides file(s) */
    overrides?: AbsoluteFilePath | AbsoluteFilePath[];

    /** Name used to group this GraphQL spec in the docs (rendered as a top-level section) */
    name?: string;
}

/**
 * Type guard to check if an ApiSpec is a GraphQlSpec.
 */
export function isGraphQlSpec(spec: ApiSpec): spec is GraphQlSpec {
    return "graphql" in spec;
}
