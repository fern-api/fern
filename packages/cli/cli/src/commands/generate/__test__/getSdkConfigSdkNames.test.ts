import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getSdkConfigSdkNames } from "../getSdkConfigSdkNames.js";

describe("getSdkConfigSdkNames", () => {
    const directories: string[] = [];
    const logger = { debug: vi.fn() };

    afterEach(async () => {
        await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
        logger.debug.mockClear();
    });

    async function folder(sdkConfig?: string): Promise<AbsoluteFilePath> {
        const directory = await mkdtemp(path.join(tmpdir(), "sdk-config-api-ids-"));
        directories.push(directory);
        if (sdkConfig != null) {
            await mkdir(directory, { recursive: true });
            await writeFile(path.join(directory, "sdk-config.yml"), sdkConfig);
        }
        return AbsoluteFilePath.of(directory);
    }

    const config = (sdkName: string, targets: string): string => `schemaVersion: sdk-config/v1
sdkName: ${sdkName}
source:
  specs:
    - id: pets
      type: openapi
      path: ./openapi.yml
targets:
${targets}`;

    const target = (language: string, extra = ""): string => `  - language: ${language}
    output:
      delivery: files
      path: ./generated/${language}
${extra}`;

    it("names the sdkName of the file for each language of its targets", async () => {
        const directory = await folder(config("petstore", target("typescript") + target("python")));

        expect(await getSdkConfigSdkNames({ directories: [directory], logger })).toEqual({
            typescript: ["petstore"],
            python: ["petstore"]
        });
    });

    it("prefers the sdkName of a target over the one of the file", async () => {
        const directory = await folder(
            config("petstore", target("typescript", "    sdkName: pets-ts\n") + target("go"))
        );

        expect(await getSdkConfigSdkNames({ directories: [directory], logger })).toEqual({
            typescript: ["pets-ts"],
            go: ["petstore"]
        });
    });

    it("lists each id once per language, over every folder it is given", async () => {
        const first = await folder(config("petstore", target("typescript")));
        const second = await folder(config("petstore", target("typescript")));
        const third = await folder(config("other", target("typescript")));

        expect(await getSdkConfigSdkNames({ directories: [first, second, third], logger })).toEqual({
            typescript: ["petstore", "other"]
        });
    });

    it("skips a folder with no sdk-config.yml", async () => {
        expect(await getSdkConfigSdkNames({ directories: [await folder()], logger })).toEqual({});
    });

    it("skips, and logs, a file that is not a valid SDK Config", async () => {
        const directory = await folder("not: a sdk config\n");

        expect(await getSdkConfigSdkNames({ directories: [directory], logger })).toEqual({});
        expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining("Could not read the SDK names"));
    });
});
