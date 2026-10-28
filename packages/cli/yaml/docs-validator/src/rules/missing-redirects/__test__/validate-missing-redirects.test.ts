import { DocsV1Write } from "@fern-api/fdr-sdk";
import { createLogger } from "@fern-api/logger";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { validateMissingRedirects } from "../../../validateDocsWorkspace.js";

vi.mock("@fern-api/auth", () => ({
    getToken: async () => undefined
}));

vi.mock(import("@fern-api/docs-resolver"), async (importOriginal) => ({
    ...(await importOriginal()),
    DocsDefinitionResolver: class {
        constructor() {
            throw new Error("validateMissingRedirects must reuse the given docs definition");
        }
    } as never
}));

const logger = createLogger(() => undefined);

function createWorkspace(config: Record<string, unknown>): DocsWorkspace {
    return {
        config: { instances: [{ url: "acme.docs.buildwithfern.com" }], ...config }
    } as unknown as DocsWorkspace;
}

function createDocsDefinition(pages: { pageId: string; slug: string }[]): DocsV1Write.DocsDefinition {
    return {
        config: {
            root: {
                type: "root",
                version: "v1",
                id: "root",
                slug: "",
                title: "Docs",
                child: {
                    type: "unversioned",
                    id: "unversioned",
                    child: {
                        type: "sidebarRoot",
                        id: "sidebar",
                        children: [
                            {
                                type: "sidebarGroup",
                                id: "group",
                                children: pages.map(({ pageId, slug }) => ({
                                    type: "page",
                                    id: pageId,
                                    pageId,
                                    slug,
                                    title: pageId
                                }))
                            }
                        ]
                    }
                }
            }
        }
    } as unknown as DocsV1Write.DocsDefinition;
}

beforeEach(() => {
    vi.stubGlobal(
        "fetch",
        vi.fn(async () =>
            Response.json({
                entries: [
                    { pageId: "welcome.mdx", slug: "welcome", lastUpdated: "2024-01-01T00:00:00.000Z" },
                    { pageId: "old.mdx", slug: "old", lastUpdated: "2024-01-01T00:00:00.000Z" }
                ]
            })
        )
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("validateMissingRedirects", () => {
    const docsDefinition = createDocsDefinition([{ pageId: "welcome.mdx", slug: "welcome" }]);

    it("warns about a removed page of the published instance using the given docs definition", async () => {
        const violations = await validateMissingRedirects({
            workspace: createWorkspace({}),
            docsDefinition,
            instanceUrl: "beta.docs.buildwithfern.com",
            token: "token",
            logger
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]).toMatchObject({ name: "missing-redirects", severity: "warning" });
        expect(violations[0]?.message).toContain('"/old"');
        const requestBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body));
        expect(requestBody.domain).toBe("beta.docs.buildwithfern.com");
    });

    it("reports an error when docs.yml sets missing-redirects to error", async () => {
        const violations = await validateMissingRedirects({
            workspace: createWorkspace({ check: { rules: { missingRedirects: "error" } } }),
            docsDefinition,
            instanceUrl: "beta.docs.buildwithfern.com",
            token: "token",
            logger
        });
        expect(violations.map((violation) => violation.severity)).toEqual(["error"]);
    });

    it("returns nothing when a redirect covers the removed page", async () => {
        const violations = await validateMissingRedirects({
            workspace: createWorkspace({ redirects: [{ source: "/old", destination: "/welcome" }] }),
            docsDefinition,
            instanceUrl: "beta.docs.buildwithfern.com",
            token: "token",
            logger
        });
        expect(violations).toEqual([]);
    });
});
