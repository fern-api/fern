import { describe, expect, it } from "vitest";
import { createAvailabilityChecker, findUsableName, isValidName, suggestNames } from "../docs-site/availability";
import { summarizeFailure } from "../wizard";

function fakeFetch(handler: (url: string, body: unknown) => { status: number; json?: unknown }): typeof fetch {
    return async (input, init) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const body: unknown = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
        const { status, json } = handler(url, body);
        return Response.json(json ?? {}, { status });
    };
}

const dashboard = (url: string, path: string): boolean => url.startsWith(`https://dashboard.buildwithfern.com${path}`);

function checker(existingOrgs: string[], myOrgs: string[], domainOwners: Record<string, string>) {
    return createAvailabilityChecker(
        "token",
        fakeFetch((url, body) => {
            if (dashboard(url, "/api/get-my-organizations")) {
                return { status: 200, json: myOrgs.map((name) => ({ name })) };
            }
            if (dashboard(url, "/api/organization/check-availability")) {
                const name = (body as { organizationId: string }).organizationId;
                return { status: 200, json: { exists: existingOrgs.includes(name) } };
            }
            if (url === "https://registry.buildwithfern.com/v2/registry/docs/metadata-for-url") {
                const owner = domainOwners[(body as { url: string }).url];
                return owner === undefined
                    ? { status: 404, json: { message: "Domain not registered" } }
                    : { status: 200, json: { org: owner } };
            }
            return { status: 500 };
        })
    );
}

describe("availability", () => {
    it("tells apart the user's orgs, free names, and names other teams own", async () => {
        const check = checker(["github", "acme"], ["acme"], {});
        await expect(check.organization("acme")).resolves.toBe("mine");
        await expect(check.organization("github")).resolves.toBe("taken");
        await expect(check.organization("brand-new")).resolves.toBe("available");
    });

    it("checks docs URLs against the registry", async () => {
        const check = checker([], ["acme"], {
            "github.docs.buildwithfern.com": "github-com-eslint-eslint",
            "acme.docs.buildwithfern.com": "acme"
        });
        await expect(check.docsUrl("github")).resolves.toBe("taken");
        await expect(check.docsUrl("acme")).resolves.toBe("mine");
        await expect(check.docsUrl("free-name")).resolves.toBe("available");
    });

    it("creates a free organization right away and stops on one another team owns", async () => {
        const existing = ["acme", "netflix"];
        const member: string[] = [];
        const created: string[] = [];
        const check = createAvailabilityChecker(
            "token",
            fakeFetch((url, body) => {
                if (dashboard(url, "/api/get-my-organizations")) {
                    return { status: 200, json: [{ name: "acme" }] };
                }
                if (dashboard(url, "/api/organization/check-availability")) {
                    const name = (body as { organizationId: string }).organizationId;
                    return { status: 200, json: { exists: existing.includes(name) || created.includes(name) } };
                }
                if (url === "https://venus.buildwithfern.com/organizations/create") {
                    const name = (body as { organizationId: string }).organizationId;
                    if (existing.includes(name)) {
                        return { status: 500 };
                    }
                    created.push(name);
                    return { status: 200, json: { organizationId: name } };
                }
                if (url === "https://venus.buildwithfern.com/organizations") {
                    return { status: 200, json: member };
                }
                if (url.startsWith("https://venus.buildwithfern.com/organizations/")) {
                    // Fern returns any organization's settings, so they don't prove membership.
                    return { status: 200, json: {} };
                }
                return { status: 500 };
            })
        );
        await expect(check.claimOrganization("acme")).resolves.toBe("mine");
        await expect(check.claimOrganization("netflix")).resolves.toBe("taken");
        await expect(check.claimOrganization("netflix-dev")).resolves.toBe("created");
        // Fern itself vouches for an organization the Dashboard doesn't list yet.
        existing.push("just-created");
        member.push("just-created");
        await expect(check.organization("just-created")).resolves.toBe("mine");
        expect(created).toEqual(["netflix-dev"]);
        // Once created, the name counts as the user's.
        await expect(check.organization("netflix-dev")).resolves.toBe("mine");
    });

    it("catches a taken organization the first check missed", async () => {
        let dashboardUp = false;
        const check = createAvailabilityChecker(
            "token",
            fakeFetch((url) => {
                if (dashboard(url, "/api/organization/check-availability")) {
                    return dashboardUp ? { status: 200, json: { exists: true } } : { status: 503 };
                }
                if (url === "https://venus.buildwithfern.com/organizations/create") {
                    dashboardUp = true;
                    return { status: 500 };
                }
                return { status: 500 };
            })
        );
        await expect(check.claimOrganization("netflix")).resolves.toBe("taken");
    });

    it("does not block setup when a check can't run", async () => {
        const offline = createAvailabilityChecker("token", async () => {
            throw new Error("offline");
        });
        await expect(offline.organization("acme")).resolves.toBe("unknown");
        await expect(offline.docsUrl("acme")).resolves.toBe("unknown");
        await expect(offline.claimOrganization("acme")).resolves.toBe("unknown");
    });

    it("falls back to a -docs name, then random suffixes, like the Dashboard", async () => {
        const taken = new Set(["github", "github-docs"]);
        const usable = await findUsableName(
            "github",
            async (name) => (taken.has(name) ? "taken" : "available"),
            () => "123456"
        );
        expect(usable).toEqual({ name: "github-123456", changed: true });
        await expect(findUsableName("acme", async () => "available")).resolves.toEqual({
            name: "acme",
            changed: false
        });
    });

    it("suggests a few free alternatives, the user's own pick first", async () => {
        const taken = new Set(["netflix", "netflix-docs", "netflix-api"]);
        const suggestions = await suggestNames({
            base: "netflix",
            check: async (name) => (taken.has(name) ? "taken" : "available"),
            preferred: ["netflix-media"],
            randomSuffix: () => "424242"
        });
        expect(suggestions).toEqual(["netflix-media", "netflix-dev", "netflix-developers"]);
        // Taken or invalid preferred names are never offered.
        const filtered = await suggestNames({
            base: "netflix",
            check: async (name) => (taken.has(name) ? "taken" : "available"),
            preferred: ["netflix-docs", "Not Valid"],
            count: 1
        });
        expect(filtered).toEqual(["netflix-dev"]);
    });

    it("accepts lowercase names with inner hyphens only", () => {
        expect(isValidName("acme-docs")).toBe(true);
        expect(isValidName("a")).toBe(true);
        expect(isValidName("-acme")).toBe(false);
        expect(isValidName("Acme")).toBe(false);
        expect(isValidName("acme_docs")).toBe(false);
    });

    it("reports only the lines that explain a failed publish", () => {
        const output = [
            "[docs]: Resolved docs definition in 121ms: 13 pages, 1 API workspaces",
            "[docs]: docs.yml",
            '\t[warning] Page "docs/pages/components.mdx" was removed. The previously published URL "/components" will return 404 without a redirect.',
            '\t[warning] Page "docs/changelog/09-01-2025.mdx" was moved from "/home/changelog/changelog" to "/docs/changelog/changelog".',
            "[docs]: Failed to publish docs via ledger to github.docs.buildwithfern.com: The following domains belong to another organization: github.docs.buildwithfern.com",
            "[docs]: The following domains belong to another organization: github.docs.buildwithfern.com",
            "[docs]: github.docs.buildwithfern.com Failed."
        ].join("\n");
        const summary = summarizeFailure(output);
        expect(summary).not.toContain("[warning]");
        expect(summary).toContain(
            "The following domains belong to another organization: github.docs.buildwithfern.com"
        );
        expect(summary.split("\n").length).toBeLessThanOrEqual(3);
    });
});
