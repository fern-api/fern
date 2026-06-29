import * as FernIr from "@fern-api/ir-sdk";

/**
 * GraphQL endpoints are emitted with `auth: false` by the GraphQL→IR converter because a GraphQL
 * schema cannot express authentication: introspection/SDL has no auth concept, so auth is purely an
 * HTTP-transport concern on the single `POST /graphql`. When the surrounding API *does* declare auth —
 * either inherited from a combined OpenAPI spec or declared by the publisher in `generators.yml`
 * (`api.auth` / `auth-schemes`) — those schemes end up in the merged IR but never reach the GraphQL
 * operations, so the generated SDK has no typed auth on its GraphQL calls.
 *
 * This pass closes that gap. Once the IR is fully merged, if it carries at least one auth scheme, every
 * GraphQL endpoint is marked `auth: true` so Fern's existing auth machinery generates the typed auth
 * parameter and injects the header, exactly as it does for REST endpoints. No GraphQL-specific auth
 * config is introduced — this only stops suppressing the auth that is already present in the IR.
 *
 * Query/mutation operations inject the header on the GraphQL POST; subscriptions resolve auth lazily
 * inside the WebSocket connect (the generated subscription method stays synchronous and `subscribeGraphql`
 * awaits the auth supplier before opening the socket), sending it as both the `connection_init` payload
 * and the upgrade-request headers.
 *
 * To revert GraphQL auth support, delete this file and its call sites. The converter's `auth: false`
 * default is left untouched, so GraphQL endpoints simply go back to never being authed.
 */
export function applyAuthToGraphqlEndpoints(ir: FernIr.IntermediateRepresentation): FernIr.IntermediateRepresentation {
    if (ir.auth?.schemes == null || ir.auth.schemes.length === 0) {
        return ir;
    }

    const isAuthableGraphqlEndpoint = (endpoint: FernIr.HttpEndpoint): boolean =>
        endpoint.transport?.type === "graphql";

    const services = Object.fromEntries(
        Object.entries(ir.services).map(([serviceId, service]) => [
            serviceId,
            {
                ...service,
                endpoints: service.endpoints.map((endpoint) =>
                    isAuthableGraphqlEndpoint(endpoint) ? { ...endpoint, auth: true } : endpoint
                )
            }
        ])
    );

    return { ...ir, services };
}
