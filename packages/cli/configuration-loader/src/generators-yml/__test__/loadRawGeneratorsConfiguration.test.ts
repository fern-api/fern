import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { promises as fs } from "fs";
import yaml from "js-yaml";
import path from "path";
import tmp from "tmp-promise";
import { beforeEach, describe, expect, it } from "vitest";

import { getPathToGeneratorsConfiguration, loadRawGeneratorsConfiguration } from "../loadGeneratorsConfiguration.js";

describe("loadRawGeneratorsConfiguration", () => {
    const mockContext = createMockTaskContext();
    const validConfig = { groups: {} };
    const configYaml = yaml.dump(validConfig);
    let tmpDir: string;

    beforeEach(async () => {
        const { path: generatedPath } = await tmp.dir({ prefix: "generators-test-", postfix: "" });
        tmpDir = generatedPath;
    });

    it("loads .yml extension", async () => {
        const ymlPath = path.join(tmpDir, "generators.yml");
        await fs.writeFile(ymlPath, configYaml);

        const result = await loadRawGeneratorsConfiguration({
            absolutePathToWorkspace: AbsoluteFilePath.of(tmpDir),
            context: mockContext
        });

        expect(result).toEqual(validConfig);
    });

    it("loads .yaml extension", async () => {
        const yamlPath = path.join(tmpDir, "generators.yaml");
        await fs.writeFile(yamlPath, configYaml);

        const result = await loadRawGeneratorsConfiguration({
            absolutePathToWorkspace: AbsoluteFilePath.of(tmpDir),
            context: mockContext
        });

        expect(result).toEqual(validConfig);
    });

    it("loads the coexistence legacy filename", async () => {
        const legacyPath = path.join(tmpDir, "generators.legacy.yml");
        await fs.writeFile(legacyPath, configYaml);

        const result = await loadRawGeneratorsConfiguration({
            absolutePathToWorkspace: AbsoluteFilePath.of(tmpDir),
            context: mockContext
        });

        expect(result).toEqual(validConfig);
        expect(await getPathToGeneratorsConfiguration({ absolutePathToWorkspace: AbsoluteFilePath.of(tmpDir) })).toBe(
            legacyPath
        );
    });

    it("rejects ambiguous current and legacy filenames", async () => {
        await Promise.all([
            fs.writeFile(path.join(tmpDir, "generators.yml"), configYaml),
            fs.writeFile(path.join(tmpDir, "generators.legacy.yml"), configYaml)
        ]);

        await expect(
            getPathToGeneratorsConfiguration({ absolutePathToWorkspace: AbsoluteFilePath.of(tmpDir) })
        ).rejects.toThrow("Found both generators.yml and generators.legacy.yml");
    });

    it("shows hint for unquoted scoped npm package names", async () => {
        const ymlPath = path.join(tmpDir, "generators.yml");
        const invalidConfig = [
            "groups:",
            "  my-group:",
            "    generators:",
            "      - name: fernapi/fern-typescript-node-sdk",
            "        version: 0.0.1",
            "        output:",
            "          location: npm",
            "          package-name: @fixa-dev/server"
        ].join("\n");
        await fs.writeFile(ymlPath, invalidConfig);

        const loggedMessages: string[] = [];
        const contextWithCapture = createMockTaskContext({
            logger: {
                disable: () => undefined,
                enable: () => undefined,
                log: () => undefined,
                trace: () => undefined,
                debug: () => undefined,
                info: () => undefined,
                warn: () => undefined,
                error: (...args: string[]) => {
                    loggedMessages.push(args.join(" "));
                }
            }
        });

        await expect(
            loadRawGeneratorsConfiguration({
                absolutePathToWorkspace: AbsoluteFilePath.of(tmpDir),
                context: contextWithCapture
            })
        ).rejects.toThrow();

        const errorOutput = loggedMessages.join("\n");
        expect(errorOutput).toContain('Values starting with "@"');
        expect(errorOutput).toContain("must be wrapped in quotes");
    });
});
