import { describe, expect, it } from "vitest";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

interface DocsTranslationsConfig {
    defaultLocale: string;
    translations: string[] | undefined;
}

interface DocsConfigWithTranslations {
    translations: DocsTranslationsConfig | undefined;
}

function createResolverWithTranslations(
    translations: Array<{
        lang: string;
        default?: boolean;
    }>
): DocsDefinitionResolver {
    const resolver = Object.create(DocsDefinitionResolver.prototype) as DocsDefinitionResolver;

    Reflect.set(resolver, "_parsedDocsConfig", {
        aiChatConfig: undefined,
        agents: undefined,
        analyticsConfig: undefined,
        announcement: undefined,
        backgroundImage: undefined,
        colors: undefined,
        context7File: undefined,
        css: undefined,
        defaultLanguage: undefined,
        experimental: undefined,
        favicon: undefined,
        footer: undefined,
        footerLinks: undefined,
        header: undefined,
        integrations: undefined,
        js: undefined,
        languages: undefined,
        landingPage: undefined,
        layout: undefined,
        libraries: undefined,
        llmsFullTxtFile: undefined,
        llmsTxtFile: undefined,
        logo: undefined,
        metadata: undefined,
        navbarLinks: undefined,
        navigation: undefined,
        pageActions: undefined,
        pages: {},
        redirects: undefined,
        roles: undefined,
        settings: undefined,
        theme: undefined,
        title: undefined,
        translationPages: undefined,
        translations: translations.map((translation) => ({
            // The resolver only reads `lang` and `default`.
            lang: translation.lang,
            default: translation.default
        })),
        typography: undefined
    });
    Reflect.set(resolver, "collectedFileIds", new Map());
    Reflect.set(resolver, "editThisPage", undefined);

    return resolver;
}

function getTranslationsConfig(config: object): DocsTranslationsConfig | undefined {
    if ("translations" in config) {
        return (config as DocsConfigWithTranslations).translations;
    }
    return undefined;
}

describe("DocsDefinitionResolver translations config", () => {
    it("includes translation metadata in the resolved docs config", async () => {
        const resolver = createResolverWithTranslations([{ lang: "en", default: true }, { lang: "ja" }]);

        const convertDocsConfiguration = Reflect.get(resolver, "convertDocsConfiguration") as (
            root: object
        ) => Promise<object>;

        const config = await convertDocsConfiguration.call(resolver, { type: "root" });

        expect(getTranslationsConfig(config)).toEqual({
            defaultLocale: "en",
            translations: ["en", "ja"]
        });
    });

    it("falls back to the first locale when no default is explicitly configured", async () => {
        const resolver = createResolverWithTranslations([{ lang: "fr" }, { lang: "de" }]);

        const convertDocsConfiguration = Reflect.get(resolver, "convertDocsConfiguration") as (
            root: object
        ) => Promise<object>;

        const config = await convertDocsConfiguration.call(resolver, { type: "root" });

        expect(getTranslationsConfig(config)).toEqual({
            defaultLocale: "fr",
            translations: ["fr", "de"]
        });
    });
});
