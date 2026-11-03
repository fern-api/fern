import { describe, expect, it } from "vitest";
import type { DocsSiteChoices } from "../docs-site/options";
import { defaultDocsSiteChoices } from "../docs-site/options";
import { mergeDocsSiteChoices } from "../docs-site/prompt";

describe("docs site prompt choices", () => {
    const defaults: DocsSiteChoices = {
        ...defaultDocsSiteChoices("acme"),
        logoPath: "brand/light.svg",
        darkLogoPath: "brand/dark.svg",
        faviconPath: "brand/favicon.ico",
        primaryColor: "#123abc",
        typography: "classic",
        buttonShape: "round"
    };
    const answers: Parameters<typeof mergeDocsSiteChoices>[1] = {
        siteTitle: "Acme",
        subdomain: "acme",
        layout: "layout-2",
        primaryColor: "",
        logoPath: "",
        typography: undefined,
        buttonShape: undefined,
        features: defaults.features
    };

    it("keeps default branding metadata when the prompt fields are blank", () => {
        expect(mergeDocsSiteChoices(defaults, answers)).toMatchObject({
            logoPath: defaults.logoPath,
            darkLogoPath: defaults.darkLogoPath,
            faviconPath: defaults.faviconPath,
            primaryColor: defaults.primaryColor,
            typography: defaults.typography,
            buttonShape: defaults.buttonShape
        });
    });

    it("clears the default dark logo when a different logo is entered", () => {
        const choices = mergeDocsSiteChoices(defaults, { ...answers, logoPath: "brand/new.svg" });

        expect(choices.logoPath).toBe("brand/new.svg");
        expect(choices.darkLogoPath).toBeUndefined();
        expect(choices.faviconPath).toBe(defaults.faviconPath);
    });
});
