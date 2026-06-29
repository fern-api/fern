import { GraphqlResponseError } from "./GraphqlError";

/**
 * Envelope returned by GraphQL query/mutation operations. GraphQL is a partial-success protocol: a
 * single HTTP 200 can carry BOTH `data` and `errors`, so rather than throwing on operation errors the
 * SDK surfaces both channels on this typed envelope.
 *
 * - `data` is the operation's value narrowed to the caller's field selection (e.g.
 *   `Result<User, S> | undefined`). It may be present even when `errors` is non-empty (partial data),
 *   and may be `undefined` for a pure-error response.
 * - `errors` is the server's top-level `errors` array, or `undefined` when the operation produced no
 *   GraphQL errors.
 *
 * Callers who prefer the throw-on-error behavior can pass `throwOnError: true` in the request options;
 * the SDK then throws {@link GraphqlError} instead of returning an envelope with a populated `errors`.
 */
export interface GraphqlResponse<T> {
    data: T;
    errors: GraphqlResponseError[] | undefined;
}
