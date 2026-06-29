// Public surface of the GraphQL core utility. Re-exported (via PublicExportsManager) from the SDK
// root so consumers can `import { GraphqlError } from "<sdk>"` to catch GraphQL operation errors and
// type field selections. The query builders (buildGraphqlQuery/subscribeGraphql) stay internal —
// generated client code references them through `core`, callers do not invoke them directly.
export { GraphqlError, type GraphqlResponseError } from "./GraphqlError";
export type { GraphqlResponse } from "./GraphqlResponse";
export type { GraphqlSelection } from "./buildGraphqlQuery";
