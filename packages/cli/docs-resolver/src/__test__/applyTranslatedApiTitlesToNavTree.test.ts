import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";

import {
    applyTranslatedApiTitlesToNavTree,
    findIncompatibleTranslatedApiIds
} from "../applyTranslatedApiTitlesToNavTree.js";

const ROOT_PACKAGE_ID = "__package__";

// Endpoints/webhooks/websockets are matched across locales by a stable locator
// (HTTP method + path). Real FDR definitions always carry these; the fixtures
// default them from the node id so the locator is deterministic and unique.
function withEndpointDefaults(endpoint: Partial<APIV1Read.EndpointDefinition>): Partial<APIV1Read.EndpointDefinition> {
    return {
        method: "GET",
        path: { parts: [{ type: "literal", value: `/${endpoint.id ?? "endpoint"}` }], pathParameters: [] },
        ...endpoint
    } as Partial<APIV1Read.EndpointDefinition>;
}

function withWebhookDefaults(webhook: Partial<APIV1Read.WebhookDefinition>): Partial<APIV1Read.WebhookDefinition> {
    return {
        method: "POST",
        path: [`${webhook.id ?? "webhook"}`],
        ...webhook
    } as Partial<APIV1Read.WebhookDefinition>;
}

function withWebSocketDefaults(webSocket: Partial<APIV1Read.WebSocketChannel>): Partial<APIV1Read.WebSocketChannel> {
    return {
        path: { parts: [{ type: "literal", value: `/${webSocket.id ?? "ws"}` }], pathParameters: [] },
        environments: [],
        ...webSocket
    } as Partial<APIV1Read.WebSocketChannel>;
}

// Casts a plain test fixture to RootNode. Mirrors the convention used by the
// sibling applyTranslatedFrontmatterToNavTree test — the helper only reads a
// handful of fields, so we avoid constructing fully-typed nav trees.
function asRoot(obj: unknown): FernNavigation.V1.RootNode {
    return obj as FernNavigation.V1.RootNode;
}

// Builds a minimal APIV1Read.ApiDefinition. The package shape matches what
// ApiDefinitionHolder reads (rootPackage + subpackages, each with endpoints /
// websockets / webhooks arrays). Subpackages are keyed by subpackageId and carry
// a `subpackageId` field so isSubpackage() detects them.
function makeApi(args: {
    rootEndpoints?: Array<Partial<APIV1Read.EndpointDefinition>>;
    rootWebhooks?: Array<Partial<APIV1Read.WebhookDefinition>>;
    rootWebSockets?: Array<Partial<APIV1Read.WebSocketChannel>>;
    subpackages?: Record<
        string,
        {
            name: string;
            displayName?: string;
            endpoints?: Array<Partial<APIV1Read.EndpointDefinition>>;
            webhooks?: Array<Partial<APIV1Read.WebhookDefinition>>;
            webSockets?: Array<Partial<APIV1Read.WebSocketChannel>>;
        }
    >;
}): APIV1Read.ApiDefinition {
    const subpackages = Object.fromEntries(
        Object.entries(args.subpackages ?? {}).map(([subpackageId, sub]) => [
            subpackageId,
            {
                subpackageId,
                name: sub.name,
                displayName: sub.displayName,
                endpoints: (sub.endpoints ?? []).map(withEndpointDefaults),
                websockets: (sub.webSockets ?? []).map(withWebSocketDefaults),
                webhooks: (sub.webhooks ?? []).map(withWebhookDefaults)
            }
        ])
    );
    return {
        rootPackage: {
            endpoints: (args.rootEndpoints ?? []).map(withEndpointDefaults),
            websockets: (args.rootWebSockets ?? []).map(withWebSocketDefaults),
            webhooks: (args.rootWebhooks ?? []).map(withWebhookDefaults)
        },
        subpackages,
        types: {}
    } as unknown as APIV1Read.ApiDefinition;
}

const API_ID = "api-1";

describe("applyTranslatedApiTitlesToNavTree", () => {
    it("translates a root-package endpoint title matched by originalEndpointId", () => {
        const baseApis = {
            [API_ID]: makeApi({ rootEndpoints: [{ id: "list", name: "List accounts", originalEndpointId: "ep.list" }] })
        };
        const translatedApis = {
            [API_ID]: makeApi({
                rootEndpoints: [{ id: "list", name: "アカウント一覧", originalEndpointId: "ep.list" }]
            })
        };
        const root = {
            type: "root",
            child: {
                type: "endpoint",
                endpointId: "ep.list",
                apiDefinitionId: API_ID,
                title: "List accounts"
            }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const child = (result as unknown as { child: { title: string } }).child;
        expect(child.title).toBe("アカウント一覧");
    });

    it("translates an endpoint nested in a subpackage (id derived from subpackageId.id)", () => {
        const baseApis = {
            [API_ID]: makeApi({
                subpackages: { comments: { name: "comments", endpoints: [{ id: "create", name: "Create comment" }] } }
            })
        };
        const translatedApis = {
            [API_ID]: makeApi({
                subpackages: { comments: { name: "comments", endpoints: [{ id: "create", name: "コメントを作成" }] } }
            })
        };
        const root = {
            type: "root",
            child: {
                type: "endpoint",
                endpointId: "comments.create",
                apiDefinitionId: API_ID,
                title: "Create comment"
            }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const child = (result as unknown as { child: { title: string } }).child;
        expect(child.title).toBe("コメントを作成");
    });

    it("translates webhook titles", () => {
        const baseApis = {
            [API_ID]: makeApi({ rootWebhooks: [{ id: "on-event", name: "On event" }] })
        };
        const translatedApis = {
            [API_ID]: makeApi({ rootWebhooks: [{ id: "on-event", name: "イベント発生時" }] })
        };
        const root = {
            type: "root",
            child: {
                type: "webhook",
                webhookId: `${ROOT_PACKAGE_ID}.on-event`,
                apiDefinitionId: API_ID,
                title: "On event"
            }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const child = (result as unknown as { child: { title: string } }).child;
        expect(child.title).toBe("イベント発生時");
    });

    it("translates apiPackage (subpackage) group titles matched by base title", () => {
        const baseApis = {
            [API_ID]: makeApi({ subpackages: { comments: { name: "comments", displayName: "Comments" } } })
        };
        const translatedApis = {
            [API_ID]: makeApi({ subpackages: { comments: { name: "comments", displayName: "コメント" } } })
        };
        const root = {
            type: "root",
            child: {
                type: "apiPackage",
                apiDefinitionId: API_ID,
                title: "Comments",
                children: []
            }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const child = (result as unknown as { child: { title: string } }).child;
        expect(child.title).toBe("コメント");
    });

    it("does not mutate the input root (returns a deep clone)", () => {
        const baseApis = {
            [API_ID]: makeApi({ rootEndpoints: [{ id: "list", name: "List", originalEndpointId: "ep.list" }] })
        };
        const translatedApis = {
            [API_ID]: makeApi({ rootEndpoints: [{ id: "list", name: "一覧", originalEndpointId: "ep.list" }] })
        };
        const root = {
            type: "root",
            child: { type: "endpoint", endpointId: "ep.list", apiDefinitionId: API_ID, title: "List" }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);

        expect(root.child.title).toBe("List");
        expect((result as unknown as { child: { title: string } }).child.title).toBe("一覧");
        expect(result).not.toBe(root);
    });

    it("leaves the title unchanged when the translated endpoint has no name", () => {
        const baseApis = {
            [API_ID]: makeApi({ rootEndpoints: [{ id: "list", name: "List", originalEndpointId: "ep.list" }] })
        };
        const translatedApis = {
            [API_ID]: makeApi({ rootEndpoints: [{ id: "list", name: "", originalEndpointId: "ep.list" }] })
        };
        const root = {
            type: "root",
            child: { type: "endpoint", endpointId: "ep.list", apiDefinitionId: API_ID, title: "List" }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const child = (result as unknown as { child: { title: string } }).child;
        expect(child.title).toBe("List");
    });

    it("ignores nodes whose apiDefinitionId does not match any translated API", () => {
        const baseApis = {
            [API_ID]: makeApi({ rootEndpoints: [{ id: "list", name: "List", originalEndpointId: "ep.list" }] })
        };
        const translatedApis = {
            [API_ID]: makeApi({ rootEndpoints: [{ id: "list", name: "一覧", originalEndpointId: "ep.list" }] })
        };
        const root = {
            type: "root",
            child: {
                type: "endpoint",
                endpointId: "ep.list",
                apiDefinitionId: "some-other-api",
                title: "List"
            }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const child = (result as unknown as { child: { title: string } }).child;
        expect(child.title).toBe("List");
    });

    it("translates titles across multiple APIs in the same tree", () => {
        const API_2 = "api-2";
        const baseApis = {
            [API_ID]: makeApi({ rootEndpoints: [{ id: "a", name: "Alpha", originalEndpointId: "a.id" }] }),
            [API_2]: makeApi({ rootEndpoints: [{ id: "b", name: "Beta", originalEndpointId: "b.id" }] })
        };
        const translatedApis = {
            [API_ID]: makeApi({ rootEndpoints: [{ id: "a", name: "アルファ", originalEndpointId: "a.id" }] }),
            [API_2]: makeApi({ rootEndpoints: [{ id: "b", name: "ベータ", originalEndpointId: "b.id" }] })
        };
        const root = {
            type: "root",
            children: [
                { type: "endpoint", endpointId: "a.id", apiDefinitionId: API_ID, title: "Alpha" },
                { type: "endpoint", endpointId: "b.id", apiDefinitionId: API_2, title: "Beta" }
            ]
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const children = (result as unknown as { children: Array<{ title: string }> }).children;
        expect(children[0]?.title).toBe("アルファ");
        expect(children[1]?.title).toBe("ベータ");
    });

    it("returns an equivalent tree when there are no translated APIs", () => {
        const root = {
            type: "root",
            child: { type: "endpoint", endpointId: "ep.list", apiDefinitionId: API_ID, title: "List" }
        };
        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), {}, {});
        expect(result).toEqual(root);
    });

    it("matches an endpoint by locator and rewrites its id when a translated tag renamed the subpackage", () => {
        // Base: tag "Account Permissions" -> subpackage_accountPermissions, endpoint id
        // "endpoint_accountPermissions.index". Translated spec renamed the tag, so its ids
        // diverge, but the HTTP method + path are unchanged.
        const baseApis = {
            [API_ID]: makeApi({
                subpackages: {
                    subpackage_accountPermissions: {
                        name: "accountPermissions",
                        endpoints: [
                            {
                                id: "index",
                                name: "List account user roles",
                                originalEndpointId: "endpoint_accountPermissions.index",
                                method: "GET",
                                path: { parts: [{ type: "literal", value: "/v4/accounts/roles" }], pathParameters: [] }
                            }
                        ]
                    }
                }
            })
        };
        const translatedApis = {
            [API_ID]: makeApi({
                subpackages: {
                    subpackage_アカウント権限: {
                        name: "アカウント権限",
                        displayName: "アカウント権限",
                        endpoints: [
                            {
                                id: "index",
                                name: "アカウントユーザーロールを一覧表示",
                                originalEndpointId: "endpoint_アカウント権限.index",
                                method: "GET",
                                path: { parts: [{ type: "literal", value: "/v4/accounts/roles" }], pathParameters: [] }
                            }
                        ]
                    }
                }
            })
        };
        const root = {
            type: "root",
            child: {
                type: "endpoint",
                endpointId: "endpoint_accountPermissions.index",
                apiDefinitionId: API_ID,
                title: "List account user roles"
            }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const child = (result as unknown as { child: { title: string; endpointId: string } }).child;
        expect(child.title).toBe("アカウントユーザーロールを一覧表示");
        // The id is repointed to the translated API's id so the renderer can resolve it.
        expect(child.endpointId).toBe("endpoint_アカウント権限.index");
    });

    it("localizes the title but keeps the base id for APIs excluded from rewritableApiIds", () => {
        // Mirrors a drifted API: we serve the base definition (base ids), so the nav
        // node id must stay as the base id, but the title is still localized.
        const baseApis = {
            [API_ID]: makeApi({
                subpackages: {
                    subpackage_accountPermissions: {
                        name: "accountPermissions",
                        endpoints: [
                            {
                                id: "index",
                                name: "List account user roles",
                                originalEndpointId: "endpoint_accountPermissions.index",
                                method: "GET",
                                path: { parts: [{ type: "literal", value: "/v4/accounts/roles" }], pathParameters: [] }
                            }
                        ]
                    }
                }
            })
        };
        const translatedApis = {
            [API_ID]: makeApi({
                subpackages: {
                    subpackage_アカウント権限: {
                        name: "アカウント権限",
                        displayName: "アカウント権限",
                        endpoints: [
                            {
                                id: "index",
                                name: "アカウントユーザーロールを一覧表示",
                                originalEndpointId: "endpoint_アカウント権限.index",
                                method: "GET",
                                path: { parts: [{ type: "literal", value: "/v4/accounts/roles" }], pathParameters: [] }
                            }
                        ]
                    }
                }
            })
        };
        const root = {
            type: "root",
            child: {
                type: "endpoint",
                endpointId: "endpoint_accountPermissions.index",
                apiDefinitionId: API_ID,
                title: "List account user roles"
            }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis, {
            rewritableApiIds: new Set()
        });
        const child = (result as unknown as { child: { title: string; endpointId: string } }).child;
        expect(child.title).toBe("アカウントユーザーロールを一覧表示");
        // Id is NOT repointed because the base definition is served for this API.
        expect(child.endpointId).toBe("endpoint_accountPermissions.index");
    });

    it("matches endpoints by locator even when a path parameter was renamed", () => {
        // Locators ignore path-parameter *names* (only method + literal structure
        // identify an endpoint), so a translated param name must not break matching.
        const baseApis = {
            [API_ID]: makeApi({
                rootEndpoints: [
                    {
                        id: "index",
                        name: "List account roles",
                        originalEndpointId: "ep.index",
                        method: "GET",
                        path: {
                            parts: [
                                { type: "literal", value: "/v4/accounts/" },
                                { type: "pathParameter", value: "account_id" },
                                { type: "literal", value: "/roles" }
                            ],
                            pathParameters: []
                        }
                    }
                ]
            })
        };
        const translatedApis = {
            [API_ID]: makeApi({
                rootEndpoints: [
                    {
                        id: "index",
                        name: "アカウントロールを一覧表示",
                        originalEndpointId: "ep.index",
                        method: "GET",
                        path: {
                            parts: [
                                { type: "literal", value: "/v4/accounts/" },
                                { type: "pathParameter", value: "アカウントID" },
                                { type: "literal", value: "/roles" }
                            ],
                            pathParameters: []
                        }
                    }
                ]
            })
        };
        const root = {
            type: "root",
            child: { type: "endpoint", endpointId: "ep.index", apiDefinitionId: API_ID, title: "List account roles" }
        };

        const incompatible = findIncompatibleTranslatedApiIds(asRoot(root), baseApis, translatedApis);
        expect(incompatible.size).toBe(0);

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const child = (result as unknown as { child: { title: string } }).child;
        expect(child.title).toBe("アカウントロールを一覧表示");
    });

    it("translates an apiPackage group title via endpoint membership when the tag id diverged", () => {
        const baseApis = {
            [API_ID]: makeApi({
                subpackages: {
                    subpackage_accountPermissions: {
                        name: "accountPermissions",
                        endpoints: [
                            {
                                id: "index",
                                name: "List",
                                originalEndpointId: "endpoint_accountPermissions.index",
                                method: "GET",
                                path: { parts: [{ type: "literal", value: "/v4/accounts/roles" }], pathParameters: [] }
                            }
                        ]
                    }
                }
            })
        };
        const translatedApis = {
            [API_ID]: makeApi({
                subpackages: {
                    subpackage_アカウント権限: {
                        name: "アカウント権限",
                        displayName: "アカウント権限",
                        endpoints: [
                            {
                                id: "index",
                                name: "一覧",
                                originalEndpointId: "endpoint_アカウント権限.index",
                                method: "GET",
                                path: { parts: [{ type: "literal", value: "/v4/accounts/roles" }], pathParameters: [] }
                            }
                        ]
                    }
                }
            })
        };
        const root = {
            type: "root",
            child: {
                type: "apiPackage",
                apiDefinitionId: API_ID,
                title: "Account Permissions",
                children: []
            }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const child = (result as unknown as { child: { title: string } }).child;
        expect(child.title).toBe("アカウント権限");
    });

    it("translates a websocket title and rewrites its id by locator when the tag was renamed", () => {
        const baseApis = {
            [API_ID]: makeApi({
                subpackages: {
                    subpackage_realtime: {
                        name: "realtime",
                        webSockets: [
                            {
                                id: "stream",
                                name: "Realtime stream",
                                path: { parts: [{ type: "literal", value: "/v4/ws/stream" }], pathParameters: [] },
                                environments: []
                            }
                        ]
                    }
                }
            })
        };
        const translatedApis = {
            [API_ID]: makeApi({
                subpackages: {
                    subpackage_リアルタイム: {
                        name: "リアルタイム",
                        webSockets: [
                            {
                                id: "stream",
                                name: "リアルタイムストリーム",
                                path: { parts: [{ type: "literal", value: "/v4/ws/stream" }], pathParameters: [] },
                                environments: []
                            }
                        ]
                    }
                }
            })
        };
        const root = {
            type: "root",
            child: {
                type: "webSocket",
                webSocketId: "subpackage_realtime.stream",
                apiDefinitionId: API_ID,
                title: "Realtime stream"
            }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const child = (result as unknown as { child: { title: string; webSocketId: string } }).child;
        expect(child.title).toBe("リアルタイムストリーム");
        expect(child.webSocketId).toBe("subpackage_リアルタイム.stream");
    });

    it("translates a webhook title and rewrites its id by locator when the tag was renamed", () => {
        const baseApis = {
            [API_ID]: makeApi({
                subpackages: {
                    subpackage_events: {
                        name: "events",
                        webhooks: [{ id: "created", name: "On created", method: "POST", path: ["events", "created"] }]
                    }
                }
            })
        };
        const translatedApis = {
            [API_ID]: makeApi({
                subpackages: {
                    subpackage_イベント: {
                        name: "イベント",
                        webhooks: [{ id: "created", name: "作成時", method: "POST", path: ["events", "created"] }]
                    }
                }
            })
        };
        const root = {
            type: "root",
            child: {
                type: "webhook",
                webhookId: "subpackage_events.created",
                apiDefinitionId: API_ID,
                title: "On created"
            }
        };

        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis);
        const child = (result as unknown as { child: { title: string; webhookId: string } }).child;
        expect(child.title).toBe("作成時");
        expect(child.webhookId).toBe("subpackage_イベント.created");
    });

    it("rewrites ids for a compatible API but only localizes titles for a drifted one in the same tree", () => {
        // Models the real customer case: two APIs share one nav tree. API_OK is a clean
        // translation (served translated → ids may be repointed). API_DRIFT is missing an
        // endpoint that the nav references, so the base definition is served for it; its
        // matchable node must keep the base id (so the renderer resolves it) while still
        // getting a localized title.
        const API_OK = "api-ok";
        const API_DRIFT = "api-drift";
        const okEndpoint = (name: string, originalEndpointId: string) => ({
            id: "index",
            name,
            originalEndpointId,
            method: "GET" as const,
            path: { parts: [{ type: "literal" as const, value: "/ok/roles" }], pathParameters: [] }
        });
        const driftPresent = (name: string, originalEndpointId: string) => ({
            id: "present",
            name,
            originalEndpointId,
            method: "GET" as const,
            path: { parts: [{ type: "literal" as const, value: "/drift/present" }], pathParameters: [] }
        });
        const baseApis = {
            [API_OK]: makeApi({
                subpackages: {
                    subpackage_accounts: {
                        name: "accounts",
                        endpoints: [okEndpoint("List", "endpoint_accounts.index")]
                    }
                }
            }),
            [API_DRIFT]: makeApi({
                subpackages: {
                    subpackage_files: {
                        name: "files",
                        endpoints: [
                            driftPresent("Present", "endpoint_files.present"),
                            // This one is absent from the translated spec below.
                            {
                                id: "missing",
                                name: "Missing",
                                originalEndpointId: "endpoint_files.missing",
                                method: "GET",
                                path: { parts: [{ type: "literal", value: "/drift/missing" }], pathParameters: [] }
                            }
                        ]
                    }
                }
            })
        };
        const translatedApis = {
            [API_OK]: makeApi({
                subpackages: {
                    subpackage_アカウント: {
                        name: "アカウント",
                        endpoints: [okEndpoint("一覧", "endpoint_アカウント.index")]
                    }
                }
            }),
            [API_DRIFT]: makeApi({
                subpackages: {
                    subpackage_ファイル: {
                        name: "ファイル",
                        endpoints: [driftPresent("存在", "endpoint_ファイル.present")]
                    }
                }
            })
        };
        const root = {
            type: "root",
            children: [
                { type: "endpoint", endpointId: "endpoint_accounts.index", apiDefinitionId: API_OK, title: "List" },
                {
                    type: "endpoint",
                    endpointId: "endpoint_files.present",
                    apiDefinitionId: API_DRIFT,
                    title: "Present"
                },
                { type: "endpoint", endpointId: "endpoint_files.missing", apiDefinitionId: API_DRIFT, title: "Missing" }
            ]
        };

        const incompatible = findIncompatibleTranslatedApiIds(asRoot(root), baseApis, translatedApis);
        expect(incompatible.has(API_OK)).toBe(false);
        expect(incompatible.has(API_DRIFT)).toBe(true);

        const rewritableApiIds = new Set(Object.keys(translatedApis).filter((apiId) => !incompatible.has(apiId)));
        const result = applyTranslatedApiTitlesToNavTree(asRoot(root), baseApis, translatedApis, {
            rewritableApiIds
        });
        const children = (
            result as unknown as {
                children: Array<{ title: string; endpointId: string }>;
            }
        ).children;

        // Compatible API: title localized AND id repointed to the translated definition.
        expect(children[0]?.title).toBe("一覧");
        expect(children[0]?.endpointId).toBe("endpoint_アカウント.index");

        // Drifted API, matchable node: title localized but id kept (base definition is served).
        expect(children[1]?.title).toBe("存在");
        expect(children[1]?.endpointId).toBe("endpoint_files.present");

        // Drifted API, unmatchable node: left fully untouched.
        expect(children[2]?.title).toBe("Missing");
        expect(children[2]?.endpointId).toBe("endpoint_files.missing");
    });

    describe("findIncompatibleTranslatedApiIds", () => {
        it("returns no incompatible ids when endpoints match by locator despite renamed ids", () => {
            const baseApis = {
                [API_ID]: makeApi({
                    subpackages: {
                        subpackage_accountPermissions: {
                            name: "accountPermissions",
                            endpoints: [
                                {
                                    id: "index",
                                    originalEndpointId: "endpoint_accountPermissions.index",
                                    method: "GET",
                                    path: { parts: [{ type: "literal", value: "/v4/roles" }], pathParameters: [] }
                                }
                            ]
                        }
                    }
                })
            };
            const translatedApis = {
                [API_ID]: makeApi({
                    subpackages: {
                        subpackage_blabla: {
                            name: "blabla",
                            endpoints: [
                                {
                                    id: "index",
                                    originalEndpointId: "endpoint_blabla.index",
                                    method: "GET",
                                    path: { parts: [{ type: "literal", value: "/v4/roles" }], pathParameters: [] }
                                }
                            ]
                        }
                    }
                })
            };
            const root = {
                type: "root",
                child: {
                    type: "endpoint",
                    endpointId: "endpoint_accountPermissions.index",
                    apiDefinitionId: API_ID,
                    title: "List"
                }
            };

            const incompatible = findIncompatibleTranslatedApiIds(asRoot(root), baseApis, translatedApis);
            expect(incompatible.size).toBe(0);
        });

        it("flags an API whose nav endpoint cannot be matched (path changed too)", () => {
            const baseApis = {
                [API_ID]: makeApi({
                    rootEndpoints: [
                        {
                            id: "index",
                            originalEndpointId: "ep.index",
                            method: "GET",
                            path: { parts: [{ type: "literal", value: "/v4/roles" }], pathParameters: [] }
                        }
                    ]
                })
            };
            const translatedApis = {
                [API_ID]: makeApi({
                    rootEndpoints: [
                        {
                            id: "index",
                            originalEndpointId: "ep.renamed",
                            method: "GET",
                            path: { parts: [{ type: "literal", value: "/v4/roles-renamed" }], pathParameters: [] }
                        }
                    ]
                })
            };
            const root = {
                type: "root",
                child: {
                    type: "endpoint",
                    endpointId: "ep.index",
                    apiDefinitionId: API_ID,
                    title: "List"
                }
            };

            const incompatible = findIncompatibleTranslatedApiIds(asRoot(root), baseApis, translatedApis);
            expect(incompatible.has(API_ID)).toBe(true);
        });

        it("flags an API when a base nav endpoint is missing entirely from the translated spec", () => {
            // The customer's real failure mode: the translated spec drifted and dropped an
            // endpoint the base nav tree still references.
            const baseApis = {
                [API_ID]: makeApi({
                    rootEndpoints: [
                        {
                            id: "present",
                            originalEndpointId: "ep.present",
                            method: "GET",
                            path: { parts: [{ type: "literal", value: "/present" }], pathParameters: [] }
                        },
                        {
                            id: "missing",
                            originalEndpointId: "ep.missing",
                            method: "GET",
                            path: { parts: [{ type: "literal", value: "/missing" }], pathParameters: [] }
                        }
                    ]
                })
            };
            const translatedApis = {
                [API_ID]: makeApi({
                    rootEndpoints: [
                        {
                            id: "present",
                            originalEndpointId: "ep.present",
                            method: "GET",
                            path: { parts: [{ type: "literal", value: "/present" }], pathParameters: [] }
                        }
                    ]
                })
            };
            const root = {
                type: "root",
                children: [
                    { type: "endpoint", endpointId: "ep.present", apiDefinitionId: API_ID, title: "Present" },
                    { type: "endpoint", endpointId: "ep.missing", apiDefinitionId: API_ID, title: "Missing" }
                ]
            };

            const incompatible = findIncompatibleTranslatedApiIds(asRoot(root), baseApis, translatedApis);
            expect(incompatible.has(API_ID)).toBe(true);
        });

        it("flags a translated API that has no base counterpart", () => {
            const incompatible = findIncompatibleTranslatedApiIds(
                asRoot({ type: "root", child: {} }),
                {},
                { [API_ID]: makeApi({ rootEndpoints: [{ id: "a", originalEndpointId: "a.id" }] }) }
            );
            expect(incompatible.has(API_ID)).toBe(true);
        });
    });
});
