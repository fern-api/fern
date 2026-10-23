import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { blobUploadUrl } from "./commandHarness.js";
import {
    docsFiles,
    ledgerJsFiles,
    ledgerPages,
    ledgerRegister,
    legacyFinish,
    svg,
    uploadedBlobs,
    useDocsEnvironment,
    writeBesideFernFolder
} from "./docsGenerateHarness.js";

// `fern generate --docs`: how the pages, images, files and docs.yml settings of a project turn into what FDR receives.

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");

const INSTANCE = "instances:\n  - url: acme.docs.buildwithfern.com\n";
const WELCOME_NAV = "navigation:\n  - page: Welcome\n    path: welcome.mdx\n";

/** A project whose docs.yml is `settings` (top-level keys) over the instance and a one-page navigation. */
function withSettings(settings: string, files: Record<string, string> = {}): Record<string, string> {
    return docsFiles(`${INSTANCE}${settings}${WELCOME_NAV}`, { "welcome.mdx": "# Welcome\n", ...files });
}

describe("fern generate --docs: pages", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    const pagesSent = (): Record<string, string> => {
        const [locale] = ledgerRegister(env.fdr).locales;
        if (locale == null) {
            throw new Error("no locale");
        }
        return ledgerPages(env.fdr, locale);
    };

    it("sends every page of the navigation under its path, with its front matter", async () => {
        const markdown = "---\ntitle: Hello\ndescription: A greeting\n---\n# Welcome\n\nText.\n";

        await env.run(env.project(withSettings("", { "welcome.mdx": markdown })));

        expect(pagesSent()).toEqual({ "welcome.mdx": markdown });
    });

    it("sends only the pages the navigation lists", async () => {
        await env.run(env.project(withSettings("", { "unused.mdx": "# Unused\n" })));

        expect(Object.keys(pagesSent())).toEqual(["welcome.mdx"]);
    });

    it("inlines the file a <Markdown src> names, and sends that file with the JS files", async () => {
        const files = {
            "welcome.mdx": '# Welcome\n\n<Markdown src="./snippets/part.mdx" />\n',
            "snippets/part.mdx": "Shared paragraph.\n"
        };

        await env.run(env.project(withSettings("", files)));

        expect(pagesSent()["welcome.mdx"]).toContain("Shared paragraph.");
        expect(pagesSent()["welcome.mdx"]).not.toContain("<Markdown");
        const [locale] = ledgerRegister(env.fdr).locales;
        expect(ledgerJsFiles(env.fdr, locale as never)).toEqual({ "snippets/part.mdx": "Shared paragraph.\n" });
    });

    it("inlines the file a <Code src> names as a code block", async () => {
        const files = {
            "welcome.mdx": '# Welcome\n\n<Code src="./code/hello.py" />\n',
            "code/hello.py": "print('hello')\n"
        };

        await env.run(env.project(withSettings("", files)));

        expect(pagesSent()["welcome.mdx"]).toContain("print('hello')");
        expect(pagesSent()["welcome.mdx"]).not.toContain("<Code src");
    });

    it("removes MDX comments from what it sends", async () => {
        const files = { "welcome.mdx": "# Welcome\n\n{/* internal note */}\n\nVisible.\n" };

        await env.run(env.project(withSettings("", files)));

        expect(pagesSent()["welcome.mdx"]).not.toContain("internal note");
        expect(pagesSent()["welcome.mdx"]).toContain("Visible.");
    });

    it("sends the same page text in the legacy registration, with the raw text beside it", async () => {
        env.setDeployMode("legacy");
        const files = { "welcome.mdx": "# Welcome\n\n{/* internal note */}\n\nVisible.\n" };

        await env.run(env.project(withSettings("", files)));

        const page = legacyFinish(env.fdr).docsDefinition.pages["welcome.mdx"];
        expect(page?.markdown).not.toContain("internal note");
        expect(page?.markdown).toContain("Visible.");
        expect(page?.rawMarkdown).not.toContain("internal note");
    });

    it("turns a relative link to another page into that page's URL", async () => {
        const files = {
            "docs.yml": `${INSTANCE}navigation:\n  - page: Welcome\n    path: welcome.mdx\n  - section: Guides\n    contents:\n      - page: Intro\n        path: guides/intro.mdx\n`,
            "welcome.mdx": "# Welcome\n\n[Intro](./guides/intro.mdx)\n",
            "guides/intro.mdx": "# Intro\n"
        };

        await env.run(env.project(docsFiles(files["docs.yml"], files)));

        expect(pagesSent()["welcome.mdx"]).toContain("[Intro](/guides/intro)");
    });

    it("keeps a link to a file that is not an image as written", async () => {
        const files = { "welcome.mdx": "# Welcome\n\n[Manual](./manual.pdf)\n", "manual.pdf": "%PDF-1.4\n" };

        await env.run(env.project(withSettings("", files)));

        expect(pagesSent()["welcome.mdx"]).toContain("[Manual](./manual.pdf)");
    });

    it("names the blob of each page by the SHA-256 of its text, so a page that did not change is not uploaded again", async () => {
        await env.run(env.project(withSettings("", { "welcome.mdx": "# Same\n" })));

        const [locale] = ledgerRegister(env.fdr).locales;
        expect(locale?.pages["welcome.mdx"]?.hash).toBe(sha256("# Same\n"));
    });

    it("gives two pages with the same text the same hash", async () => {
        const nav = `${INSTANCE}navigation:\n  - page: One\n    path: one.mdx\n  - page: Two\n    path: two.mdx\n`;

        await env.run(env.project(docsFiles(nav, { "one.mdx": "# Same\n", "two.mdx": "# Same\n" })));

        const [locale] = ledgerRegister(env.fdr).locales;
        expect(locale?.pages["one.mdx"]?.hash).toBe(locale?.pages["two.mdx"]?.hash);
        expect([...uploadedBlobs(env.fdr).keys()]).toEqual([sha256("# Same\n")]);
    });

    it("reports how many pages it resolved", async () => {
        const { logs } = await env.run(env.project(withSettings("")));

        expect(logs.some((line) => /^info: Resolved docs definition in \d+ms: 1 pages$/.test(line))).toBe(true);
    });
});

describe("fern generate --docs: images and files", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    const HERO = svg(300, 200);
    const PAGE_WITH_IMAGE = "# Welcome\n\n![Hero](./assets/hero.svg)\n";

    describe("through the ledger", () => {
        it("describes an image by hash, type, size and measured dimensions", async () => {
            await env.run(env.project(withSettings("", { "welcome.mdx": PAGE_WITH_IMAGE, "assets/hero.svg": HERO })));

            expect(ledgerRegister(env.fdr).locales[0]?.fileManifest).toEqual({
                "assets/hero.svg": {
                    hash: sha256(HERO),
                    contentType: "image/svg+xml",
                    contentLength: Buffer.byteLength(HERO),
                    filename: "hero.svg",
                    width: 300,
                    height: 200
                }
            });
        });

        it("points the page at the image by its path, and lists the image as referenced by the page", async () => {
            await env.run(env.project(withSettings("", { "welcome.mdx": PAGE_WITH_IMAGE, "assets/hero.svg": HERO })));

            const [locale] = ledgerRegister(env.fdr).locales;
            expect(ledgerPages(env.fdr, locale as never)["welcome.mdx"]).toBe(
                "# Welcome\n\n![Hero](file:assets/hero.svg)\n"
            );
            expect(locale?.pages["welcome.mdx"]?.referencedFiles).toEqual(["assets/hero.svg"]);
        });

        it("uploads the image to the URL FDR gave for its hash", async () => {
            await env.run(env.project(withSettings("", { "welcome.mdx": PAGE_WITH_IMAGE, "assets/hero.svg": HERO })));

            expect(uploadedBlobs(env.fdr).has(sha256(HERO))).toBe(true);
        });

        it("does not upload an image FDR already has", async () => {
            env.fdr.respond("POST /docs-ledger/register", {
                deploymentHash: "hash-1",
                missingContent: [
                    { hash: sha256("# Welcome\n\n![Hero](file:assets/hero.svg)\n"), uploadUrl: blobUploadUrl("page") }
                ]
            });

            await env.run(env.project(withSettings("", { "welcome.mdx": PAGE_WITH_IMAGE, "assets/hero.svg": HERO })));

            expect(uploadedBlobs(env.fdr).has(sha256(HERO))).toBe(false);
        });

        it("describes a file that is not an image without dimensions", async () => {
            const files = { "welcome.mdx": "# Welcome\n", "assets/custom.js": "console.log(1)\n" };

            await env.run(env.project(withSettings("js:\n  - path: assets/custom.js\n", files)));

            expect(ledgerRegister(env.fdr).locales[0]?.fileManifest).toEqual({
                "assets/custom.js": {
                    hash: sha256("console.log(1)\n"),
                    contentType: "application/javascript",
                    contentLength: 15,
                    filename: "custom.js"
                }
            });
        });

        it("sends no manifest when the docs have no files", async () => {
            await env.run(env.project(withSettings("")));

            expect(ledgerRegister(env.fdr).locales[0]?.fileManifest).toBeUndefined();
        });

        it("gives two images with the same bytes the same hash", async () => {
            const files = {
                "welcome.mdx": "# Welcome\n\n![A](./a.svg)\n\n![B](./b.svg)\n",
                "a.svg": HERO,
                "b.svg": HERO
            };

            await env.run(env.project(withSettings("", files)));

            const manifest = ledgerRegister(env.fdr).locales[0]?.fileManifest ?? {};
            expect(manifest["a.svg"]?.hash).toBe(manifest["b.svg"]?.hash);
            const pageHash = ledgerRegister(env.fdr).locales[0]?.pages["welcome.mdx"]?.hash ?? "";
            expect([...uploadedBlobs(env.fdr).keys()].sort()).toEqual([sha256(HERO), pageHash].sort());
        });

        it("names a file outside the fern folder with _dot_dot_ in place of ../", async () => {
            const project = await env.project(
                withSettings("", { "welcome.mdx": "# Welcome\n\n![Out](../shared/pic.svg)\n" })
            );
            await writeBesideFernFolder(project, "shared/pic.svg", svg(10, 10));

            await env.run(project);

            const manifest = ledgerRegister(env.fdr).locales[0]?.fileManifest ?? {};
            expect(Object.keys(manifest)).toEqual(["_dot_dot_/shared/pic.svg"]);
            const [locale] = ledgerRegister(env.fdr).locales;
            expect(ledgerPages(env.fdr, locale as never)["welcome.mdx"]).toContain("file:_dot_dot_/shared/pic.svg");
        });

        it("reports an image it cannot measure, and sends it as a file without dimensions", async () => {
            const files = { "welcome.mdx": "# Welcome\n\n![Bad](./bad.png)\n", "bad.png": "not a png" };

            const { logs } = await env.run(env.project(withSettings("", files)));

            expect(
                logs.some(
                    (line) => line.startsWith("error: Failed to measure image size for ") && line.includes("bad.png")
                )
            ).toBe(true);
            const entry = ledgerRegister(env.fdr).locales[0]?.fileManifest?.["bad.png"];
            expect(entry).toMatchObject({ contentType: "image/png", filename: "bad.png" });
            expect(entry).not.toHaveProperty("width");
        });

        it("sends the favicon and logos with the config, and the logos with their dimensions", async () => {
            const settings =
                "favicon: assets/favicon.svg\nlogo:\n  light: assets/logo-light.svg\n  dark: assets/logo-dark.svg\n  height: 30\n  href: https://acme.com\n";
            const files = {
                "assets/favicon.svg": svg(16, 16),
                "assets/logo-light.svg": svg(100, 30),
                "assets/logo-dark.svg": svg(120, 36)
            };

            await env.run(env.project(withSettings(settings, files)));

            const [locale] = ledgerRegister(env.fdr).locales;
            expect(locale?.config).toMatchObject({
                favicon: "assets/favicon.svg",
                logoHeight: 30,
                logoHref: "https://acme.com",
                colorsV3: {
                    dark: { logo: { path: "assets/logo-dark.svg", width: 120, height: 36 } },
                    light: { logo: { path: "assets/logo-light.svg", width: 100, height: 30 } }
                }
            });
            expect(Object.keys(locale?.fileManifest ?? {}).sort()).toEqual([
                "assets/favicon.svg",
                "assets/logo-dark.svg",
                "assets/logo-light.svg"
            ]);
        });

        it("sends an image of the metadata as a path and one given as a URL as a URL", async () => {
            const settings =
                "metadata:\n  og:title: Acme\n  og:image: assets/hero.svg\n  twitter:image: https://acme.com/card.png\n";

            await env.run(env.project(withSettings(settings, { "assets/hero.svg": HERO })));

            expect(ledgerRegister(env.fdr).locales[0]?.config.metadata).toMatchObject({
                "og:title": "Acme",
                "og:image": { type: "path", value: "assets/hero.svg" },
                "twitter:image": { type: "url", value: "https://acme.com/card.png" }
            });
        });
    });

    describe("through the legacy registration", () => {
        const UPLOAD_URL = "https://s3.test/upload/hero";

        function legacyWithHero(init: Record<string, unknown> = {}): void {
            env.setDeployMode("legacy");
            env.stubAxios("put", () => ({}));
            env.fdr.respond("POST /v2/registry/docs/v2/init", {
                docsRegistrationId: "registration-1",
                uploadUrls: { "assets/hero.svg": { uploadUrl: UPLOAD_URL, fileId: "file-hero" } },
                skippedFiles: [],
                ...init
            });
        }

        const project = (): Promise<ReturnType<typeof env.project> extends Promise<infer P> ? P : never> =>
            env.project(withSettings("", { "welcome.mdx": PAGE_WITH_IMAGE, "assets/hero.svg": HERO }));

        it("tells FDR the hash and measured size of each image before anything is uploaded", async () => {
            legacyWithHero();

            await env.run(project());

            expect(env.fdr.to("POST /v2/registry/docs/v2/init")[0]?.body).toMatchObject({
                filepaths: [],
                images: [{ filePath: "assets/hero.svg", width: 300, height: 200, fileHash: sha256(HERO) }]
            });
        });

        it("tells FDR the hash of each file that is not an image", async () => {
            legacyWithHero({ uploadUrls: { "assets/custom.js": { uploadUrl: UPLOAD_URL, fileId: "file-js" } } });
            const files = { "welcome.mdx": "# Welcome\n", "assets/custom.js": "console.log(1)\n" };

            await env.run(env.project(withSettings("js:\n  - path: assets/custom.js\n", files)));

            expect(env.fdr.to("POST /v2/registry/docs/v2/init")[0]?.body).toMatchObject({
                filepaths: [{ path: "assets/custom.js", fileHash: sha256("console.log(1)\n") }],
                images: []
            });
        });

        it("uploads each file to the URL FDR gave with its type and a one-year cache header", async () => {
            legacyWithHero();

            const { logs } = await env.run(project());

            expect(env.axiosCalls).toEqual([
                {
                    method: "put",
                    url: UPLOAD_URL,
                    data: Buffer.from(HERO),
                    headers: {
                        "Content-Type": "image/svg+xml",
                        "Cache-Control": "public, max-age=31536000, immutable"
                    }
                }
            ]);
            expect(logs).toContain("info: ↑ Uploading 1 files...");
        });

        it("points the page at the id FDR gave the file", async () => {
            legacyWithHero();

            await env.run(project());

            expect(legacyFinish(env.fdr).docsDefinition.pages["welcome.mdx"]?.markdown).toBe(
                "# Welcome\n\n![Hero](file:file-hero)\n"
            );
        });

        it("points the page at the path when FDR gave a plain URL instead of an object", async () => {
            legacyWithHero({ uploadUrls: { "assets/hero.svg": UPLOAD_URL } });

            await env.run(project());

            expect(env.axiosCalls.map((call) => call.url)).toEqual([UPLOAD_URL]);
            expect(legacyFinish(env.fdr).docsDefinition.pages["welcome.mdx"]?.markdown).toContain(
                "file:assets/hero.svg"
            );
        });

        it("does not upload a file FDR says it already has, and says how many it skipped", async () => {
            legacyWithHero({ skippedFiles: ["assets/hero.svg"] });

            const { logs } = await env.run(project());

            expect(env.axiosCalls).toEqual([]);
            expect(logs).toContain("info: Skipped 1 unchanged file (already uploaded)");
            expect(logs).toContain("info: No files to upload (all up to date)");
            expect(legacyFinish(env.fdr).docsDefinition.pages["welcome.mdx"]?.markdown).toContain("file:file-hero");
        });

        it("does not upload with skipUpload, but still uses the ids FDR gave", async () => {
            legacyWithHero();

            const { logs } = await env.run(project(), { skipUpload: true });

            expect(env.axiosCalls).toEqual([]);
            expect(logs).toContain("debug: Skip-upload mode: skipping file uploads for docs");
            expect(legacyFinish(env.fdr).docsDefinition.pages["welcome.mdx"]?.markdown).toContain("file:file-hero");
        });

        it("does not upload a preview's files with skipUpload either", async () => {
            legacyWithHero();

            const { logs } = await env.run(project(), { skipUpload: true, preview: true });

            expect(env.axiosCalls).toEqual([]);
            expect(logs).toContain("debug: Skip-upload mode: skipping file uploads for docs preview");
        });

        it("uploads a preview's files to the URLs the preview registration gave", async () => {
            legacyWithHero();
            env.fdr.respond("POST /v2/registry/docs/preview/init", {
                docsRegistrationId: "registration-1",
                uploadUrls: { "assets/hero.svg": { uploadUrl: UPLOAD_URL, fileId: "file-hero" } },
                skippedFiles: [],
                previewUrl: "https://acme-preview-1.docs.buildwithfern.com"
            });

            await env.run(project(), { preview: true });

            expect(env.axiosCalls.map((call) => call.url)).toEqual([UPLOAD_URL]);
        });

        it("stops, names the file and does not finish when an upload fails", async () => {
            legacyWithHero();
            env.stubAxios("put", () => {
                throw new Error("connection reset");
            });
            const testProject = await project();

            const { error, errors } = await env.attempt(testProject);

            expect(error).toBeDefined();
            expect(errors[0]).toContain(`Failed to upload ${testProject.directory}`);
            expect(errors[0]).toContain("assets/hero.svg");
            expect(env.fdr.to("POST /v2/registry/docs/register/registration-1")).toEqual([]);
        });

        it("releases the deploy lock when an upload fails after the registration took it", async () => {
            legacyWithHero();
            env.stubAxios("put", () => {
                throw new Error("connection reset");
            });

            await env.attempt(project());

            expect(env.axiosCalls.some((call) => call.url === "http://fdr.test/docs-deployment/unlock")).toBe(true);
        });

        it("names a file outside the fern folder with _dot_dot_ in place of ../", async () => {
            legacyWithHero({ uploadUrls: {} });
            const testProject = await env.project(
                withSettings("", { "welcome.mdx": "# Welcome\n\n![Out](../shared/pic.svg)\n" })
            );
            await writeBesideFernFolder(testProject, "shared/pic.svg", svg(10, 10));

            await env.run(testProject);

            expect(env.fdr.to("POST /v2/registry/docs/v2/init")[0]?.body).toMatchObject({
                images: [{ filePath: "_dot_dot_/shared/pic.svg", width: 10, height: 10 }]
            });
        });

        it("fails, naming the file, when FDR's registration leaves out a file it was told about", async () => {
            legacyWithHero({ uploadUrls: {} });
            const files = { "welcome.mdx": "# Welcome\n", "assets/custom.js": "console.log(1)\n" };
            const testProject = await env.project(withSettings("js:\n  - path: assets/custom.js\n", files));

            const { error, errors } = await env.attempt(testProject);

            expect(error).toBeDefined();
            expect(errors).toEqual([
                expect.stringContaining(`Failed to locate file after uploading: ${testProject.directory}`)
            ]);
            expect(env.fdr.to("POST /v2/registry/docs/register/registration-1")).toEqual([]);
        });

        // NOTE: an image FDR's registration leaves out is not an error: the published page then carries the absolute path
        // of the image on the machine that published it.
        it("puts the local path of the image in the page when FDR's registration leaves it out", async () => {
            legacyWithHero({ uploadUrls: {} });
            const testProject = await project();

            await env.run(testProject);

            expect(legacyFinish(env.fdr).docsDefinition.pages["welcome.mdx"]?.markdown).toBe(
                `# Welcome\n\n![Hero](${testProject.directory}/fern/assets/hero.svg)\n`
            );
        });

        it("fails, and finishes nothing, when FDR's registration has no registration id", async () => {
            legacyWithHero({ docsRegistrationId: undefined });

            const { error, errors } = await env.attempt(project());

            expect(error).toBeDefined();
            expect(errors).toEqual(['Failed to publish docs. "Docs registration ID is missing."']);
            expect(env.fdr.requests.some((request) => request.path.startsWith("/v2/registry/docs/register/"))).toBe(
                false
            );
        });
    });
});

describe("fern generate --docs: docs.yml settings", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    const configSent = (): Record<string, unknown> => ledgerRegister(env.fdr).locales[0]?.config ?? {};

    it("sends the title, links, analytics, layout and settings it was given", async () => {
        const settings = `title: Acme Docs
navbar-links:
  - type: secondary
    text: Contact
    href: https://acme.com/contact
footer-links:
  github: https://github.com/acme
analytics:
  ga4:
    measurement-id: G-123
layout:
  page-width: full
settings:
  search-text: Search docs
`;

        await env.run(env.project(withSettings(settings)));

        expect(configSent()).toMatchObject({
            title: "Acme Docs",
            navbarLinks: [{ type: "secondary", text: "Contact", url: "https://acme.com/contact" }],
            footerLinks: [{ type: "github", value: "https://github.com/acme" }],
            analyticsConfig: { ga4: { measurementId: "G-123" } },
            layout: { pageWidth: { type: "full" } },
            settings: { searchText: "Search docs" }
        });
    });

    it("sends the accent and background colors as RGB", async () => {
        const settings =
            'colors:\n  accent-primary: "#ff5500"\n  background:\n    dark: "#000000"\n    light: "#ffffff"\n';

        await env.run(env.project(withSettings(settings)));

        expect(configSent().colorsV3).toMatchObject({
            type: "darkAndLight",
            dark: { accentPrimary: { r: 255, g: 85, b: 0 }, background: { type: "solid", r: 0, g: 0, b: 0 } },
            light: { accentPrimary: { r: 255, g: 85, b: 0 }, background: { type: "solid", r: 255, g: 255, b: 255 } }
        });
    });

    it("sends the CSS file's text inline, and does not upload the file", async () => {
        await env.run(
            env.project(withSettings("css: assets/custom.css\n", { "assets/custom.css": "body { color: red; }\n" }))
        );

        expect(configSent().css).toEqual({ inline: ["body { color: red; }\n"] });
        expect(ledgerRegister(env.fdr).locales[0]?.fileManifest).toBeUndefined();
    });

    it("sends several CSS files in order", async () => {
        const files = { "a.css": "a{}\n", "b.css": "b{}\n" };

        await env.run(env.project(withSettings("css:\n  - a.css\n  - b.css\n", files)));

        expect(configSent().css).toEqual({ inline: ["a{}\n", "b{}\n"] });
    });

    it("sends a JS file as a path to an uploaded file and a remote script as its URL", async () => {
        const settings =
            "js:\n  - path: assets/custom.js\n    strategy: lazyOnload\n  - url: https://cdn.example.com/x.js\n    strategy: beforeInteractive\n";

        await env.run(env.project(withSettings(settings, { "assets/custom.js": "console.log(1)\n" })));

        expect(configSent().js).toEqual({
            remote: [{ url: "https://cdn.example.com/x.js", strategy: "beforeInteractive" }],
            files: [{ path: "assets/custom.js", strategy: "lazyOnload" }]
        });
        expect(ledgerRegister(env.fdr).locales[0]?.fileManifest?.["assets/custom.js"]?.hash).toBe(
            sha256("console.log(1)\n")
        );
    });

    it("sends the redirects in the config", async () => {
        const settings =
            "redirects:\n  - source: /old\n    destination: /welcome\n  - source: /legacy/:slug\n    destination: /welcome/:slug\n    permanent: true\n";

        await env.run(env.project(withSettings(settings)));

        expect(configSent().redirects).toEqual([
            { source: "/old", destination: "/welcome" },
            { source: "/legacy/:slug", destination: "/welcome/:slug", permanent: true }
        ]);
    });

    it("sends the announcement text", async () => {
        await env.run(env.project(withSettings("announcement:\n  message: We moved!\n")));

        expect(configSent().announcement).toEqual({ text: "We moved!" });
    });

    it("sends the GitHub edit-this-page of the instance, with the defaults for what is left out", async () => {
        const docs = `instances:\n  - url: acme.docs.buildwithfern.com\n    edit-this-page:\n      github:\n        owner: acme\n        repo: docs\n${WELCOME_NAV}`;

        await env.run(env.project(docsFiles(docs, { "welcome.mdx": "# Welcome\n" })));

        expect(configSent().editThisPageGithub).toEqual({
            owner: "acme",
            repo: "docs",
            branch: "main",
            host: "https://github.com"
        });
    });

    it("links each page to its source on GitHub", async () => {
        const docs = `instances:\n  - url: acme.docs.buildwithfern.com\n    edit-this-page:\n      github:\n        owner: acme\n        repo: docs\n        branch: develop\n${WELCOME_NAV}`;
        env.setDeployMode("legacy");

        await env.run(env.project(docsFiles(docs, { "welcome.mdx": "# Welcome\n" })));

        expect(legacyFinish(env.fdr).docsDefinition.pages["welcome.mdx"]?.editThisPageUrl).toBe(
            "https://github.com/acme/docs/blob/develop/fern/welcome.mdx?plain=1"
        );
    });

    it("sends the roles that pages are restricted to", async () => {
        const docs = `${INSTANCE}roles:\n  - admin\nnavigation:\n  - page: Welcome\n    path: welcome.mdx\n    viewers:\n      - admin\n`;

        await env.run(env.project(docsFiles(docs, { "welcome.mdx": "# Welcome\n" })));

        const root = ledgerRegister(env.fdr).locales[0]?.root as { roles?: string[] };
        expect(root.roles).toEqual(["admin"]);
        expect(JSON.stringify(root)).toContain('"viewers":["admin"]');
    });

    it("sends the AI chat settings", async () => {
        const settings = "ai-search:\n  system-prompt: Be brief.\n  location:\n    - docs\n";

        await env.run(env.project(withSettings(settings)));

        expect(configSent().aiChatConfig).toMatchObject({ systemPrompt: "Be brief.", location: ["docs"] });
    });

    it("warns that Ask Fern in docs.yml is deprecated, for a production publish", async () => {
        const { logs } = await env.run(env.project(withSettings("ai-search:\n  system-prompt: Be brief.\n")));

        expect(logs).toContain(
            "warn: Enabling Ask Fern from docs.yml is deprecated. Please enable it from the Fern dashboard instead."
        );
    });

    it("does not warn about Ask Fern for a preview", async () => {
        const { logs } = await env.run(env.project(withSettings("ai-search:\n  system-prompt: Be brief.\n")), {
            preview: true
        });

        expect(logs.some((line) => line.includes("Ask Fern"))).toBe(false);
    });

    it("does not warn about Ask Fern when docs.yml does not enable it", async () => {
        const { logs } = await env.run(env.project(withSettings("")));

        expect(logs.some((line) => line.includes("Ask Fern"))).toBe(false);
    });

    it("sends custom MDX components with the JS files", async () => {
        const settings = "experimental:\n  mdx-components:\n    - ./components\n";
        const files = { "components/Banner.tsx": "export const Banner = () => <div>hi</div>;\n" };

        await env.run(env.project(withSettings(settings, files)));

        const [locale] = ledgerRegister(env.fdr).locales;
        expect(Object.keys(ledgerJsFiles(env.fdr, locale as never))).toEqual(["components/Banner.tsx"]);
    });

    it("sends the custom fonts as paths to uploaded files", async () => {
        const settings =
            "typography:\n  bodyFont:\n    name: Inter\n    paths:\n      - path: fonts/inter.woff2\n        weight: 400\n        style: normal\n";

        await env.run(env.project(withSettings(settings, { "fonts/inter.woff2": "FONTDATA" })));

        expect(configSent().typographyV2).toEqual({
            bodyFont: {
                type: "custom",
                name: "Inter",
                variants: [{ fontFile: "fonts/inter.woff2", weight: ["400"], style: ["normal"] }]
            }
        });
        expect(ledgerRegister(env.fdr).locales[0]?.fileManifest?.["fonts/inter.woff2"]?.hash).toBe(sha256("FONTDATA"));
    });

    it("uploads llms.txt with the other files, and leaves it out of the config", async () => {
        const settings = "agents:\n  page-description-source: description\n  llms-txt: ./llms.txt\n";

        await env.run(env.project(withSettings(settings, { "llms.txt": "hello llms\n" })));

        expect(configSent().agents).toEqual({ pageDescriptionSource: "description" });
        expect(ledgerRegister(env.fdr).locales[0]?.fileManifest?.["llms.txt"]?.hash).toBe(sha256("hello llms\n"));
    });

    it("sends the Intercom integration", async () => {
        await env.run(env.project(withSettings("integrations:\n  intercom: abc123\n")));

        expect(configSent().integrations).toEqual({ intercom: "abc123" });
    });

    it("sends a custom header component with the JS files and names it in the config", async () => {
        const component = "export default function Header() { return <div>hi</div>; }\n";

        await env.run(
            env.project(withSettings("header: ./components/Header.tsx\n", { "components/Header.tsx": component }))
        );

        const [locale] = ledgerRegister(env.fdr).locales;
        expect(configSent().header).toBe("components/Header.tsx");
        expect(ledgerJsFiles(env.fdr, locale as never)).toEqual({ "components/Header.tsx": component });
    });

    it("sends the legacy finish excludeApis only when docs.yml asks for it", async () => {
        env.setDeployMode("legacy");

        const { logs } = await env.run(env.project(withSettings("experimental:\n  exclude-apis: true\n")));

        expect(legacyFinish(env.fdr).excludeApis).toBe(true);
        expect(logs).toContain(
            "debug: Experimental flag 'exclude-apis' is enabled - API references will be excluded from S3 upload"
        );
    });

    // NOTE: exclude-apis only reaches the legacy finish; the ledger publish ignores it.
    it("ignores exclude-apis in the ledger", async () => {
        const openapi =
            "openapi: 3.0.0\ninfo: { title: T, version: 1.0.0 }\npaths:\n  /a:\n    get:\n      operationId: a\n      responses:\n        '200': { description: ok }\n";
        const docs = `${INSTANCE}experimental:\n  exclude-apis: true\nnavigation:\n  - api: API\n    specs:\n      - type: openapi\n        path: openapi.yml\n`;

        await env.run(env.project(docsFiles(docs, { "openapi.yml": openapi })));

        expect(ledgerRegister(env.fdr).locales[0]?.apiManifest).not.toBeNull();
    });

    describe("environment variables in docs.yml", () => {
        it("are replaced in a production publish when settings.substitute-env-vars is on", async () => {
            vi.stubEnv("DOCS_TITLE", "From Env");

            await env.run(env.project(withSettings("title: ${DOCS_TITLE}\nsettings:\n  substitute-env-vars: true\n")));

            expect(configSent().title).toBe("From Env");
        });

        it("fail a production publish, naming the variable, when one is not set", async () => {
            const { error, errors } = await env.attempt(
                env.project(withSettings("title: ${DOCS_TITLE_MISSING}\nsettings:\n  substitute-env-vars: true\n"))
            );

            expect(error).toBeDefined();
            expect(errors.join("\n")).toContain("DOCS_TITLE_MISSING");
            expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
        });

        it("are replaced with nothing in a preview when substitute-env-vars is off", async () => {
            vi.stubEnv("DOCS_TITLE", "From Env");

            await env.run(env.project(withSettings("title: ${DOCS_TITLE}\n")), { preview: true });

            const [request] = env.fdr.to("POST /docs-ledger/preview/init");
            expect((request?.body as { locales: Array<{ config: { title?: string } }> }).locales[0]?.config.title).toBe(
                ""
            );
        });

        it("are replaced in a preview when substitute-env-vars is on", async () => {
            vi.stubEnv("DOCS_TITLE", "From Env");

            await env.run(env.project(withSettings("title: ${DOCS_TITLE}\nsettings:\n  substitute-env-vars: true\n")), {
                preview: true
            });

            const [request] = env.fdr.to("POST /docs-ledger/preview/init");
            expect((request?.body as { locales: Array<{ config: { title?: string } }> }).locales[0]?.config.title).toBe(
                "From Env"
            );
        });
    });
});
