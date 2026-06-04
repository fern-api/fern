import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";

import { applyTranslatedApiTitlesToNavTree } from "../applyTranslatedApiTitlesToNavTree.js";

const ROOT_PACKAGE_ID = "__package__";

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
                endpoints: sub.endpoints ?? [],
                websockets: sub.webSockets ?? [],
                webhooks: sub.webhooks ?? []
            }
        ])
    );
    return {
        rootPackage: {
            endpoints: args.rootEndpoints ?? [],
            websockets: args.rootWebSockets ?? [],
            webhooks: args.rootWebhooks ?? []
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
});
