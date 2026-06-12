import { titleCase } from "@fern-api/core-utils";
import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";

interface ApiTitleMaps {
    endpoints: Map<string, string>;
    webhooks: Map<string, string>;
    webSockets: Map<string, string>;
    graphql: Map<string, string>;
    /** Subpackage grouping titles, keyed by the default-locale (base) computed title. */
    packagesByBaseTitle: Map<string, string>;
}

/**
 * Returns a deep clone of the navigation tree with API-reference node titles
 * (endpoints, webhooks, websockets, subpackages) replaced by their translated
 * equivalents, so the left-hand sidebar isn't left in the default language when a
 * translated API definition is paired with the base navigation tree.
 *
 * Endpoint-like nodes are matched by the nav ids the tree was built from (via
 * {@link FernNavigation.ApiDefinitionHolder}). Subpackage grouping nodes don't
 * persist their subpackage id, so they are matched by their base-locale title,
 * which is unique within a single API.
 *
 * @param root - the navigation tree whose API titles should be localized
 * @param baseApis - default-locale API definitions, keyed by apiDefinitionId
 *   (used to derive subpackage base titles)
 * @param translatedApis - translated API definitions, keyed by the same apiDefinitionId
 */
export function applyTranslatedApiTitlesToNavTree(
    root: FernNavigation.V1.RootNode,
    baseApis: Record<string, APIV1Read.ApiDefinition>,
    translatedApis: Record<string, APIV1Read.ApiDefinition>
): FernNavigation.V1.RootNode {
    const mapsByApiId = new Map<string, ApiTitleMaps>();
    for (const [apiId, translatedApi] of Object.entries(translatedApis)) {
        const holder = FernNavigation.ApiDefinitionHolder.create(translatedApi);

        const endpoints = new Map<string, string>();
        for (const [id, endpoint] of holder.endpoints) {
            if (endpoint.name != null && endpoint.name.length > 0) {
                endpoints.set(id, endpoint.name);
            }
        }
        const webhooks = new Map<string, string>();
        for (const [id, webhook] of holder.webhooks) {
            if (webhook.name != null && webhook.name.length > 0) {
                webhooks.set(id, webhook.name);
            }
        }
        const webSockets = new Map<string, string>();
        for (const [id, webSocket] of holder.webSockets) {
            if (webSocket.name != null && webSocket.name.length > 0) {
                webSockets.set(id, webSocket.name);
            }
        }
        const graphql = new Map<string, string>();
        for (const [id, operation] of holder.graphqlOperations) {
            const name = operation.displayName ?? operation.name;
            if (name != null && name.length > 0) {
                graphql.set(id, name);
            }
        }

        // Matched by base-locale title; only record entries whose title actually
        // changes, so untranslated subpackages are left alone.
        const packagesByBaseTitle = new Map<string, string>();
        const baseApi = baseApis[apiId];
        if (baseApi != null) {
            for (const [subpackageId, translatedSubpackage] of Object.entries(translatedApi.subpackages)) {
                const baseSubpackage = baseApi.subpackages[subpackageId];
                if (baseSubpackage == null) {
                    continue;
                }
                const baseTitle = baseSubpackage.displayName ?? titleCase(baseSubpackage.name);
                const translatedTitle = translatedSubpackage.displayName ?? titleCase(translatedSubpackage.name);
                if (baseTitle !== translatedTitle) {
                    packagesByBaseTitle.set(baseTitle, translatedTitle);
                }
            }
        }

        mapsByApiId.set(apiId, { endpoints, webhooks, webSockets, graphql, packagesByBaseTitle });
    }

    // Deep clone so we never mutate the base nav tree, which may be shared by reference.
    const clone = structuredClone(root);

    const visit = (node: unknown): void => {
        if (node == null || typeof node !== "object") {
            return;
        }
        if (Array.isArray(node)) {
            for (const item of node) {
                visit(item);
            }
            return;
        }
        const obj = node as Record<string, unknown>;
        const apiDefinitionId = typeof obj.apiDefinitionId === "string" ? obj.apiDefinitionId : undefined;
        const maps = apiDefinitionId != null ? mapsByApiId.get(apiDefinitionId) : undefined;
        if (maps != null) {
            const type = obj.type;
            if (type === "endpoint" && typeof obj.endpointId === "string") {
                const translated = maps.endpoints.get(obj.endpointId);
                if (translated != null) {
                    obj.title = translated;
                }
            } else if (type === "webhook" && typeof obj.webhookId === "string") {
                const translated = maps.webhooks.get(obj.webhookId);
                if (translated != null) {
                    obj.title = translated;
                }
            } else if (type === "webSocket" && typeof obj.webSocketId === "string") {
                const translated = maps.webSockets.get(obj.webSocketId);
                if (translated != null) {
                    obj.title = translated;
                }
            } else if (type === "graphql" && typeof obj.graphqlOperationId === "string") {
                const translated = maps.graphql.get(obj.graphqlOperationId);
                if (translated != null) {
                    obj.title = translated;
                }
            } else if (type === "apiPackage" && typeof obj.title === "string") {
                const translated = maps.packagesByBaseTitle.get(obj.title);
                if (translated != null) {
                    obj.title = translated;
                }
            }
        }
        for (const value of Object.values(obj)) {
            visit(value);
        }
    };

    visit(clone);
    return clone;
}
