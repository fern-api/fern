import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";

import { loadOpenAPI } from "../utils/loadOpenAPI.js";
import { createMockTaskContext } from "./helpers/createMockTaskContext.js";

const BASE_SPEC = {
    openapi: "3.0.0",
    info: {
        title: "Pet Store",
        version: "1.0.0"
    },
    paths: {
        "/pets": {
            get: {
                operationId: "listPets",
                responses: {
                    "200": {
                        description: "OK"
                    }
                }
            }
        }
    }
};

describe("loadOpenAPI", () => {
    let tempDir: string;
    const context = createMockTaskContext();

    beforeEach(async () => {
        tempDir = join(tmpdir(), `load-openapi-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        await mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it("loads a spec without overrides", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await writeFile(specPath, yaml.dump(BASE_SPEC));

        const result = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides: undefined,
            absolutePathToOpenAPIOverlays: undefined
        });

        expect(result).toMatchObject({
            openapi: "3.0.0",
            info: {
                title: "Pet Store",
                version: "1.0.0"
            }
        });
        expect(result.paths).toHaveProperty("/pets");
    });

    it("applies a single override", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await writeFile(specPath, yaml.dump(BASE_SPEC));

        const overridePath = join(tempDir, "override.yml");
        await writeFile(
            overridePath,
            yaml.dump({
                info: {
                    title: "Overridden Pet Store"
                }
            })
        );

        const result = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides: AbsoluteFilePath.of(overridePath),
            absolutePathToOpenAPIOverlays: undefined
        });

        expect(result.info.title).toBe("Overridden Pet Store");
        expect(result.info.version).toBe("1.0.0");
    });

    it("applies multiple overrides sequentially", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await writeFile(specPath, yaml.dump(BASE_SPEC));

        const override1Path = join(tempDir, "override1.yml");
        await writeFile(
            override1Path,
            yaml.dump({
                info: {
                    title: "First Override",
                    description: "Added by first"
                }
            })
        );

        const override2Path = join(tempDir, "override2.yml");
        await writeFile(
            override2Path,
            yaml.dump({
                info: {
                    title: "Second Override",
                    contact: { name: "Support" }
                }
            })
        );

        const result = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides: [AbsoluteFilePath.of(override1Path), AbsoluteFilePath.of(override2Path)],
            absolutePathToOpenAPIOverlays: undefined
        });

        expect(result.info.title).toBe("Second Override");
        expect((result.info as Record<string, unknown>).description).toBe("Added by first");
        expect((result.info as Record<string, unknown>).contact).toEqual({ name: "Support" });
        expect(result.info.version).toBe("1.0.0");
    });

    it("adds a new path via override", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await writeFile(specPath, yaml.dump(BASE_SPEC));

        const overridePath = join(tempDir, "override.yml");
        await writeFile(
            overridePath,
            yaml.dump({
                paths: {
                    "/pets/{petId}": {
                        get: {
                            operationId: "getPet",
                            parameters: [
                                {
                                    name: "petId",
                                    in: "path",
                                    required: true,
                                    schema: { type: "string" }
                                }
                            ],
                            responses: {
                                "200": {
                                    description: "OK"
                                }
                            }
                        }
                    }
                }
            })
        );

        const result = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides: AbsoluteFilePath.of(overridePath),
            absolutePathToOpenAPIOverlays: undefined
        });

        expect(result.paths).toHaveProperty("/pets");
        expect(result.paths).toHaveProperty("/pets/{petId}");
        const petIdPath = (result.paths as Record<string, Record<string, unknown>>)["/pets/{petId}"];
        expect(petIdPath).toHaveProperty("get");
    });

    it("handles empty overrides array", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await writeFile(specPath, yaml.dump(BASE_SPEC));

        const result = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides: [],
            absolutePathToOpenAPIOverlays: undefined
        });

        expect(result).toMatchObject({
            openapi: "3.0.0",
            info: {
                title: "Pet Store",
                version: "1.0.0"
            }
        });
        expect(result.paths).toHaveProperty("/pets");
    });

    it("uses x-fern-overrides-filepath extension as fallback", async () => {
        const specPath = join(tempDir, "openapi.yml");
        const specWithExtension = {
            ...BASE_SPEC,
            "x-fern-overrides-filepath": "./fallback-override.yml"
        };
        await writeFile(specPath, yaml.dump(specWithExtension));

        const fallbackPath = join(tempDir, "fallback-override.yml");
        await writeFile(
            fallbackPath,
            yaml.dump({
                info: {
                    title: "Fallback Override"
                }
            })
        );

        const result = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides: undefined,
            absolutePathToOpenAPIOverlays: undefined
        });

        expect(result.info.title).toBe("Fallback Override");
        expect(result.info.version).toBe("1.0.0");
    });

    it("explicit overrides take precedence over x-fern-overrides-filepath extension", async () => {
        const specPath = join(tempDir, "openapi.yml");
        const specWithExtension = {
            ...BASE_SPEC,
            "x-fern-overrides-filepath": "./fallback-override.yml"
        };
        await writeFile(specPath, yaml.dump(specWithExtension));

        const fallbackPath = join(tempDir, "fallback-override.yml");
        await writeFile(
            fallbackPath,
            yaml.dump({
                info: {
                    title: "Fallback Override"
                }
            })
        );

        const explicitPath = join(tempDir, "explicit-override.yml");
        await writeFile(
            explicitPath,
            yaml.dump({
                info: {
                    title: "Explicit Override"
                }
            })
        );

        const result = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides: AbsoluteFilePath.of(explicitPath),
            absolutePathToOpenAPIOverlays: undefined
        });

        expect(result.info.title).toBe("Explicit Override");
        expect(result.info.version).toBe("1.0.0");
    });

    it("multiple overrides each modify different paths", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await writeFile(specPath, yaml.dump(BASE_SPEC));

        const override1Path = join(tempDir, "override1.yml");
        await writeFile(
            override1Path,
            yaml.dump({
                paths: {
                    "/pets": {
                        get: {
                            summary: "List all pets"
                        }
                    }
                }
            })
        );

        const override2Path = join(tempDir, "override2.yml");
        await writeFile(
            override2Path,
            yaml.dump({
                paths: {
                    "/owners": {
                        get: {
                            operationId: "listOwners",
                            responses: {
                                "200": {
                                    description: "OK"
                                }
                            }
                        }
                    }
                }
            })
        );

        const result = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides: [AbsoluteFilePath.of(override1Path), AbsoluteFilePath.of(override2Path)],
            absolutePathToOpenAPIOverlays: undefined
        });

        expect(result.paths).toHaveProperty("/pets");
        expect(result.paths).toHaveProperty("/owners");

        const petsPath = (result.paths as Record<string, Record<string, Record<string, unknown>>>)["/pets"];
        expect(petsPath?.get?.summary).toBe("List all pets");
        expect(petsPath?.get?.operationId).toBe("listPets");

        const ownersPath = (result.paths as Record<string, Record<string, Record<string, unknown>>>)["/owners"];
        expect(ownersPath?.get?.operationId).toBe("listOwners");
    });
});
