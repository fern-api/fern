import { describe, expect, it } from "vitest";

import { docsFiles, ledgerRegister, useDocsEnvironment } from "./docsGenerateHarness.js";

// `fern generate --docs`: the checks that run before anything is sent, and which of them stop the publish.

const INSTANCE = "instances:\n  - url: acme.docs.buildwithfern.com\n";
const NAV = "navigation:\n  - page: Welcome\n    path: welcome.mdx\n";
const TEMP_PATH = /\S*fern-command-test-\w+/g;

describe("fern generate --docs: validation", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    /** The checks' report with the temporary directory of the project taken out. */
    const report = (errors: string[]): string => errors.join("\n").replace(TEMP_PATH, "<project>");

    describe("broken links", () => {
        const BROKEN = "# Welcome\n\n[Gone](./missing.mdx)\n\n[Nowhere](/no-such-page)\n";

        it("are not looked for by default", async () => {
            const { logs, error } = await env.attempt(
                env.project(docsFiles(`${INSTANCE}${NAV}`, { "welcome.mdx": BROKEN }))
            );

            expect(error).toBeUndefined();
            expect(logs.some((line) => line.includes("broken link"))).toBe(false);
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("are listed with the file and position of each when asked for, and the docs still publish", async () => {
            const { errors, error } = await env.attempt(
                env.project(docsFiles(`${INSTANCE}${NAV}`, { "welcome.mdx": BROKEN })),
                {
                    brokenLinks: true
                }
            );

            expect(error).toBeUndefined();
            expect(errors[0]).toBe(
                "welcome.mdx\n[error] broken link to ./missing.mdx (resolved path: welcome/missing.mdx)\n\tfix here: welcome.mdx:3:1\n[error] broken link to /no-such-page\n\tfix here: welcome.mdx:5:1\n"
            );
            expect(errors).toContain(
                "Found 2 errors and 0 warnings in " + errors[1]?.match(/in ([\d.]+) seconds/)?.[1] + " seconds."
            );
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("stop the publish in strict mode, before anything is sent to FDR", async () => {
            const { error, errors } = await env.attempt(
                env.project(docsFiles(`${INSTANCE}${NAV}`, { "welcome.mdx": BROKEN })),
                {
                    strictBrokenLinks: true
                }
            );

            expect(error).toBeDefined();
            expect(errors[0]).toContain("[error] broken link to ./missing.mdx");
            expect(env.fdr.requests).toEqual([]);
        });

        it("do not stop a strict publish when there are none", async () => {
            const files = docsFiles(
                `${INSTANCE}navigation:\n  - page: Welcome\n    path: welcome.mdx\n  - page: Other\n    path: other.mdx\n`,
                { "welcome.mdx": "# Welcome\n\n[Other](./other.mdx)\n\n[Slug](/other)\n", "other.mdx": "# Other\n" }
            );

            const { error, errors } = await env.attempt(env.project(files), { strictBrokenLinks: true });

            expect(error).toBeUndefined();
            expect(errors).toEqual([]);
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("stop the publish when docs.yml sets broken-links to error, with no flag", async () => {
            const docs = `${INSTANCE}${NAV}check:\n  rules:\n    broken-links: error\n`;

            const { error, errors } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": BROKEN })));

            expect(error).toBeDefined();
            expect(errors[0]).toContain("broken link to /no-such-page");
            expect(env.fdr.requests).toEqual([]);
        });

        it("only count as a warning, shown as a summary, when docs.yml sets broken-links to warn", async () => {
            const docs = `${INSTANCE}${NAV}check:\n  rules:\n    broken-links: warn\n`;

            const { error, logs } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": BROKEN })));

            expect(error).toBeUndefined();
            expect(
                logs.some(
                    (line) =>
                        line.startsWith("warn: Found 0 errors and 2 warnings in ") &&
                        line.endsWith("Run fern check --warnings to print out the warnings not shown.")
                )
            ).toBe(true);
            expect(logs.some((line) => line.includes("broken link to"))).toBe(false);
        });

        it("are found in the same way for a preview", async () => {
            const { error } = await env.attempt(
                env.project(docsFiles(`${INSTANCE}${NAV}`, { "welcome.mdx": BROKEN })),
                {
                    preview: true,
                    strictBrokenLinks: true
                }
            );

            expect(error).toBeDefined();
            expect(env.fdr.requests).toEqual([]);
        });
    });

    describe("a docs.yml that cannot be read", () => {
        it("is refused with the offending key when it has one the schema does not know", async () => {
            const project = env.project(docsFiles(`${INSTANCE}${NAV}bogus-key: 1\n`, { "welcome.mdx": "# W\n" }));

            await expect(project).rejects.toThrow(/Failed to parse docs\.yml:\nUnexpected property 'bogus-key'/);
        });

        it("is refused when it has no instances", async () => {
            const project = env.project(docsFiles(NAV, { "welcome.mdx": "# W\n" }));

            await expect(project).rejects.toThrow(/Missing required property 'instances'/);
        });

        it("is refused when the YAML does not parse, with the line", async () => {
            const project = env.project(docsFiles(`${INSTANCE}${NAV}title: [unclosed\n`, { "welcome.mdx": "# W\n" }));

            await expect(project).rejects.toThrow(/unexpected end of the stream within a flow collection \(7:1\)/);
        });

        it("is refused when a value has the wrong type", async () => {
            const project = env.project(
                docsFiles(`${INSTANCE}${NAV}title:\n  - not\n  - text\n`, { "welcome.mdx": "# W\n" })
            );

            await expect(project).rejects.toThrow(/Failed to parse docs\.yml/);
        });
    });

    describe("files that docs.yml or a page names and that are not there", () => {
        it("stop the publish when a page of the navigation is missing, naming it", async () => {
            const { error, errors } = await env.attempt(env.project(docsFiles(`${INSTANCE}${NAV}`, {})));

            expect(error).toBeDefined();
            expect(report(errors)).toContain("[error] Path welcome.mdx does not exist");
            expect(env.fdr.requests).toEqual([]);
        });

        it("stop the publish when the logo is missing", async () => {
            const docs = `${INSTANCE}logo:\n  light: assets/nope.svg\n${NAV}`;

            const { error, errors } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": "# W\n" })));

            expect(error).toBeDefined();
            expect(report(errors)).toContain("[error] Path assets/nope.svg does not exist");
            expect(env.fdr.requests).toEqual([]);
        });

        it("stop the publish when an image of a page is missing", async () => {
            const files = { "welcome.mdx": "# W\n\n![Missing](./nope.png)\n" };

            const { error, errors } = await env.attempt(env.project(docsFiles(`${INSTANCE}${NAV}`, files)));

            expect(error).toBeDefined();
            expect(report(errors)).toContain("[error] Path nope.png does not exist");
            expect(env.fdr.requests).toEqual([]);
        });

        it("stop the publish when a snippet a page includes is missing", async () => {
            const files = { "welcome.mdx": '# W\n\n<Markdown src="./nope.mdx" />\n' };

            const { error, errors } = await env.attempt(env.project(docsFiles(`${INSTANCE}${NAV}`, files)));

            expect(error).toBeDefined();
            expect(report(errors)).toContain("[error] Path nope.mdx does not exist");
        });

        it("stop the publish when the front matter of a page cannot be read", async () => {
            const files = { "welcome.mdx": "---\ntitle: [unclosed\n---\n# W\n" };

            const { error, errors } = await env.attempt(env.project(docsFiles(`${INSTANCE}${NAV}`, files)));

            expect(error).toBeDefined();
            expect(report(errors)).toContain(
                "[error] Failed to parse frontmatter: unexpected end of the stream within a flow collection"
            );
            expect(env.fdr.requests).toEqual([]);
        });
    });

    describe("rules that stop the publish", () => {
        it("refuses navigation and versions together", async () => {
            const docs = `${INSTANCE}${NAV}versions:\n  - display-name: v1\n    path: v1.yml\n    slug: v1\n`;
            const files = { "welcome.mdx": "# W\n", "v1.yml": "navigation:\n  - page: W\n    path: welcome.mdx\n" };

            const { error, errors } = await env.attempt(env.project(docsFiles(docs, files)));

            expect(error).toBeDefined();
            expect(report(errors)).toContain(
                "[error] Cannot contain both navigation and versions. If you want versioned docs, use versions. Otherwise use navigation."
            );
            expect(env.fdr.requests).toEqual([]);
        });

        it("refuses a page restricted to a role docs.yml does not declare", async () => {
            const docs = `${INSTANCE}navigation:\n  - page: Welcome\n    path: welcome.mdx\n    viewers:\n      - admin\n`;

            const { error, errors } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": "# W\n" })));

            expect(error).toBeDefined();
            expect(report(errors)).toContain(
                '[error] Role "admin" is used but not declared at the top level of the docs.yml file.'
            );
        });

        it("refuses an API reference with no API behind it", async () => {
            const docs = `${INSTANCE}navigation:\n  - api: Nope\n    api-name: nope\n`;

            const { error, errors } = await env.attempt(env.project(docsFiles(docs, {})));

            expect(error).toBeDefined();
            expect(report(errors)).toContain(
                "[error] API reference 'Nope' does not resolve to an API definition, so the docs will fail to build. No API definition named 'nope' was found. Named APIs live at fern/apis/<api-name>."
            );
            expect(env.fdr.requests).toEqual([]);
        });

        it("refuses an instance whose subdomain has characters a hostname cannot have", async () => {
            const docs = `instances:\n  - url: Bad_Name.docs.buildwithfern.com\n${NAV}`;

            const { error, errors } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": "# W\n" })));

            expect(error).toBeDefined();
            expect(report(errors)).toContain(
                '[error] instances[0].url: Invalid instance URL "Bad_Name.docs.buildwithfern.com"'
            );
        });

        it("refuses an embedding origin that is not an origin", async () => {
            const docs = `${INSTANCE}${NAV}settings:\n  embedding:\n    allowed-origins:\n      - 'not a url'\n`;

            const { error, errors } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": "# W\n" })));

            expect(error).toBeDefined();
            expect(report(errors)).toContain(
                'settings.embedding.allowed-origins[0]: Origin "not a url" is not a valid origin.'
            );
        });

        it("says how many problems it found, and that none of the docs went to FDR", async () => {
            const { errors } = await env.attempt(env.project(docsFiles(`${INSTANCE}${NAV}`, {})));

            expect(errors.some((line) => /^Found 2 errors and 0 warnings in [\d.]+ seconds\.$/.test(line))).toBe(true);
            expect(env.fdr.requests).toEqual([]);
        });

        it("does not announce that remote generation starts", async () => {
            const { logs } = await env.attempt(env.project(docsFiles(`${INSTANCE}${NAV}`, {})));

            expect(logs).not.toContain("info: Validation complete, starting remote docs generation...");
        });
    });

    // NOTE: only problems that stop at `fatal` stop the publish. A rule that reports an `error` (a redirect that loops,
    // a changelog whose feed cannot be served) is printed as an error and the docs are published anyway.
    describe("rules that report an error and let the publish go on", () => {
        it("prints a redirect that loops back to itself as an error and publishes it", async () => {
            const docs = `${INSTANCE}${NAV}redirects:\n  - source: /a\n    destination: /a\n`;

            const { error, errors } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": "# W\n" })));

            expect(error).toBeUndefined();
            expect(report(errors)).toContain(
                '[error] Redirect from "/a" to "/a" creates an infinite loop (source equals destination)'
            );
            expect(ledgerRegister(env.fdr).locales[0]?.config.redirects).toEqual([{ source: "/a", destination: "/a" }]);
        });

        it("stops for that same rule when docs.yml makes it an error", async () => {
            const docs = `${INSTANCE}${NAV}redirects:\n  - source: /a\n    destination: /a\ncheck:\n  rules:\n    no-circular-redirects: error\n`;

            const { error } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": "# W\n" })));

            expect(error).toBeDefined();
            expect(env.fdr.requests).toEqual([]);
        });
    });

    describe("problems that are only warnings", () => {
        it("are counted, not shown, and do not stop the publish: an MDX component that is never closed", async () => {
            const { error, logs } = await env.attempt(
                env.project(docsFiles(`${INSTANCE}${NAV}`, { "welcome.mdx": "# W\n\n<Unclosed\n" }))
            );

            expect(error).toBeUndefined();
            expect(
                logs.some((line) =>
                    /^warn: Found 0 errors and 1 warnings in [\d.]+ seconds\. Run fern check --warnings/.test(line)
                )
            ).toBe(true);
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("are counted, not shown: an accent color the background hides", async () => {
            const docs = `${INSTANCE}${NAV}colors:\n  accent-primary: "#fefefe"\n  background: "#ffffff"\n`;

            const { error, logs } = await env.attempt(env.project(docsFiles(docs, { "welcome.mdx": "# W\n" })));

            expect(error).toBeUndefined();
            expect(logs.some((line) => line.startsWith("warn: Found 0 errors and 1 warnings in "))).toBe(true);
        });

        it("print nothing when the docs have none", async () => {
            const { logs } = await env.run(env.project(docsFiles(`${INSTANCE}${NAV}`, { "welcome.mdx": "# W\n" })));

            expect(logs.filter((line) => line.startsWith("warn: "))).toEqual([]);
            expect(logs).toContain("info: ✓ All checks passed");
        });
    });

    describe("before and after the checks", () => {
        it("says the checks passed, then that remote generation starts, in that order", async () => {
            const { logs } = await env.run(env.project(docsFiles(`${INSTANCE}${NAV}`, { "welcome.mdx": "# W\n" })));

            const passed = logs.indexOf("info: ✓ All checks passed");
            const started = logs.indexOf("info: Validation complete, starting remote docs generation...");
            expect(passed).toBeGreaterThanOrEqual(0);
            expect(started).toBeGreaterThan(passed);
        });

        // NOTE: a docs.yml with no navigation, versions or products passes the checks ("All checks passed") and only fails
        // later, while the docs are resolved, with a CliError that starts "Unexpected." instead of a message from the checks.
        it("passes the checks for a docs.yml with no navigation and fails when it resolves the docs", async () => {
            const { error, logs } = await env.attempt(env.project(docsFiles(INSTANCE, {})));

            expect(logs).toContain("info: ✓ All checks passed");
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toBe("Unexpected. Docs have neither navigation or versions defined.");
            expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
        });
    });
});
