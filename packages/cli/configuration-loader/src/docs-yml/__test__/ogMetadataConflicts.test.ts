import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

function createLoggerSpy() {
    const warnings: string[] = [];
    const logger = {
        disable: () => undefined,
        enable: () => undefined,
        trace: () => undefined,
        debug: () => undefined,
        info: () => undefined,
        warn: (...args: string[]) => {
            warnings.push(args.join(" "));
        },
        error: () => undefined,
        log: () => undefined
    };
    return { logger, warnings };
}

async function runWithMetadata(metadata: docsYml.RawSchemas.MetadataConfig): Promise<string[]> {
    const { logger, warnings } = createLoggerSpy();
    const context = createMockTaskContext({ logger });
    await parseDocsConfiguration({
        rawDocsConfiguration: {
            instances: [],
            title: "Test",
            navigation: [],
            metadata
        },
        absolutePathToFernFolder: AbsoluteFilePath.of("/tmp"),
        absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/tmp/docs.yml"),
        context
    });
    return warnings;
}

describe("docs.yml metadata conflict warnings", () => {
    it("warns when og:dynamic: true is combined with og:image", async () => {
        const warnings = await runWithMetadata({
            ogDynamic: true,
            ogImage: "https://example.com/cover.png"
        });
        expect(warnings.some((w) => w.includes("`og:image`") && w.includes("homepage"))).toBe(true);
    });

    it("warns when og:dynamic: true is combined with twitter:image", async () => {
        const warnings = await runWithMetadata({
            ogDynamic: true,
            twitterImage: "https://example.com/twitter.png"
        });
        expect(warnings.some((w) => w.includes("`twitter:image`") && w.includes("homepage"))).toBe(true);
    });

    it("warns when og:dynamic is off but dynamic sub-settings are set", async () => {
        const warnings = await runWithMetadata({
            ogDynamicShowLogo: false,
            ogDynamicTextColor: "#000000"
        });
        expect(
            warnings.some(
                (w) =>
                    w.includes("require `og:dynamic: true`") &&
                    w.includes("og:dynamic:show-logo") &&
                    w.includes("og:dynamic:text-color")
            )
        ).toBe(true);
    });

    it("does not warn about dynamic sub-settings when og:dynamic is true", async () => {
        const warnings = await runWithMetadata({
            ogDynamic: true,
            ogDynamicShowLogo: true,
            ogDynamicTextColor: "#000000",
            ogDynamicBackgroundColor: "#ffffff"
        });
        expect(warnings.some((w) => w.includes("require `og:dynamic: true`"))).toBe(false);
    });

    it("warns when og:dynamic:show-logo is false but og:dynamic:logo-color is set", async () => {
        const warnings = await runWithMetadata({
            ogDynamic: true,
            ogDynamicShowLogo: false,
            ogDynamicLogoColor: "dark"
        });
        expect(warnings.some((w) => w.includes("`og:dynamic:logo-color`") && w.includes("show-logo: false"))).toBe(
            true
        );
    });

    it("warns when og:image:width is set without og:image", async () => {
        const warnings = await runWithMetadata({
            ogImageWidth: 1200
        });
        expect(warnings.some((w) => w.includes("og:image:width") && w.includes("without `og:image`"))).toBe(true);
    });

    it("warns when og:image:height is set without og:image", async () => {
        const warnings = await runWithMetadata({
            ogImageHeight: 630
        });
        expect(warnings.some((w) => w.includes("og:image:height") && w.includes("without `og:image`"))).toBe(true);
    });

    it("does not warn about orphan dimensions when og:image is set", async () => {
        const warnings = await runWithMetadata({
            ogImage: "https://example.com/cover.png",
            ogImageWidth: 1200,
            ogImageHeight: 630
        });
        expect(warnings.some((w) => w.includes("without `og:image`"))).toBe(false);
    });

    it("warns when og:dynamic text-color and background-color are identical", async () => {
        const warnings = await runWithMetadata({
            ogDynamic: true,
            ogDynamicTextColor: "#000000",
            ogDynamicBackgroundColor: "#000000"
        });
        expect(warnings.some((w) => w.includes("invisible"))).toBe(true);
    });

    it("treats identical text/background colors as matching regardless of case and whitespace", async () => {
        const warnings = await runWithMetadata({
            ogDynamic: true,
            ogDynamicTextColor: "  #FFFFFF ",
            ogDynamicBackgroundColor: "#ffffff"
        });
        expect(warnings.some((w) => w.includes("invisible"))).toBe(true);
    });

    it("does not warn when text-color and background-color differ", async () => {
        const warnings = await runWithMetadata({
            ogDynamic: true,
            ogDynamicTextColor: "#000000",
            ogDynamicBackgroundColor: "#ffffff"
        });
        expect(warnings.some((w) => w.includes("invisible"))).toBe(false);
    });

    it("emits no metadata warnings for a sensible fully-dynamic config", async () => {
        const warnings = await runWithMetadata({
            ogDynamic: true,
            ogDynamicTextColor: "#111111",
            ogDynamicBackgroundColor: "#ffffff",
            ogDynamicLogoColor: "dark",
            ogDynamicShowLogo: true,
            ogDynamicShowSection: true,
            ogDynamicShowDescription: true,
            ogDynamicShowUrl: true,
            ogDynamicShowGradient: true
        });
        expect(warnings.filter((w) => w.startsWith("[metadata]"))).toEqual([]);
    });
});
