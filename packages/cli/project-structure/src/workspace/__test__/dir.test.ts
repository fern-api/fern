import path from "node:path";
import { describe, expect, it } from "vitest";

import { useTemporaryDirectories } from "../../__test__/fixtures.js";
import { definitionDirectoryExists, detectProjectDir, detectWorkspaceDir } from "../index.js";

describe("detectWorkspaceDir", () => {
    const createDirectory = useTemporaryDirectories();

    it("reports an empty folder", async () => {
        const directory = await createDirectory({});

        expect(await detectWorkspaceDir(directory)).toEqual({
            path: directory,
            generatorsFile: { type: "none" },
            sdkConfigFile: undefined,
            hasDefinitionDirectory: false,
            hasOpenapiDirectory: false,
            hasAsyncapiDirectory: false
        });
    });

    it("reports everything a folder holds", async () => {
        const directory = await createDirectory({
            "generators.yml": "",
            "sdk-config.yml": "",
            "definition/api.yml": "",
            "openapi/openapi.yml": "",
            "asyncapi/asyncapi.yml": ""
        });

        expect(await detectWorkspaceDir(directory)).toEqual({
            path: directory,
            generatorsFile: { type: "found", path: path.join(directory, "generators.yml"), name: "generators.yml" },
            sdkConfigFile: path.join(directory, "sdk-config.yml"),
            hasDefinitionDirectory: true,
            hasOpenapiDirectory: true,
            hasAsyncapiDirectory: true
        });
    });

    it("reports a generators conflict instead of throwing", async () => {
        const directory = await createDirectory({ "generators.yml": "", "generators.legacy.yml": "" });

        expect((await detectWorkspaceDir(directory)).generatorsFile).toEqual({
            type: "conflict",
            activeName: "generators.yml"
        });
    });

    it("counts a file called definition as a definition directory", async () => {
        const directory = await createDirectory({ definition: "" });

        expect((await detectWorkspaceDir(directory)).hasDefinitionDirectory).toBe(true);
    });
});

describe("definitionDirectoryExists", () => {
    const createDirectory = useTemporaryDirectories();

    it("is true when the folder has a definition/ directory", async () => {
        expect(await definitionDirectoryExists(await createDirectory({ "definition/api.yml": "" }))).toBe(true);
    });

    it("is false when it does not", async () => {
        expect(await definitionDirectoryExists(await createDirectory({ "openapi/spec.yml": "" }))).toBe(false);
    });
});

describe("detectProjectDir", () => {
    const createDirectory = useTemporaryDirectories();

    it("has no apis when there is no apis folder", async () => {
        const directory = await createDirectory({ "generators.yml": "" });

        const project = await detectProjectDir(directory);

        expect(project.path).toBe(directory);
        expect(project.root.generatorsFile.type).toBe("found");
        expect(project.apis).toBeUndefined();
    });

    it("has an empty list of apis for an empty apis folder", async () => {
        const directory = await createDirectory({ "apis/.gitkeep": "" });

        expect((await detectProjectDir(directory)).apis).toEqual([]);
    });

    it("lists each folder in apis with its own facts and ignores files", async () => {
        const directory = await createDirectory({
            "sdk-config.yml": "",
            "apis/README.md": "",
            "apis/a/generators.yml": "",
            "apis/b/sdk-config.yml": "",
            "apis/b/openapi/openapi.yml": ""
        });

        const project = await detectProjectDir(directory);

        expect(project.root.sdkConfigFile).toBe(path.join(directory, "sdk-config.yml"));
        expect(project.apis?.map((api) => api.name).sort()).toEqual(["a", "b"]);
        const a = project.apis?.find((api) => api.name === "a")?.dir;
        const b = project.apis?.find((api) => api.name === "b")?.dir;
        expect(a?.path).toBe(path.join(directory, "apis", "a"));
        expect(a?.generatorsFile.type).toBe("found");
        expect(a?.sdkConfigFile).toBeUndefined();
        expect(b?.generatorsFile.type).toBe("none");
        expect(b?.sdkConfigFile).toBe(path.join(directory, "apis", "b", "sdk-config.yml"));
        expect(b?.hasOpenapiDirectory).toBe(true);
    });

    it("rejects when apis is a file", async () => {
        const directory = await createDirectory({ apis: "" });

        await expect(detectProjectDir(directory)).rejects.toThrow();
    });
});
