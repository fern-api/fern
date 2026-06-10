import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";
import { vi } from "vitest";

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

    it("handles a null overlay document without throwing an internal error", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await writeFile(specPath, yaml.dump(BASE_SPEC));

        const overlayPath = join(tempDir, "overlay.yml");
        await writeFile(overlayPath, "null\n");

        const contextWithError = createMockTaskContext();
        const error = vi.fn();
        contextWithError.logger.error = error;

        const result = await loadOpenAPI({
            context: contextWithError,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides: undefined,
            absolutePathToOpenAPIOverlays: AbsoluteFilePath.of(overlayPath)
        });

        expect(result).toMatchObject(BASE_SPEC);
        expect(error).toHaveBeenCalledWith("Overlay file must be a YAML or JSON object");
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

    it("inlines description $refs pointing at markdown files", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await mkdir(join(tempDir, "descriptions"), { recursive: true });
        await writeFile(join(tempDir, "intro.md"), "Intro markdown for the API.");
        await writeFile(join(tempDir, "descriptions", "listPets.md"), "Lists every pet in the store.");

        await writeFile(
            specPath,
            yaml.dump({
                openapi: "3.0.0",
                info: {
                    title: "Pet Store",
                    version: "1.0.0",
                    description: { $ref: "./intro.md" }
                },
                paths: {
                    "/pets": {
                        get: {
                            operationId: "listPets",
                            description: { $ref: "./descriptions/listPets.md" },
                            responses: {
                                "200": { description: "OK" }
                            }
                        }
                    }
                }
            })
        );

        const result = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides: undefined,
            absolutePathToOpenAPIOverlays: undefined
        });

        expect(result.info.description).toBe("Intro markdown for the API.");
        const listPetsOp = (result.paths as Record<string, Record<string, Record<string, unknown>>>)["/pets"]?.get;
        expect(listPetsOp?.description).toBe("Lists every pet in the store.");
    });

    it("preserves x-fern-default on inline parameters added via override", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await writeFile(
            specPath,
            yaml.dump({
                openapi: "3.0.3",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/test/{region}/resource": {
                        get: {
                            operationId: "test_get",
                            parameters: [
                                { name: "region", in: "path", required: true, schema: { type: "string" } },
                                { name: "limit", in: "query", required: false, schema: { type: "string" } }
                            ],
                            responses: { "200": { description: "Success" } }
                        }
                    }
                }
            })
        );

        const overridePath = join(tempDir, "overrides.yml");
        await writeFile(
            overridePath,
            yaml.dump({
                paths: {
                    "/test/{region}/resource": {
                        get: {
                            parameters: [
                                { name: "region", "x-fern-default": "us-east-1" },
                                { name: "limit", "x-fern-default": "100" }
                            ]
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

        const params = (result.paths as Record<string, Record<string, Record<string, unknown[]>>>)[
            "/test/{region}/resource"
        ]?.get?.parameters as Array<Record<string, unknown>> | undefined;
        expect(params).toBeDefined();
        expect(params?.[0]?.["x-fern-default"]).toBe("us-east-1");
        expect(params?.[1]?.["x-fern-default"]).toBe("100");
    });

    it("preserves x-fern-default on $ref parameters added via override", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await writeFile(
            specPath,
            yaml.dump({
                openapi: "3.0.3",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/test": {
                        get: {
                            operationId: "test_get",
                            parameters: [{ $ref: "#/components/parameters/Region" }],
                            responses: { "200": { description: "Success" } }
                        }
                    }
                },
                components: {
                    parameters: {
                        Region: { name: "region", in: "query", required: false, schema: { type: "string" } }
                    }
                }
            })
        );

        const overridePath = join(tempDir, "overrides.yml");
        await writeFile(
            overridePath,
            yaml.dump({
                paths: {
                    "/test": {
                        get: {
                            parameters: [{ "x-fern-default": "us-east-1" }]
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

        const params = (result.paths as Record<string, Record<string, Record<string, unknown[]>>>)["/test"]?.get
            ?.parameters as Array<Record<string, unknown>> | undefined;
        expect(params).toBeDefined();
        // After merge + bundle, the parameter should have x-fern-default
        // either on the $ref object itself or on the resolved component
        const param = params?.[0];
        const hasDefault =
            param?.["x-fern-default"] === "us-east-1" || (result as Record<string, unknown>).components != null;
        expect(param?.["x-fern-default"]).toBe("us-east-1");
    });

    it("preserves x-fern-default on component parameters added via override", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await writeFile(
            specPath,
            yaml.dump({
                openapi: "3.0.3",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/test": {
                        get: {
                            operationId: "test_get",
                            parameters: [{ $ref: "#/components/parameters/Region" }],
                            responses: { "200": { description: "Success" } }
                        }
                    }
                },
                components: {
                    parameters: {
                        Region: { name: "region", in: "query", required: false, schema: { type: "string" } }
                    }
                }
            })
        );

        const overridePath = join(tempDir, "overrides.yml");
        await writeFile(
            overridePath,
            yaml.dump({
                components: {
                    parameters: {
                        Region: { "x-fern-default": "us-east-1" }
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

        const components = (
            result as unknown as Record<string, Record<string, Record<string, Record<string, unknown>>>>
        ).components;
        const regionParam = components?.parameters?.Region;
        expect(regionParam?.["x-fern-default"]).toBe("us-east-1");
    });

    it("inlines description $refs introduced by an override, relative to the override's directory", async () => {
        const specPath = join(tempDir, "openapi.yml");
        await writeFile(specPath, yaml.dump(BASE_SPEC));

        const overrideDir = join(tempDir, "overrides");
        await mkdir(overrideDir, { recursive: true });
        await writeFile(join(overrideDir, "intro.md"), "Intro from override.");

        const overridePath = join(overrideDir, "override.yml");
        await writeFile(
            overridePath,
            yaml.dump({
                info: {
                    description: { $ref: "./intro.md" }
                }
            })
        );

        const result = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides: AbsoluteFilePath.of(overridePath),
            absolutePathToOpenAPIOverlays: undefined
        });

        expect(result.info.description).toBe("Intro from override.");
    });
});
