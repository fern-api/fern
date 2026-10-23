import { describe, expect, it } from "vitest";

import {
    docsFiles,
    ledgerRegister,
    legacyFinish,
    navigationNodes,
    publishedSite,
    useDocsEnvironment
} from "./docsGenerateHarness.js";

// `fern generate --docs`: how docs.yml's navigation (sections, tabs, versions, products, links, changelogs) and
// redirects become the navigation tree FDR receives, and what the missing-redirects check says about the change.

const INSTANCE = "instances:\n  - url: acme.docs.buildwithfern.com\n";

interface Node {
    type: string;
    title?: string;
    slug?: string;
    pageId?: string;
    hidden?: boolean;
    collapsed?: boolean;
    children?: Node[];
    child?: Node;
    [key: string]: unknown;
}

describe("fern generate --docs: navigation", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    const root = (): Node => {
        const [locale] = ledgerRegister(env.fdr).locales;
        return locale?.root as Node;
    };

    /** The `sidebarRoot` under `root.child`, for a site with one version, no tabs and no products. */
    const sidebar = (): Node[] => {
        const group = root().child?.child?.children?.[0];
        return group?.children ?? [];
    };

    describe("pages and sections", () => {
        const files = docsFiles(
            `${INSTANCE}navigation:
  - section: Guides
    slug: my-guides
    collapsed: true
    contents:
      - page: Intro
        path: guides/intro.mdx
        slug: hello
      - section: Deep
        skip-slug: true
        contents:
          - page: Deeper
            path: guides/deeper.mdx
      - page: Hidden
        path: guides/hidden.mdx
        hidden: true
  - link: Blog
    href: https://acme.com/blog
`,
            { "guides/intro.mdx": "# Intro\n", "guides/deeper.mdx": "# Deeper\n", "guides/hidden.mdx": "# Hidden\n" }
        );

        it("sends a titled root with no slug, over an unversioned site", async () => {
            await env.run(env.project(files));

            expect(root()).toMatchObject({
                type: "root",
                version: "v1",
                slug: "",
                title: "Documentation",
                hidden: false,
                child: { type: "unversioned", child: { type: "sidebarRoot" } }
            });
        });

        it("nests pages under the sections they are listed in, with the slug the section was given", async () => {
            await env.run(env.project(files));

            const [section] = sidebar();
            expect(section).toMatchObject({ type: "section", title: "Guides", slug: "my-guides", collapsed: true });
            expect(section?.children?.map((child) => [child.type, child.title, child.slug])).toEqual([
                ["page", "Intro", "my-guides/hello"],
                ["section", "Deep", "my-guides"],
                ["page", "Hidden", "my-guides/hidden"]
            ]);
        });

        it("keeps the parent's slug for a section that skips its slug", async () => {
            await env.run(env.project(files));

            const deep = sidebar()[0]?.children?.[1];
            expect(deep?.slug).toBe("my-guides");
            expect(deep?.children?.[0]).toMatchObject({ slug: "my-guides/deeper", pageId: "guides/deeper.mdx" });
        });

        it("marks a hidden page as hidden and still sends it", async () => {
            await env.run(env.project(files));

            const hidden = sidebar()[0]?.children?.[2];
            expect(hidden).toMatchObject({ hidden: true, pageId: "guides/hidden.mdx" });
        });

        it("sends an external link as a link node with its URL", async () => {
            await env.run(env.project(files));

            expect(sidebar()[1]).toMatchObject({ type: "link", title: "Blog", url: "https://acme.com/blog" });
        });

        it("sends each page's path as its id", async () => {
            await env.run(env.project(files));

            expect(Object.keys(ledgerRegister(env.fdr).locales[0]?.pages ?? {}).sort()).toEqual([
                "guides/deeper.mdx",
                "guides/hidden.mdx",
                "guides/intro.mdx"
            ]);
        });

        it("sends the same tree in the legacy registration", async () => {
            await env.run(env.project(files));
            const ledgerNodes = navigationNodes(root());
            env.setDeployMode("legacy");

            await env.run(env.project(files));

            expect(navigationNodes(legacyFinish(env.fdr).docsDefinition.config.root)).toEqual(ledgerNodes);
            expect(ledgerNodes.length).toBeGreaterThan(5);
        });

        it("takes the sidebar title and slug from the page's front matter", async () => {
            const project = docsFiles(`${INSTANCE}navigation:\n  - page: Welcome\n    path: welcome.mdx\n`, {
                "welcome.mdx": "---\nslug: custom-welcome\nsidebar-title: Short\nnoindex: true\n---\n# Welcome\n"
            });

            await env.run(env.project(project));

            expect(sidebar()[0]).toMatchObject({
                type: "page",
                slug: "custom-welcome",
                title: "Short",
                noindex: true,
                pageId: "welcome.mdx"
            });
        });

        it("sends a landing page apart from the sidebar", async () => {
            const project = docsFiles(
                `${INSTANCE}landing-page:\n  page: Home\n  path: home.mdx\nnavigation:\n  - page: Welcome\n    path: welcome.mdx\n`,
                { "welcome.mdx": "# Welcome\n", "home.mdx": "# Home\n" }
            );

            await env.run(env.project(project));

            expect(root().child).toMatchObject({
                type: "unversioned",
                landingPage: { type: "landingPage", title: "Home", slug: "home", pageId: "home.mdx" }
            });
            expect(sidebar().map((node) => node.pageId)).toEqual(["welcome.mdx"]);
        });
    });

    describe("tabs", () => {
        const files = docsFiles(
            `${INSTANCE}tabs:
  guides:
    display-name: Guides
    icon: book
  ref:
    display-name: Reference
    slug: reference
  site:
    display-name: Website
    href: https://acme.com
navigation:
  - tab: guides
    layout:
      - page: Intro
        path: intro.mdx
  - tab: ref
    layout:
      - page: Ref
        path: ref.mdx
  - tab: site
`,
            { "intro.mdx": "# Intro\n", "ref.mdx": "# Ref\n" }
        );

        it("sends a tab with its title, icon, slug and sidebar, and a tab with an href as a link", async () => {
            await env.run(env.project(files));

            const tabbed = root().child?.child;
            expect(tabbed?.type).toBe("tabbed");
            expect(tabbed?.children?.map((tab) => [tab.type, tab.title, tab.slug, tab.icon, tab.url])).toEqual([
                ["tab", "Guides", "guides", "book", undefined],
                ["tab", "Reference", "reference", undefined, undefined],
                ["link", "Website", undefined, undefined, "https://acme.com"]
            ]);
        });

        it("prefixes the slug of each page with the slug of its tab", async () => {
            await env.run(env.project(files));

            expect(
                navigationNodes(root())
                    .filter((node) => node.type === "page")
                    .map((node) => node.slug)
            ).toEqual(["guides/intro", "reference/ref"]);
        });
    });

    describe("versions", () => {
        const files = docsFiles(
            `${INSTANCE}versions:
  - display-name: v2
    path: versions/v2.yml
    slug: v2
  - display-name: v1
    path: versions/v1.yml
    slug: v1
`,
            {
                "versions/v2.yml": "navigation:\n  - page: Intro\n    path: ../v2/intro.mdx\n",
                "versions/v1.yml": "navigation:\n  - page: Intro\n    path: ../v1/intro.mdx\n",
                "v2/intro.mdx": "# v2\n",
                "v1/intro.mdx": "# v1\n"
            }
        );

        it("sends each version with its id, title and slug, and the first as the default", async () => {
            await env.run(env.project(files));

            const versioned = root().child;
            expect(versioned?.type).toBe("versioned");
            expect(
                versioned?.children?.map((version) => [version.versionId, version.title, version.slug, version.default])
            ).toEqual([
                ["v2", "v2", "v2", true],
                ["v1", "v1", "v1", false]
            ]);
        });

        it("sends the pages of every version, each under its version's slug", async () => {
            await env.run(env.project(files));

            expect(
                navigationNodes(root())
                    .filter((node) => node.type === "page")
                    .map((node) => node.slug)
            ).toEqual(["v2/intro", "v1/intro"]);
            expect(Object.keys(ledgerRegister(env.fdr).locales[0]?.pages ?? {}).sort()).toEqual([
                "v1/intro.mdx",
                "v2/intro.mdx"
            ]);
        });

        it("marks the version docs.yml names as the default", async () => {
            const withDefault = docsFiles(
                `${INSTANCE}versions:\n  - display-name: v2\n    path: versions/v2.yml\n    slug: v2\n  - display-name: v1\n    path: versions/v1.yml\n    slug: v1\n    default: true\n`,
                {
                    "versions/v2.yml": "navigation:\n  - page: Intro\n    path: ../v2/intro.mdx\n",
                    "versions/v1.yml": "navigation:\n  - page: Intro\n    path: ../v1/intro.mdx\n",
                    "v2/intro.mdx": "# v2\n",
                    "v1/intro.mdx": "# v1\n"
                }
            );

            await env.run(env.project(withDefault));

            expect(root().child?.children?.map((version) => [version.versionId, version.default])).toEqual([
                ["v2", false],
                ["v1", true]
            ]);
        });
    });

    describe("products", () => {
        const files = docsFiles(
            `${INSTANCE}products:
  - display-name: Alpha
    path: products/alpha.yml
    slug: alpha
  - display-name: Beta
    path: products/beta.yml
    slug: beta
`,
            {
                "products/alpha.yml": "navigation:\n  - page: A\n    path: ../alpha.mdx\n",
                "products/beta.yml": "navigation:\n  - page: B\n    path: ../beta.mdx\n",
                "alpha.mdx": "# A\n",
                "beta.mdx": "# B\n"
            }
        );

        it("sends a product group with one product per entry, each with its slug", async () => {
            await env.run(env.project(files));

            expect(root().child?.type).toBe("productgroup");
            expect(root().child?.children?.map((product) => [product.type, product.productId, product.slug])).toEqual([
                ["product", "Alpha", "alpha"],
                ["product", "Beta", "beta"]
            ]);
        });

        it("prefixes each page with the slug of its product", async () => {
            await env.run(env.project(files));

            expect(
                navigationNodes(root())
                    .filter((node) => node.type === "page")
                    .map((node) => node.slug)
            ).toEqual(["alpha/a", "beta/b"]);
        });
    });

    describe("changelogs", () => {
        const files = docsFiles(
            `${INSTANCE}navigation:\n  - page: Welcome\n    path: welcome.mdx\n  - changelog: ./changelog\n    title: Release notes\n    slug: release-notes\n`,
            {
                "welcome.mdx": "# Welcome\n",
                "changelog/2026-01-01.mdx": "# Jan\n",
                "changelog/2026-02-01.mdx": "# Feb\n"
            }
        );

        it("sends a changelog node with an entry for each dated file, newest first", async () => {
            await env.run(env.project(files));

            const changelog = sidebar().find((node) => node.type === "changelog");
            expect(changelog).toMatchObject({ title: "Release notes", slug: "release-notes" });
            const entries = navigationNodes(changelog).filter((node) => node.type === "changelogEntry");
            expect(entries.map((entry) => entry.title)).toEqual(["February 1, 2026", "January 1, 2026"]);
            expect(entries.map((entry) => entry.slug)).toEqual(["release-notes/2026/2/1", "release-notes/2026/1/1"]);
        });

        it("sends the changelog files as pages", async () => {
            await env.run(env.project(files));

            expect(Object.keys(ledgerRegister(env.fdr).locales[0]?.pages ?? {}).sort()).toEqual([
                "changelog/2026-01-01.mdx",
                "changelog/2026-02-01.mdx",
                "welcome.mdx"
            ]);
        });

        // NOTE: the month nodes of the changelog are titled "February 1900" and get the slug `<changelog>/2`, without the
        // year, although the year node and the entries under them carry 2026.
        it("titles the month nodes with the year 1900 and slugs them without the year", async () => {
            await env.run(env.project(files));

            const months = navigationNodes(root()).filter((node) => node.type === "changelogMonth");
            expect(months.map((month) => [month.title, month.slug])).toEqual([
                ["February 1900", "release-notes/2"],
                ["January 1900", "release-notes/1"]
            ]);
        });

        it("logs an error, and still publishes, for a changelog whose URL feeds cannot be served", async () => {
            const unservable = docsFiles(
                `${INSTANCE}navigation:\n  - changelog: ./changelog\n    title: Release notes\n    slug: releases\n`,
                { "changelog/2026-01-01.mdx": "# Jan\n" }
            );

            const { errors, error } = await env.attempt(env.project(unservable));

            expect(error).toBeUndefined();
            expect(errors.some((line) => line.includes('resolves to URL path "/releases"'))).toBe(true);
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });
    });

    describe("audiences", () => {
        function versions(instanceAudiences: string): Record<string, string> {
            return docsFiles(
                `instances:
  - url: acme.docs.buildwithfern.com
${instanceAudiences}versions:
  - display-name: Public
    path: versions/public.yml
    slug: public
    audiences:
      - external
  - display-name: Internal
    path: versions/internal.yml
    slug: internal
    audiences:
      - internal
  - display-name: Everyone
    path: versions/everyone.yml
    slug: everyone
`,
                {
                    "versions/public.yml": "navigation:\n  - page: Public page\n    path: ../public.mdx\n",
                    "versions/internal.yml": "navigation:\n  - page: Internal page\n    path: ../internal.mdx\n",
                    "versions/everyone.yml": "navigation:\n  - page: Everyone page\n    path: ../everyone.mdx\n",
                    "public.mdx": "# Public\n",
                    "internal.mdx": "# Internal\n",
                    "everyone.mdx": "# Everyone\n"
                }
            );
        }

        const versionTitles = (): Array<string | undefined> => (root().child?.children ?? []).map((node) => node.title);

        it("leaves out the versions that are not for the audience of the instance, and keeps those for everyone", async () => {
            await env.run(env.project(versions("    audiences: external\n")));

            expect(versionTitles()).toEqual(["Public", "Everyone"]);
        });

        // NOTE: only the navigation is filtered. The text of the pages of a version that was left out is still sent.
        it("still sends the pages of a version it left out of the navigation", async () => {
            await env.run(env.project(versions("    audiences: external\n")));

            expect(Object.keys(ledgerRegister(env.fdr).locales[0]?.pages ?? {}).sort()).toEqual([
                "everyone.mdx",
                "internal.mdx",
                "public.mdx"
            ]);
            const navigationPages = navigationNodes(root())
                .filter((node) => node.type === "page")
                .map((node) => node.title);
            expect(navigationPages).toEqual(["Public page", "Everyone page"]);
        });

        it("accepts several audiences for the instance", async () => {
            await env.run(env.project(versions("    audiences:\n      - external\n      - internal\n")));

            expect(versionTitles()).toEqual(["Public", "Internal", "Everyone"]);
        });

        it("publishes everything when the instance names no audience", async () => {
            await env.run(env.project(versions("")));

            expect(versionTitles()).toEqual(["Public", "Internal", "Everyone"]);
        });

        it("filters the same way in the legacy registration", async () => {
            env.setDeployMode("legacy");

            await env.run(env.project(versions("    audiences: internal\n")));

            const titles = navigationNodes(publishedSite(env.fdr, "legacy").root)
                .filter((node) => node.type === "page")
                .map((node) => node.title);
            expect(titles).toEqual(["Internal page", "Everyone page"]);
        });
    });
});

describe("fern generate --docs: redirects and the missing-redirects check", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    const WELCOME = `${INSTANCE}navigation:\n  - page: Welcome\n    path: welcome.mdx\n`;
    const SECOND = `${INSTANCE}navigation:\n  - page: Welcome\n    path: welcome.mdx\n`;

    const published = (...pages: Array<{ pageId: string; slug: string }>): void => {
        env.fdr.respond("POST /slugs/markdowns", {
            entries: pages.map((page) => ({ ...page, lastUpdated: "2026-01-01T00:00:00.000Z" }))
        });
    };

    const warnings = (logs: string[]): string[] =>
        logs.filter((line) => line.startsWith("warn: ") || line.includes("[warn]"));

    it("asks FDR which pages the live site has, for the domain and base path being published", async () => {
        await env.run(env.project(docsFiles(WELCOME, { "welcome.mdx": "# Welcome\n" })));

        expect(env.fdr.to("POST /slugs/markdowns").map((request) => request.body)).toEqual([
            { domain: "acme.docs.buildwithfern.com", basepath: "" }
        ]);
        expect(env.fdr.headersTo("POST /slugs/markdowns")[0]?.authorization).toBe("Bearer token");
    });

    it("says nothing when the live site has no pages yet", async () => {
        published();

        const { logs } = await env.run(env.project(docsFiles(WELCOME, { "welcome.mdx": "# Welcome\n" })));

        expect(logs.some((line) => line.includes("was removed") || line.includes("check skipped"))).toBe(false);
    });

    it("says nothing when every live page is still there at its URL", async () => {
        published({ pageId: "welcome.mdx", slug: "welcome" });

        const { logs } = await env.run(env.project(docsFiles(WELCOME, { "welcome.mdx": "# Welcome\n" })));

        expect(logs.some((line) => line.includes("was removed") || line.includes("was moved"))).toBe(false);
    });

    it("warns about a live page that is gone, and publishes anyway", async () => {
        published({ pageId: "welcome.mdx", slug: "welcome" }, { pageId: "gone.mdx", slug: "guides/gone" });

        const { logs, error } = await env.attempt(env.project(docsFiles(WELCOME, { "welcome.mdx": "# Welcome\n" })));

        expect(error).toBeUndefined();
        expect(logs.join("\n")).toContain(
            'Page "gone.mdx" was removed. The previously published URL "/guides/gone" will return 404 without a redirect. Consider adding a redirect to preserve existing links.'
        );
        expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
    });

    it("warns about a live page that moved, and suggests the redirect", async () => {
        published({ pageId: "welcome.mdx", slug: "old-welcome" });

        const { logs } = await env.run(env.project(docsFiles(WELCOME, { "welcome.mdx": "# Welcome\n" })));

        expect(logs.join("\n")).toContain(
            'Page "welcome.mdx" was moved from "/old-welcome" to "/welcome". The old URL will return 404 without a redirect. Add to redirects: [{source: "/old-welcome", destination: "/welcome"}]'
        );
    });

    it("does not warn about a removed page that has a redirect", async () => {
        published({ pageId: "gone.mdx", slug: "guides/gone" });
        const docs = `${WELCOME}redirects:\n  - source: /guides/gone\n    destination: /welcome\n`;

        const { logs } = await env.run(env.project(docsFiles(docs, { "welcome.mdx": "# Welcome\n" })));

        expect(logs.join("\n")).not.toContain("was removed");
    });

    it("accepts a redirect with a pattern as covering the removed page", async () => {
        published({ pageId: "gone.mdx", slug: "guides/gone" });
        const docs = `${WELCOME}redirects:\n  - source: /guides/:slug\n    destination: /welcome\n`;

        const { logs } = await env.run(env.project(docsFiles(docs, { "welcome.mdx": "# Welcome\n" })));

        expect(logs.join("\n")).not.toContain("was removed");
    });

    it("does not warn about a page whose URL another page now serves", async () => {
        published({ pageId: "old.mdx", slug: "welcome" });

        const { logs } = await env.run(env.project(docsFiles(WELCOME, { "welcome.mdx": "# Welcome\n" })));

        expect(logs.join("\n")).not.toContain("was removed");
    });

    it("looks at the base path of the instance when it compares the URLs", async () => {
        published({ pageId: "gone.mdx", slug: "docs/guides/gone" });
        const docs = `instances:\n  - url: acme.docs.buildwithfern.com/docs\nnavigation:\n  - page: Welcome\n    path: welcome.mdx\nredirects:\n  - source: /guides/gone\n    destination: /welcome\n`;

        const { logs } = await env.run(env.project(docsFiles(docs, { "welcome.mdx": "# Welcome\n" })));

        expect(env.fdr.to("POST /slugs/markdowns")[0]?.body).toEqual({
            domain: "acme.docs.buildwithfern.com",
            basepath: "/docs"
        });
        expect(logs.join("\n")).not.toContain("was removed");
    });

    it("fails the publish, and finishes nothing, when docs.yml makes a missing redirect an error", async () => {
        published({ pageId: "gone.mdx", slug: "guides/gone" });
        const docs = `${WELCOME}check:\n  rules:\n    missing-redirects: error\n`;

        const { error, errors } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": "# Welcome\n" })));

        expect(error).toBeDefined();
        expect(errors).toContain('Failed to publish docs. "Some removed pages have no redirect."');
        expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
    });

    it("publishes when docs.yml makes a missing redirect an error and the redirect is there", async () => {
        published({ pageId: "gone.mdx", slug: "guides/gone" });
        const docs = `${WELCOME}redirects:\n  - source: /guides/gone\n    destination: /welcome\ncheck:\n  rules:\n    missing-redirects: error\n`;

        await env.run(env.project(docsFiles(docs, { "welcome.mdx": "# Welcome\n" })));

        expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
    });

    it("keeps a missing redirect a warning when docs.yml says warn", async () => {
        published({ pageId: "gone.mdx", slug: "guides/gone" });
        const docs = `${WELCOME}check:\n  rules:\n    missing-redirects: warn\n`;

        const { error } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": "# Welcome\n" })));

        expect(error).toBeUndefined();
    });

    it("warns that it could not check, and publishes, when FDR cannot give the live pages", async () => {
        env.fdr.reply("POST /slugs/markdowns", { status: 500, body: {} });

        const { logs, error } = await env.attempt(env.project(docsFiles(WELCOME, { "welcome.mdx": "# Welcome\n" })));

        expect(error).toBeUndefined();
        expect(logs.join("\n")).toContain(
            "Missing redirects check skipped: could not reach FDR (FDR returned 500). The check requires network access to compare against previously published docs."
        );
        expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
    });

    it("warns that it could not check when the request itself fails", async () => {
        env.fdr.reply("POST /slugs/markdowns", "network-failure");

        const { logs } = await env.run(env.project(docsFiles(WELCOME, { "welcome.mdx": "# Welcome\n" })));

        expect(logs.join("\n")).toContain("Missing redirects check skipped: could not reach FDR (fetch failed).");
    });

    it("makes a failed check a failure when docs.yml makes missing redirects an error", async () => {
        env.fdr.reply("POST /slugs/markdowns", { status: 500, body: {} });
        const docs = `${WELCOME}check:\n  rules:\n    missing-redirects: error\n`;

        const { error } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": "# Welcome\n" })));

        expect(error).toBeDefined();
        expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
    });

    it("compares the live site for a preview too, with the same domain", async () => {
        await env.run(env.project(docsFiles(SECOND, { "welcome.mdx": "# Welcome\n" })), { preview: true });

        expect(env.fdr.to("POST /slugs/markdowns").map((request) => request.body)).toEqual([
            { domain: "acme.docs.buildwithfern.com", basepath: "" }
        ]);
    });

    it("checks before it publishes anything", async () => {
        published({ pageId: "gone.mdx", slug: "guides/gone" });
        const docs = `${WELCOME}check:\n  rules:\n    missing-redirects: error\n`;

        await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": "# Welcome\n" })));

        expect(env.fdr.requests.map((request) => request.path)).not.toContain("/docs-ledger/register");
    });
});
