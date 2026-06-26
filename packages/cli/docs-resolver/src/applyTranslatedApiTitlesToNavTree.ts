import { titleCase } from "@fern-api/core-utils";
import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";

/**
 * Stringifies a path for use as a stable, translation-resistant locator.
 *
 * Path parameters are normalized to a positional placeholder (`{}`) rather than
 * their declared name. A parameter's name is not what identifies an endpoint
 * (method + literal path structure is), and some translators rename path
 * parameters in translated specs, which would otherwise spuriously diverge the
 * locator.
 */
function stringifyPathPartsForLocator(path: APIV1Read.EndpointPathPart[]): string {
    return path.map((part) => (part.type === "literal" ? part.value : "{}")).join("");
}

/**
 * Resolves a single base-locale API node id (and its translated title) against a
 * translated API definition.
 *
 * Translations are expected to only localize human-readable *text*, leaving
 * structural identifiers (OpenAPI tag names, operationIds, paths) untouched. In
 * that common case the translated API shares the base API's node ids, so a node
 * resolves by an exact id match.
 *
 * When a translator does change a structural identifier — most commonly an
 * OpenAPI tag name, which is what derives subpackage and endpoint ids — the
 * translated API's ids diverge from the base navigation tree. We recover from
 * this by matching nodes on a stable locator (HTTP method + path), and report
 * the translated id so the caller can repoint the navigation node at it. This
 * keeps the localized title *and* prevents the docs renderer from looking up a
 * node id that no longer exists in the served API (which previously surfaced as
 * a 500 / PruneEmptyError).
 */
interface TranslatedNodeMatch {
    /** The id of the matching node in the translated API (may equal the base id). */
    translatedId: string;
    /** The translated, human-readable title, when present. */
    title: string | undefined;
}

interface ApplyTranslatedApiTitlesOptions {
    /**
     * The set of `apiDefinitionId`s whose nav node ids may be repointed at the
     * translated definition. When omitted, all APIs are eligible (the translated
     * definition is assumed to be served for every API). Pass the set of
     * fully-matchable APIs (see {@link findIncompatibleTranslatedApiIds}) when the
     * base definition is served for drifted APIs, so their nav ids stay resolvable.
     */
    rewritableApiIds?: ReadonlySet<string>;
}

interface ApiTranslationResolver {
    resolveEndpoint(baseNavId: string): TranslatedNodeMatch | undefined;
    resolveWebhook(baseNavId: string): TranslatedNodeMatch | undefined;
    resolveWebSocket(baseNavId: string): TranslatedNodeMatch | undefined;
    /** GraphQL operation titles keyed by their (stable) operation id. */
    graphqlTitlesById: Map<string, string>;
    /** Subpackage grouping titles, keyed by the default-locale (base) computed title. */
    packagesByBaseTitle: Map<string, string>;
}

function endpointLocator(endpoint: APIV1Read.EndpointDefinition): string {
    return `${endpoint.method} ${stringifyPathPartsForLocator(endpoint.path.parts)}`;
}

function webhookLocator(webhook: APIV1Read.WebhookDefinition): string {
    return `${webhook.method} ${webhook.path.join("/")}`;
}

function webSocketLocator(webSocket: APIV1Read.WebSocketChannel): string {
    return `WSS ${stringifyPathPartsForLocator(webSocket.path.parts)}`;
}

function nonEmptyTitle(name: string | null | undefined): string | undefined {
    return name != null && name.length > 0 ? name : undefined;
}

function subpackageTitle(pkg: { name: string; displayName?: string | null }): string {
    return pkg.displayName ?? titleCase(pkg.name);
}

function subpackageLocators(pkg: APIV1Read.ApiDefinitionSubpackage): string[] {
    return [
        ...pkg.endpoints.map(endpointLocator),
        ...pkg.webhooks.map(webhookLocator),
        ...pkg.websockets.map(webSocketLocator)
    ];
}

/**
 * Builds a per-locator → translated-id index plus a base-id → locator index for a
 * single node kind, so a base navigation id can be resolved to its translated
 * counterpart either directly (id unchanged) or via its stable locator.
 */
function buildResolverForKind<TDef>(
    baseEntries: ReadonlyMap<string, TDef>,
    translatedEntries: ReadonlyMap<string, TDef>,
    locatorOf: (def: TDef) => string,
    titleOf: (def: TDef) => string | undefined
): (baseNavId: string) => TranslatedNodeMatch | undefined {
    const translatedIdByLocator = new Map<string, string>();
    for (const [navId, def] of translatedEntries) {
        // First writer wins; duplicate locators within one API are not expected.
        if (!translatedIdByLocator.has(locatorOf(def))) {
            translatedIdByLocator.set(locatorOf(def), navId);
        }
    }

    return (baseNavId: string): TranslatedNodeMatch | undefined => {
        const exact = translatedEntries.get(baseNavId);
        if (exact != null) {
            return { translatedId: baseNavId, title: titleOf(exact) };
        }
        const baseDef = baseEntries.get(baseNavId);
        if (baseDef == null) {
            return undefined;
        }
        const translatedId = translatedIdByLocator.get(locatorOf(baseDef));
        if (translatedId == null) {
            return undefined;
        }
        const translatedDef = translatedEntries.get(translatedId);
        return { translatedId, title: translatedDef != null ? titleOf(translatedDef) : undefined };
    };
}

function buildPackagesByBaseTitle(
    baseApi: APIV1Read.ApiDefinition,
    translatedApi: APIV1Read.ApiDefinition
): Map<string, string> {
    const packagesByBaseTitle = new Map<string, string>();

    // Id-based matching: handles the common case where the tag name (and thus the
    // subpackage id) is unchanged and only the display text differs. Also covers
    // grouping subpackages that have no endpoints of their own.
    for (const [subpackageId, translatedSubpackage] of Object.entries(translatedApi.subpackages)) {
        const baseSubpackage = baseApi.subpackages[subpackageId];
        if (baseSubpackage == null) {
            continue;
        }
        const baseTitle = subpackageTitle(baseSubpackage);
        const translatedTitle = subpackageTitle(translatedSubpackage);
        if (baseTitle !== translatedTitle) {
            packagesByBaseTitle.set(baseTitle, translatedTitle);
        }
    }

    // Membership-based matching: when the tag name was translated, the subpackage
    // id diverges, so id-based matching misses it. Pair base and translated
    // subpackages by a shared endpoint/webhook/websocket locator instead.
    const baseTitleByLocator = new Map<string, string>();
    for (const baseSubpackage of Object.values(baseApi.subpackages)) {
        const baseTitle = subpackageTitle(baseSubpackage);
        for (const locator of subpackageLocators(baseSubpackage)) {
            if (!baseTitleByLocator.has(locator)) {
                baseTitleByLocator.set(locator, baseTitle);
            }
        }
    }
    for (const translatedSubpackage of Object.values(translatedApi.subpackages)) {
        const translatedTitle = subpackageTitle(translatedSubpackage);
        for (const locator of subpackageLocators(translatedSubpackage)) {
            const baseTitle = baseTitleByLocator.get(locator);
            if (baseTitle != null && baseTitle !== translatedTitle && !packagesByBaseTitle.has(baseTitle)) {
                packagesByBaseTitle.set(baseTitle, translatedTitle);
            }
        }
    }

    return packagesByBaseTitle;
}

function buildApiTranslationResolvers(
    baseApis: Record<string, APIV1Read.ApiDefinition>,
    translatedApis: Record<string, APIV1Read.ApiDefinition>
): Map<string, ApiTranslationResolver> {
    const resolvers = new Map<string, ApiTranslationResolver>();
    for (const [apiId, translatedApi] of Object.entries(translatedApis)) {
        const baseApi = baseApis[apiId];
        if (baseApi == null) {
            continue;
        }
        const baseHolder = FernNavigation.ApiDefinitionHolder.create(baseApi);
        const translatedHolder = FernNavigation.ApiDefinitionHolder.create(translatedApi);

        const resolveEndpoint = buildResolverForKind(
            baseHolder.endpoints,
            translatedHolder.endpoints,
            endpointLocator,
            (endpoint) => nonEmptyTitle(endpoint.name)
        );
        const resolveWebhook = buildResolverForKind(
            baseHolder.webhooks,
            translatedHolder.webhooks,
            webhookLocator,
            (webhook) => nonEmptyTitle(webhook.name)
        );
        const resolveWebSocket = buildResolverForKind(
            baseHolder.webSockets,
            translatedHolder.webSockets,
            webSocketLocator,
            (webSocket) => nonEmptyTitle(webSocket.name)
        );

        const graphqlTitlesById = new Map<string, string>();
        for (const [id, operation] of translatedHolder.graphqlOperations) {
            const name = operation.displayName ?? operation.name;
            const title = nonEmptyTitle(name);
            if (title != null) {
                graphqlTitlesById.set(id, title);
            }
        }

        resolvers.set(apiId, {
            resolveEndpoint,
            resolveWebhook,
            resolveWebSocket,
            graphqlTitlesById,
            packagesByBaseTitle: buildPackagesByBaseTitle(baseApi, translatedApi)
        });
    }
    return resolvers;
}

function getApiDefinitionId(node: Record<string, unknown>): string | undefined {
    return typeof node.apiDefinitionId === "string" ? node.apiDefinitionId : undefined;
}

function visitNavigationNodes(node: unknown, callback: (node: Record<string, unknown>) => void): void {
    if (node == null || typeof node !== "object") {
        return;
    }
    if (Array.isArray(node)) {
        for (const item of node) {
            visitNavigationNodes(item, callback);
        }
        return;
    }
    const obj = node as Record<string, unknown>;
    callback(obj);
    for (const value of Object.values(obj)) {
        visitNavigationNodes(value, callback);
    }
}

/**
 * Returns the set of `apiDefinitionId`s whose translated API definition is
 * structurally incompatible with the base navigation tree — i.e. the nav tree
 * references an endpoint/webhook/websocket node that cannot be matched (by id or
 * by locator) in the translated API.
 *
 * This happens when a translated spec changes a structural identifier (most
 * commonly an OpenAPI tag name, but also operationIds or paths). Serving such a
 * definition would make the docs renderer fail to resolve nav nodes and return a
 * 500. Callers should fall back to the base (default-locale) API for these ids.
 */
export function findIncompatibleTranslatedApiIds(
    root: FernNavigation.V1.RootNode | undefined,
    baseApis: Record<string, APIV1Read.ApiDefinition>,
    translatedApis: Record<string, APIV1Read.ApiDefinition>
): Set<string> {
    const incompatible = new Set<string>();

    // A translated API with no base counterpart can't be reconciled against the
    // base-keyed nav tree.
    for (const apiId of Object.keys(translatedApis)) {
        if (baseApis[apiId] == null) {
            incompatible.add(apiId);
        }
    }

    if (root == null) {
        return incompatible;
    }

    const resolvers = buildApiTranslationResolvers(baseApis, translatedApis);

    visitNavigationNodes(root, (obj) => {
        const apiDefinitionId = getApiDefinitionId(obj);
        if (apiDefinitionId == null || incompatible.has(apiDefinitionId)) {
            return;
        }
        const resolver = resolvers.get(apiDefinitionId);
        if (resolver == null) {
            return;
        }
        const type = obj.type;
        if (type === "endpoint" && typeof obj.endpointId === "string") {
            if (resolver.resolveEndpoint(obj.endpointId) == null) {
                incompatible.add(apiDefinitionId);
            }
        } else if (type === "webhook" && typeof obj.webhookId === "string") {
            if (resolver.resolveWebhook(obj.webhookId) == null) {
                incompatible.add(apiDefinitionId);
            }
        } else if (type === "webSocket" && typeof obj.webSocketId === "string") {
            if (resolver.resolveWebSocket(obj.webSocketId) == null) {
                incompatible.add(apiDefinitionId);
            }
        }
    });

    return incompatible;
}

/**
 * Returns a deep clone of the navigation tree with API-reference node titles
 * (endpoints, webhooks, websockets, subpackages) replaced by their translated
 * equivalents, so the left-hand sidebar isn't left in the default language when a
 * translated API definition is paired with the base navigation tree.
 *
 * Endpoint-like nodes are matched first by the nav ids the tree was built from,
 * and — when a translated spec changed a structural identifier such as an OpenAPI
 * tag name — by a stable locator (HTTP method + path). In the latter case the
 * node's id is also rewritten to the translated id so the docs renderer can
 * resolve it against the served (translated) API. Subpackage grouping nodes don't
 * persist their subpackage id, so they are matched by their base-locale title.
 *
 * For APIs whose translated spec has drifted from the base (see
 * {@link findIncompatibleTranslatedApiIds}), the base definition is served, so
 * pass those APIs *out* of `options.rewritableApiIds`: titles are still localized
 * where a node matches by locator, but ids are left as the base ids the served
 * definition exposes (preventing a 500 / PruneEmptyError). Unmatched nodes are
 * left fully untouched.
 *
 * @param root - the navigation tree whose API titles should be localized
 * @param baseApis - default-locale API definitions, keyed by apiDefinitionId
 * @param translatedApis - translated API definitions, keyed by the same apiDefinitionId
 * @param options - see {@link ApplyTranslatedApiTitlesOptions}
 */
export function applyTranslatedApiTitlesToNavTree(
    root: FernNavigation.V1.RootNode,
    baseApis: Record<string, APIV1Read.ApiDefinition>,
    translatedApis: Record<string, APIV1Read.ApiDefinition>,
    options?: ApplyTranslatedApiTitlesOptions
): FernNavigation.V1.RootNode {
    const resolvers = buildApiTranslationResolvers(baseApis, translatedApis);
    const rewritableApiIds = options?.rewritableApiIds;

    // Whether nav node ids may be repointed at the translated definition for this
    // API. This is only safe when the translated definition is actually served
    // for the API (i.e. it can resolve *every* nav node). When the translated
    // spec has drifted from the base, the base definition is served instead, so
    // we localize titles but must keep the base ids the served API exposes.
    const canRewriteIds = (apiDefinitionId: string): boolean =>
        rewritableApiIds == null || rewritableApiIds.has(apiDefinitionId);

    // Deep clone so we never mutate the base nav tree, which may be shared by reference.
    const clone = structuredClone(root);

    visitNavigationNodes(clone, (obj) => {
        const apiDefinitionId = getApiDefinitionId(obj);
        const resolver = apiDefinitionId != null ? resolvers.get(apiDefinitionId) : undefined;
        if (resolver == null || apiDefinitionId == null) {
            return;
        }
        const rewriteIds = canRewriteIds(apiDefinitionId);
        const type = obj.type;
        if (type === "endpoint" && typeof obj.endpointId === "string") {
            const match = resolver.resolveEndpoint(obj.endpointId);
            if (match != null) {
                if (rewriteIds) {
                    obj.endpointId = match.translatedId;
                }
                if (match.title != null) {
                    obj.title = match.title;
                }
            }
        } else if (type === "webhook" && typeof obj.webhookId === "string") {
            const match = resolver.resolveWebhook(obj.webhookId);
            if (match != null) {
                if (rewriteIds) {
                    obj.webhookId = match.translatedId;
                }
                if (match.title != null) {
                    obj.title = match.title;
                }
            }
        } else if (type === "webSocket" && typeof obj.webSocketId === "string") {
            const match = resolver.resolveWebSocket(obj.webSocketId);
            if (match != null) {
                if (rewriteIds) {
                    obj.webSocketId = match.translatedId;
                }
                if (match.title != null) {
                    obj.title = match.title;
                }
            }
        } else if (type === "graphql" && typeof obj.graphqlOperationId === "string") {
            const translated = resolver.graphqlTitlesById.get(obj.graphqlOperationId);
            if (translated != null) {
                obj.title = translated;
            }
        } else if (type === "apiPackage" && typeof obj.title === "string") {
            const translated = resolver.packagesByBaseTitle.get(obj.title);
            if (translated != null) {
                obj.title = translated;
            }
        }
    });

    return clone;
}
