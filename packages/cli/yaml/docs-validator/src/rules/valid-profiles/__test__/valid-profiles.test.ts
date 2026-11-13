import type { DocsConfigurationWithResolvedRedirects } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";

import type { RuleContext } from "../../../Rule.js";
import { ValidProfilesRule } from "../index.js";

async function run(config: Partial<DocsConfigurationWithResolvedRedirects>, productFile?: unknown) {
    const fullConfig = { instances: [], ...config } as DocsConfigurationWithResolvedRedirects;
    const visitor = await ValidProfilesRule.create({ workspace: { config: fullConfig } } as unknown as RuleContext);
    const violations = (await visitor.file?.({ config: fullConfig })) ?? [];
    if (productFile != null) {
        violations.push(
            ...((await visitor.productFile?.({
                path: "./products/enterprise.yml",
                content: productFile,
                product: { displayName: "Enterprise", path: "./products/enterprise.yml" }
            })) ?? [])
        );
    }
    return violations;
}

const profiles = { community: { vars: { CLI: "acme" } }, enterprise: { vars: { CLI: "acme-ent" } } };

describe("valid-profiles", () => {
    it("allows profiles that are defined", async () => {
        const violations = await run({
            profiles,
            profile: "community",
            products: [{ displayName: "Enterprise", path: "./products/enterprise.yml", profile: "enterprise" }]
        });
        expect(violations).toEqual([]);
    });

    it("flags an unknown profile on a product", async () => {
        const violations = await run({
            profiles,
            products: [{ displayName: "Cloud", path: "./products/cloud.yml", profile: "cloud" }]
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain('Profile "cloud"');
    });

    it("flags an unknown profile on a tab variant in a product file", async () => {
        const violations = await run(
            { profiles },
            {
                navigation: [{ tab: "guides", variants: [{ title: "Cloud", profile: "cloud", layout: [] }] }]
            }
        );
        expect(violations).toHaveLength(1);
    });

    it("flags any profile when none are defined", async () => {
        const violations = await run({
            navigation: [{ page: "Install", path: "./install.mdx", profile: "enterprise" }]
        });
        expect(violations).toHaveLength(1);
    });
    it("reports profile vars files that could not be read", async () => {
        const violations = await run({ profiles, _profileVarsFileErrors: ["vars file broke"] });
        expect(violations).toEqual([{ severity: "fatal", message: "vars file broke" }]);
    });
});
