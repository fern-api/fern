import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import { resolveCliBannerFile } from "../resolveCliBannerFile.js";

const CLI_GENERATOR = "fernapi/fern-cli-generator";
const absolutePathToGeneratorsConfiguration = AbsoluteFilePath.of(__filename);

describe("resolveCliBannerFile", () => {
    it("inlines banner.file relative to generators.yml and keeps the colours", async () => {
        const resolved = await resolveCliBannerFile({
            generatorName: CLI_GENERATOR,
            config: { binaryName: "acme", banner: { file: "testdata/cli-banner.txt", colors: ["#4949F2"] } },
            absolutePathToGeneratorsConfiguration
        });
        expect(resolved).toEqual({ binaryName: "acme", banner: { text: "ACME\n CLI\n", colors: ["#4949F2"] } });
    });

    it("leaves inline banner text untouched", async () => {
        const config = { banner: { text: "ACME" } };
        const resolved = await resolveCliBannerFile({
            generatorName: CLI_GENERATOR,
            config,
            absolutePathToGeneratorsConfiguration
        });
        expect(resolved).toBe(config);
    });

    it("ignores other generators", async () => {
        const config = { banner: { file: "does-not-exist.txt" } };
        const resolved = await resolveCliBannerFile({
            generatorName: "fernapi/fern-typescript-sdk",
            config,
            absolutePathToGeneratorsConfiguration
        });
        expect(resolved).toBe(config);
    });

    it("rejects setting both text and file", async () => {
        await expect(
            resolveCliBannerFile({
                generatorName: CLI_GENERATOR,
                config: { banner: { text: "ACME", file: "testdata/cli-banner.txt" } },
                absolutePathToGeneratorsConfiguration
            })
        ).rejects.toThrow("set either `text` or `file`, not both");
    });

    it("rejects a non-string file", async () => {
        await expect(
            resolveCliBannerFile({
                generatorName: CLI_GENERATOR,
                config: { banner: { file: 42 } },
                absolutePathToGeneratorsConfiguration
            })
        ).rejects.toThrow("expected a path to a text file");
    });

    it("reports a missing file", async () => {
        await expect(
            resolveCliBannerFile({
                generatorName: CLI_GENERATOR,
                config: { banner: { file: "testdata/missing.txt" } },
                absolutePathToGeneratorsConfiguration
            })
        ).rejects.toThrow('Failed to read config.banner.file "testdata/missing.txt"');
    });
});
