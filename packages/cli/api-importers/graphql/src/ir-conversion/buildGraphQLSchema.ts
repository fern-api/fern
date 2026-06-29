import { buildClientSchema, buildSchema, GraphQLSchema, IntrospectionQuery } from "graphql";

/** True when `value` is an introspection result (an object carrying a `__schema` field). */
function hasSchema(value: unknown): boolean {
    return typeof value === "object" && value !== null && "__schema" in value;
}

/**
 * Extracts an `IntrospectionQuery` from parsed JSON, accepting either the bare `{ __schema }` object or
 * the `{ data: { __schema } }` envelope returned by an introspection POST. The asserted value is kept
 * at type `unknown` (validated by {@link hasSchema}) so a single `as` suffices.
 */
function asIntrospectionQuery(parsed: unknown): IntrospectionQuery | undefined {
    if (hasSchema(parsed)) {
        return parsed as IntrospectionQuery;
    }
    if (typeof parsed === "object" && parsed !== null && "data" in parsed) {
        const data: unknown = parsed.data;
        if (hasSchema(data)) {
            return data as IntrospectionQuery;
        }
    }
    return undefined;
}

/**
 * Builds a `GraphQLSchema` from a schema document, accepting BOTH input formats (PRD §7): SDL text
 * (`buildSchema`) and an introspection-query JSON result (`buildClientSchema`). Introspection is
 * detected by a `.json` file extension or content that parses to an introspection result; anything
 * else is parsed as SDL. Normalizing both inputs to one `GraphQLSchema` here means the rest of the
 * converter is input-format agnostic.
 */
export function buildGraphQLSchemaFromString({
    content,
    filePath
}: {
    content: string;
    filePath?: string;
}): GraphQLSchema {
    const looksLikeJson = (filePath?.toLowerCase().endsWith(".json") ?? false) || content.trimStart().startsWith("{");
    if (looksLikeJson) {
        let parsed: unknown;
        try {
            parsed = JSON.parse(content);
        } catch {
            parsed = undefined;
        }
        const introspection = asIntrospectionQuery(parsed);
        if (introspection != null) {
            return buildClientSchema(introspection);
        }
    }
    return buildSchema(content);
}
