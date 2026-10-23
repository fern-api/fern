import { describe, expect, it, vi } from "vitest";

import { docsFiles, ledgerRegister, ONE_PAGE, useDocsEnvironment } from "./docsGenerateHarness.js";

// `fern generate --docs`: which docs.yml instance the command publishes, and the domains and base path it sends.

// The command looks up a custom domain's DNS before it publishes. Nothing here may reach a real resolver.
const dns = vi.hoisted(() => ({
    cnames: new Map<string, string[]>(),
    addresses: new Map<string, string[]>(),
    lookups: [] as string[]
}));
vi.mock("node:dns/promises", () => ({
    Resolver: class {
        resolveCname(host: string): Promise<string[]> {
            dns.lookups.push(host);
            const answer = dns.cnames.get(host);
            return answer == null ? Promise.reject(new Error("ENODATA")) : Promise.resolve(answer);
        }
        resolve4(host: string): Promise<string[]> {
            const answer = dns.addresses.get(host);
            return answer == null ? Promise.reject(new Error("ENODATA")) : Promise.resolve(answer);
        }
        cancel(): void {
            // nothing is in flight
        }
    }
}));

const NAVIGATION = "navigation:\n  - page: Welcome\n    path: welcome.mdx\n";

/** A docs project whose docs.yml starts with `header` (the instances) and has the one page. */
function project(header: string, extra: Record<string, string> = {}): Record<string, string> {
    return docsFiles(`${header}${NAVIGATION}`, { "welcome.mdx": "# Welcome\n", ...extra });
}

const FIRST = "first.docs.buildwithfern.com";
const SECOND = "second.docs.buildwithfern.com";
const TWO_INSTANCES = project(`instances:\n  - url: ${FIRST}\n  - url: ${SECOND}\n`);

describe("fern generate --docs: instances", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();
    const warnings = (logs: string[]): string[] => logs.filter((line) => line.startsWith("warn: "));

    describe("which instance publishes", () => {
        it("publishes the only instance and says which", async () => {
            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(logs).toContain("info: Starting docs publishing for production: acme.docs.buildwithfern.com");
            expect(ledgerRegister(env.fdr).domain).toBe("acme.docs.buildwithfern.com");
        });

        it("says it is a preview when it is one", async () => {
            const { logs } = await env.run(env.project(ONE_PAGE), { preview: true });

            expect(logs).toContain("info: Starting docs publishing for preview: acme.docs.buildwithfern.com");
        });

        it("will not choose between several instances, and names one to ask for", async () => {
            const { error, errors } = await env.attempt(env.project(TWO_INSTANCES));

            expect(error).toBeDefined();
            expect(errors).toEqual([`More than one docs instances. Please specify one (e.g. --instance ${FIRST})`]);
            expect(env.fdr.requests).toEqual([]);
        });

        it("publishes the instance it was asked for, and only that one", async () => {
            await env.run(env.project(TWO_INSTANCES), { instance: SECOND });

            expect(ledgerRegister(env.fdr).domain).toBe(SECOND);
            expect(env.fdr.to("POST /docs-ledger/register")).toHaveLength(1);
            expect(env.fdr.to("POST /slugs/markdowns").map((request) => request.body)).toEqual([
                { domain: SECOND, basepath: "" }
            ]);
        });

        it("can be asked for the first instance by name as well", async () => {
            await env.run(env.project(TWO_INSTANCES), { instance: FIRST });

            expect(ledgerRegister(env.fdr).domain).toBe(FIRST);
        });

        it("can be asked for the only instance by name", async () => {
            await env.run(env.project(ONE_PAGE), { instance: "acme.docs.buildwithfern.com" });

            expect(ledgerRegister(env.fdr).domain).toBe("acme.docs.buildwithfern.com");
        });

        it("lists the instances that exist when it is asked for one that does not", async () => {
            const { error, errors } = await env.attempt(env.project(TWO_INSTANCES), {
                instance: "third.docs.buildwithfern.com"
            });

            expect(error).toBeDefined();
            expect(errors).toEqual([
                `No docs instance found matching 'third.docs.buildwithfern.com'.\n\nAvailable instances:\n  - ${FIRST}\n  - ${SECOND}`
            ]);
            expect(env.fdr.requests).toEqual([]);
        });

        it("also refuses an instance that does not exist when there is only one", async () => {
            const { errors } = await env.attempt(env.project(ONE_PAGE), { instance: "other.docs.buildwithfern.com" });

            expect(errors).toEqual([
                "No docs instance found matching 'other.docs.buildwithfern.com'.\n\nAvailable instances:\n  - acme.docs.buildwithfern.com"
            ]);
        });

        // NOTE: the instance is compared as a string with docs.yml's `url`, which has no scheme, so naming it with
        // `https://` finds nothing.
        it("does not match an instance given with its scheme", async () => {
            const { errors } = await env.attempt(env.project(ONE_PAGE), {
                instance: "https://acme.docs.buildwithfern.com"
            });

            expect(errors[0]).toContain("No docs instance found matching 'https://acme.docs.buildwithfern.com'");
            expect(env.fdr.requests).toEqual([]);
        });

        it("fails when docs.yml lists no instances", async () => {
            const { error, errors } = await env.attempt(env.project(project("instances: []\n")), {});

            expect(error).toBeDefined();
            expect(errors).toEqual(["No instances specified in docs.yml! Cannot register docs."]);
            expect(env.fdr.requests).toEqual([]);
        });
    });

    describe("an instance url written with a scheme", () => {
        const WITH_SCHEME = project(`instances:\n  - url: https://${FIRST}\n`);

        // NOTE: docs.yml's `url` is sent as it is written, scheme included, as the domain of the registration, while the
        // redirects check is given the domain without it.
        it("is sent as the domain with its scheme, and without it to the redirects check", async () => {
            await env.run(env.project(WITH_SCHEME));

            expect(ledgerRegister(env.fdr).domain).toBe(`https://${FIRST}`);
            expect(env.fdr.to("POST /slugs/markdowns").map((request) => request.body)).toEqual([
                { domain: FIRST, basepath: "" }
            ]);
        });

        it("is named with its scheme in what the command says", async () => {
            const { logs } = await env.run(env.project(WITH_SCHEME));

            expect(logs).toContain(`info: Starting docs publishing for production: https://${FIRST}`);
        });

        it("is the instance to ask for with its scheme", async () => {
            const { error } = await env.attempt(env.project(WITH_SCHEME), { instance: FIRST });

            expect(error).toBeDefined();
            await env.run(env.project(WITH_SCHEME), { instance: `https://${FIRST}` });
            expect(ledgerRegister(env.fdr).domain).toBe(`https://${FIRST}`);
        });
    });

    describe("custom domains", () => {
        it("sends none for an instance without one", async () => {
            await env.run(env.project(ONE_PAGE));

            expect(ledgerRegister(env.fdr).customDomains).toEqual([]);
        });

        it("sends one written as a string", async () => {
            await env.run(env.project(project(`instances:\n  - url: ${FIRST}\n    custom-domain: docs.example.com\n`)));

            expect(ledgerRegister(env.fdr).customDomains).toEqual(["docs.example.com"]);
        });

        it("sends the list written as a list, in order", async () => {
            await env.run(
                env.project(
                    project(
                        `instances:\n  - url: ${FIRST}\n    custom-domain:\n      - docs.example.com\n      - help.example.com\n`
                    )
                )
            );

            expect(ledgerRegister(env.fdr).customDomains).toEqual(["docs.example.com", "help.example.com"]);
        });

        it("drops a leading https:// or http:// from each", async () => {
            await env.run(
                env.project(
                    project(
                        `instances:\n  - url: ${FIRST}\n    custom-domain:\n      - https://docs.example.com\n      - http://help.example.com\n      - plain.example.com\n`
                    )
                )
            );

            expect(ledgerRegister(env.fdr).customDomains).toEqual([
                "docs.example.com",
                "help.example.com",
                "plain.example.com"
            ]);
        });

        it("reports the first custom domain as the address of the published docs", async () => {
            const { logs } = await env.run(
                env.project(
                    project(
                        `instances:\n  - url: ${FIRST}\n    custom-domain:\n      - docs.example.com\n      - help.example.com\n`
                    )
                )
            );

            expect(logs.find((line) => line.startsWith("info: Published docs to "))).toContain(
                "https://docs.example.com"
            );
            expect(logs.find((line) => line.startsWith("info: Published docs to "))).not.toContain("first.docs");
        });

        it("reports the Fern address when the instance has no custom domain", async () => {
            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(logs.find((line) => line.startsWith("info: Published docs to "))).toContain(
                "https://acme.docs.buildwithfern.com"
            );
        });

        it("sends the custom domains of the legacy registration too", async () => {
            env.setDeployMode("legacy");

            await env.run(
                env.project(project(`instances:\n  - url: ${FIRST}\n    custom-domain: https://docs.example.com\n`))
            );

            expect(env.fdr.to("POST /v2/registry/docs/v2/init").map((request) => request.body)).toEqual([
                expect.objectContaining({ domain: FIRST, customDomains: ["docs.example.com"] })
            ]);
        });

        it("sends the custom domains only for the instance that was asked for", async () => {
            await env.run(
                env.project(
                    project(
                        `instances:\n  - url: ${FIRST}\n    custom-domain: one.example.com\n  - url: ${SECOND}\n    custom-domain: two.example.com\n`
                    )
                ),
                { instance: SECOND }
            );

            expect(ledgerRegister(env.fdr)).toMatchObject({ domain: SECOND, customDomains: ["two.example.com"] });
        });
    });

    describe("base paths", () => {
        const WITH_PATH = "acme.docs.buildwithfern.com/docs";

        it("sends the path of the instance url as the base path", async () => {
            await env.run(env.project(project(`instances:\n  - url: ${WITH_PATH}\n`)));

            expect(ledgerRegister(env.fdr)).toMatchObject({ domain: WITH_PATH, basepath: "/docs" });
        });

        it("sends the path to the redirects check, with the domain apart from it", async () => {
            await env.run(env.project(project(`instances:\n  - url: ${WITH_PATH}\n`)));

            expect(env.fdr.to("POST /slugs/markdowns").map((request) => request.body)).toEqual([
                { domain: "acme.docs.buildwithfern.com", basepath: "/docs" }
            ]);
        });

        it("sends the path of a preview as basePath", async () => {
            await env.run(env.project(project(`instances:\n  - url: ${WITH_PATH}\n`)), { preview: true });

            expect(env.fdr.to("POST /docs-ledger/preview/init")[0]?.body).toMatchObject({ basePath: "/docs" });
        });

        it("sends the path of a legacy preview as basePath", async () => {
            env.setDeployMode("legacy");

            await env.run(env.project(project(`instances:\n  - url: ${WITH_PATH}\n`)), { preview: true });

            expect(env.fdr.to("POST /v2/registry/docs/preview/init")[0]?.body).toMatchObject({ basePath: "/docs" });
        });

        it("accepts a custom domain at the same path, with or without a scheme or a trailing slash", async () => {
            await env.run(
                env.project(
                    project(
                        `instances:\n  - url: ${WITH_PATH}\n    custom-domain:\n      - example.com/docs\n      - https://example.org/docs/\n`
                    )
                )
            );

            expect(ledgerRegister(env.fdr).customDomains).toEqual(["example.com/docs", "example.org/docs/"]);
        });

        it("refuses a custom domain at another path, naming both, and sends nothing", async () => {
            const { error, errors } = await env.attempt(
                env.project(project(`instances:\n  - url: ${WITH_PATH}\n    custom-domain: example.com/other\n`))
            );

            expect(error).toBeDefined();
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain("Basepath mismatch between Fern url and custom-domain.");
            expect(errors[0]).toContain(
                `Instance url '${WITH_PATH}' has basepath '/docs' but custom-domain 'example.com/other' has basepath '/other'.`
            );
            expect(env.fdr.requests).toEqual([]);
        });

        it("refuses a custom domain at the root when the instance has a path", async () => {
            const { errors } = await env.attempt(
                env.project(project(`instances:\n  - url: ${WITH_PATH}\n    custom-domain: example.com\n`))
            );

            expect(errors[0]).toContain("has basepath '/docs' but custom-domain 'example.com' has basepath '/'");
        });

        it("refuses a custom domain with a path when the instance has none", async () => {
            const { errors } = await env.attempt(
                env.project(project(`instances:\n  - url: ${FIRST}\n    custom-domain: example.com/docs\n`))
            );

            expect(errors[0]).toContain("has basepath '/' but custom-domain 'example.com/docs' has basepath '/docs'");
        });

        it("names the first custom domain that does not fit", async () => {
            const { errors } = await env.attempt(
                env.project(
                    project(
                        `instances:\n  - url: ${WITH_PATH}\n    custom-domain:\n      - example.com/docs\n      - bad.example.com/nope\n      - worse.example.com\n`
                    )
                )
            );

            expect(errors[0]).toContain("custom-domain 'bad.example.com/nope'");
            expect(errors[0]).not.toContain("worse.example.com");
        });
    });

    describe("a custom domain that still points at Vercel", () => {
        const VERCEL_INSTANCE = project(`instances:\n  - url: ${FIRST}\n    custom-domain: docs.example.com\n`);

        function pointDocsAt(...targets: string[]): void {
            dns.cnames.clear();
            dns.addresses.clear();
            dns.lookups.length = 0;
            dns.cnames.set("docs.example.com", targets);
        }

        it("warns before December 1, 2026 and publishes anyway", async () => {
            vi.useFakeTimers({ toFake: ["Date"] });
            vi.setSystemTime(new Date("2026-11-15T00:00:00Z"));
            pointDocsAt("cname.vercel-dns.com");

            const { logs } = await env.run(env.project(VERCEL_INSTANCE));

            const [warning] = warnings(logs);
            expect(warning).toContain(
                "Action required by December 1, 2026: your custom domain still points to Vercel."
            );
            expect(warning).toContain("docs.example.com  →  cname.vercel-dns.com");
            expect(warning).toContain("Change your CNAME record to cname.ferndocs.com.");
            expect(warning).toContain("From December 1, 2026, this warning becomes an error and publishing will fail.");
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("fails from December 1, 2026 on and publishes nothing", async () => {
            vi.useFakeTimers({ toFake: ["Date"] });
            vi.setSystemTime(new Date("2026-12-01T00:00:00Z"));
            pointDocsAt("cname.vercel-dns.com");

            const { error, errors } = await env.attempt(env.project(VERCEL_INSTANCE));

            expect(error).toBeDefined();
            expect(errors[0]).toContain("Publishing is blocked: your custom domain still points to Vercel.");
            expect(errors[0]).toContain(
                "Since December 1, 2026, docs cannot be published to a domain that points to Vercel."
            );
            expect(env.fdr.requests).toEqual([]);
        });

        it("names every domain that points at Vercel, in the plural", async () => {
            vi.useFakeTimers({ toFake: ["Date"] });
            vi.setSystemTime(new Date("2026-11-15T00:00:00Z"));
            pointDocsAt("cname.vercel-dns-017.com");
            dns.cnames.set("help.example.com", ["cname.vercel-dns.com"]);
            const files = project(
                `instances:\n  - url: ${FIRST}\n    custom-domain:\n      - docs.example.com\n      - help.example.com\n`
            );

            const { logs } = await env.run(env.project(files));

            const [warning] = warnings(logs);
            expect(warning).toContain("your custom domains still point to Vercel.");
            expect(warning).toContain("docs.example.com  →  cname.vercel-dns-017.com");
            expect(warning).toContain("help.example.com  →  cname.vercel-dns.com");
        });

        it("recognises an apex domain by the A records Vercel owns", async () => {
            vi.useFakeTimers({ toFake: ["Date"] });
            vi.setSystemTime(new Date("2026-11-15T00:00:00Z"));
            dns.cnames.clear();
            dns.addresses.clear();
            dns.addresses.set("docs.example.com", ["76.76.21.21"]);

            const { logs } = await env.run(env.project(VERCEL_INSTANCE));

            expect(warnings(logs)[0]).toContain("docs.example.com  →  76.76.21.21");
        });

        it("does not warn about a domain that points at Fern", async () => {
            vi.useFakeTimers({ toFake: ["Date"] });
            vi.setSystemTime(new Date("2026-12-15T00:00:00Z"));
            pointDocsAt("cname.ferndocs.com");

            const { logs } = await env.run(env.project(VERCEL_INSTANCE));

            expect(warnings(logs)).toEqual([]);
        });

        it("does not warn about a domain behind another proxy", async () => {
            vi.useFakeTimers({ toFake: ["Date"] });
            vi.setSystemTime(new Date("2026-12-15T00:00:00Z"));
            pointDocsAt("lb.example.net");

            const { logs } = await env.run(env.project(VERCEL_INSTANCE));

            expect(warnings(logs)).toEqual([]);
        });

        it("never lets a failed lookup block the publish", async () => {
            vi.useFakeTimers({ toFake: ["Date"] });
            vi.setSystemTime(new Date("2026-12-15T00:00:00Z"));
            dns.cnames.clear();
            dns.addresses.clear();

            await env.run(env.project(VERCEL_INSTANCE));

            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("does not look up a domain served from a path, since a proxy in front serves it", async () => {
            vi.useFakeTimers({ toFake: ["Date"] });
            vi.setSystemTime(new Date("2026-12-15T00:00:00Z"));
            pointDocsAt("cname.vercel-dns.com");
            dns.cnames.set("example.com", ["cname.vercel-dns.com"]);

            await env.run(
                env.project(
                    project(
                        "instances:\n  - url: acme.docs.buildwithfern.com/docs\n    custom-domain: example.com/docs\n"
                    )
                )
            );

            expect(dns.lookups).toEqual([]);
        });

        it("does not look anything up for an instance without a custom domain", async () => {
            pointDocsAt("cname.vercel-dns.com");

            await env.run(env.project(ONE_PAGE));

            expect(dns.lookups).toEqual([]);
        });

        it("looks the domain up only once however it is written", async () => {
            vi.useFakeTimers({ toFake: ["Date"] });
            vi.setSystemTime(new Date("2026-11-15T00:00:00Z"));
            pointDocsAt("cname.vercel-dns.com");

            await env.run(
                env.project(
                    project(
                        `instances:\n  - url: ${FIRST}\n    custom-domain:\n      - docs.example.com\n      - https://docs.example.com\n`
                    )
                )
            );

            expect(dns.lookups).toEqual(["docs.example.com"]);
        });
    });

    describe("instance options that change what is sent", () => {
        it("sends multi-source as basepathAware to the ledger", async () => {
            await env.run(env.project(project(`instances:\n  - url: ${FIRST}\n    multi-source: true\n`)));

            expect(ledgerRegister(env.fdr).basepathAware).toBe(true);
        });

        it("sends nothing about basepathAware without multi-source", async () => {
            await env.run(env.project(ONE_PAGE));

            expect(ledgerRegister(env.fdr)).not.toHaveProperty("basepathAware");
        });

        it("sends multi-source as basepathAware to the legacy registration and its finish", async () => {
            env.setDeployMode("legacy");

            await env.run(env.project(project(`instances:\n  - url: ${FIRST}\n    multi-source: true\n`)));

            expect(env.fdr.to("POST /v2/registry/docs/v2/init")[0]?.body).toMatchObject({ basepathAware: true });
            expect(env.fdr.to("POST /v2/registry/docs/register/registration-1")[0]?.body).toMatchObject({
                basepathAware: true
            });
        });

        it("does not send basepathAware when finishing a legacy preview", async () => {
            env.setDeployMode("legacy");

            await env.run(env.project(project(`instances:\n  - url: ${FIRST}\n    multi-source: true\n`)), {
                preview: true
            });

            expect(env.fdr.to("POST /v2/registry/docs/register/registration-1")[0]?.body).not.toHaveProperty(
                "basepathAware"
            );
        });

        it("warns that experimental.basepath-aware is deprecated, and still honours it", async () => {
            const { logs } = await env.run(env.project(basepathAware()));

            expect(warnings(logs)).toContain(
                "warn: experimental.basepath-aware is deprecated. Use 'multi-source: true' on the instance instead."
            );
            expect(ledgerRegister(env.fdr).basepathAware).toBe(true);
        });
    });
});

function basepathAware(): Record<string, string> {
    return docsFiles(`instances:\n  - url: ${FIRST}\nexperimental:\n  basepath-aware: true\n${NAVIGATION}`, {
        "welcome.mdx": "# Welcome\n"
    });
}
