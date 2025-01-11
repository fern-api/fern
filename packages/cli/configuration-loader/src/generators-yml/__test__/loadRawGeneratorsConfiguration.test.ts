import { promises as fs } from "fs";
import yaml from "js-yaml";
import path from "path";
import tmp from "tmp-promise";
import { beforeEach, describe, expect, it } from "vitest";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";

import { loadRawGeneratorsConfiguration } from "../loadGeneratorsConfiguration";

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
});
