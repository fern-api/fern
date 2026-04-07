import { describe, expect, it } from "vitest";
import { convertSdkTargets, convertSdkTargetsFromRaw } from "../converters/convertSdkTargets.js";

describe("convertSdkTargets", () => {
    it("returns empty targets when groups is undefined", () => {
        const result = convertSdkTargets({
            groups: undefined,
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined
        });
        expect(result.sdks.targets).toEqual({});
        expect(result.warnings).toEqual([]);
    });

    it("converts a basic TypeScript SDK generator", () => {
        const result = convertSdkTargets({
            groups: {
                "my-sdk": {
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "1.0.0",
                            output: {
                                location: "local-file-system",
                                path: "./sdks/typescript"
                            }
                        }
                    ]
                }
            },
            defaultGroup: "my-sdk",
            autorelease: undefined,
            readme: undefined
        });

        expect(result.sdks.targets).toHaveProperty("typescript");
        const target = result.sdks.targets["typescript"];
        expect(target).toBeDefined();
        expect(target?.lang).toBe("typescript");
        expect(target?.version).toBe("1.0.0");
        expect(target?.output).toEqual({ path: "./sdks/typescript" });
    });

    it("does not include 'group' or 'defaultGroup' in output targets", () => {
        const result = convertSdkTargets({
            groups: {
                staging: {
                    generators: [
                        {
                            name: "fernapi/fern-python-sdk",
                            version: "2.0.0",
                            output: {
                                location: "local-file-system",
                                path: "./sdks/python"
                            }
                        }
                    ]
                }
            },
            defaultGroup: "staging",
            autorelease: true,
            readme: undefined
        });

        const target = result.sdks.targets["python"];
        // Ensure no group/defaultGroup fields leak into target output
        expect(target).not.toHaveProperty("group");
        expect(target).not.toHaveProperty("defaultGroup");
        expect(result.sdks).not.toHaveProperty("group");
        expect(result.sdks).not.toHaveProperty("defaultGroup");
        // autorelease is preserved
        expect(result.sdks.autorelease).toBe(true);
    });

    it("handles multiple generators across groups", () => {
        const result = convertSdkTargets({
            groups: {
                alpha: {
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "1.0.0",
                            output: { location: "local-file-system", path: "./ts" }
                        }
                    ]
                },
                beta: {
                    generators: [
                        {
                            name: "fernapi/fern-python-sdk",
                            version: "2.0.0",
                            output: { location: "local-file-system", path: "./py" }
                        }
                    ]
                }
            },
            defaultGroup: "alpha",
            autorelease: undefined,
            readme: undefined
        });

        expect(Object.keys(result.sdks.targets)).toContain("typescript");
        expect(Object.keys(result.sdks.targets)).toContain("python");
    });

    it("deduplicates target names when same language appears in multiple groups", () => {
        const result = convertSdkTargets({
            groups: {
                staging: {
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "1.0.0",
                            output: { location: "local-file-system", path: "./ts1" }
                        }
                    ]
                },
                production: {
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "2.0.0",
                            output: { location: "local-file-system", path: "./ts2" }
                        }
                    ]
                }
            },
            defaultGroup: "staging",
            autorelease: undefined,
            readme: undefined
        });

        expect(result.sdks.targets).toHaveProperty("typescript");
        expect(result.sdks.targets).toHaveProperty("typescript-2");
    });

    it("warns on unknown generator names", () => {
        const result = convertSdkTargets({
            groups: {
                custom: {
                    generators: [
                        {
                            name: "my-custom-generator",
                            version: "1.0.0",
                            output: { location: "local-file-system", path: "./out" }
                        }
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined
        });

        expect(result.sdks.targets).toEqual({});
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]?.type).toBe("unsupported");
    });

    it("preserves generator config", () => {
        const result = convertSdkTargets({
            groups: {
                sdk: {
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "1.0.0",
                            config: { streamType: "sse", fetchSupport: "node-fetch" },
                            output: { location: "local-file-system", path: "./ts" }
                        }
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined
        });

        const target = result.sdks.targets["typescript"];
        expect(target).toBeDefined();
        expect(target?.config).toEqual({ streamType: "sse", fetchSupport: "node-fetch" });
    });

    it("converts npm output to publish config", () => {
        const result = convertSdkTargets({
            groups: {
                sdk: {
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "1.0.0",
                            output: {
                                location: "npm",
                                "package-name": "@acme/sdk",
                                token: "${NPM_TOKEN}"
                            }
                        }
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined
        });

        const target = result.sdks.targets["typescript"];
        expect(target).toBeDefined();
        expect(target?.publish).toBeDefined();
        expect(target?.publish?.npm).toBeDefined();
        expect(target?.publish?.npm?.packageName).toBe("@acme/sdk");
    });

    it("sets api field when apiName is provided", () => {
        const result = convertSdkTargets({
            groups: {
                sdk: {
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "1.0.0",
                            output: { location: "local-file-system", path: "./ts" }
                        }
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined,
            apiName: "payments"
        });

        expect(result.sdks.targets).toHaveProperty("typescript-payments");
        const target = result.sdks.targets["typescript-payments"];
        expect(target).toBeDefined();
        expect(target?.api).toBe("payments");
    });
});

describe("convertSdkTargetsFromRaw", () => {
    it("does not include 'group' or 'defaultGroup' in output", () => {
        const result = convertSdkTargetsFromRaw({
            groups: {
                staging: {
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "1.0.0",
                            output: { location: "local-file-system", path: "./ts" }
                        }
                    ]
                }
            },
            defaultGroup: "staging",
            autorelease: undefined,
            readme: undefined
        });

        const target = result.sdks.targets["typescript"];
        expect(target).toBeDefined();
        expect(target).not.toHaveProperty("group");
        expect(target).not.toHaveProperty("defaultGroup");
        expect(result.sdks).not.toHaveProperty("group");
        expect(result.sdks).not.toHaveProperty("defaultGroup");
    });

    it("handles generators with image field instead of name", () => {
        const result = convertSdkTargetsFromRaw({
            groups: {
                sdk: {
                    generators: [
                        {
                            image: { name: "fernapi/fern-typescript-sdk", registry: "docker.io" },
                            version: "1.0.0",
                            output: { location: "local-file-system", path: "./ts" }
                        }
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined
        });

        expect(result.sdks.targets).toHaveProperty("typescript");
        const target = result.sdks.targets["typescript"];
        expect(target).toBeDefined();
        expect(target?.image).toBeDefined();
        expect(typeof target?.image).toBe("object");
        const img = target?.image as { name: string; registry: string } | undefined;
        expect(img?.name).toBe("fernapi/fern-typescript-sdk");
    });

    it("warns when generator has no name or image", () => {
        const result = convertSdkTargetsFromRaw({
            groups: {
                sdk: {
                    generators: [
                        {
                            version: "1.0.0",
                            output: { location: "local-file-system", path: "./ts" }
                        }
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined
        });

        expect(result.sdks.targets).toEqual({});
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]?.message).toContain("missing");
    });

    it("handles raw git output configuration", () => {
        const result = convertSdkTargetsFromRaw({
            groups: {
                sdk: {
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "1.0.0",
                            output: {
                                git: {
                                    repository: "fern-api/fern-typescript",
                                    mode: "pull-request",
                                    branch: "main"
                                }
                            }
                        }
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined
        });

        const target = result.sdks.targets["typescript"];
        expect(target).toBeDefined();
        expect(target?.output).toBeDefined();
        const output = target?.output as { git?: { repository: string; mode?: string; branch?: string } };
        expect(output?.git).toBeDefined();
        expect(output?.git?.repository).toBe("fern-api/fern-typescript");
        expect(output?.git?.mode).toBe("pr");
    });

    // ── metadata migration ──────────────────────────────────────────────────

    it("migrates metadata.license to output.git.license", () => {
        const result = convertSdkTargetsFromRaw({
            groups: {
                "python-sdk": {
                    generators: [
                        {
                            name: "fernapi/fern-python-sdk",
                            version: "4.64.1",
                            output: { location: "pypi", "package-name": "schematichq", token: "${PYPI_TOKEN}" },
                            metadata: { license: "MIT" },
                            github: { repository: "schematichq/schematic-python", mode: "pull-request" }
                        }
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined
        });

        const target = result.sdks.targets["python"];
        const output = target?.output as { git?: { license?: string } } | undefined;
        expect(output?.git?.license).toBe("MIT");
    });

    it("migrates metadata.author and metadata.email to metadata.authors", () => {
        const result = convertSdkTargetsFromRaw({
            groups: {
                "java-sdk": {
                    generators: [
                        {
                            name: "fernapi/fern-java-sdk",
                            version: "3.44.6",
                            output: { location: "local-file-system", path: "./java" },
                            metadata: {
                                author: "Schematic",
                                email: "support@schematichq.com",
                                "package-description": "Official Java SDK"
                            }
                        }
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined
        });

        const target = result.sdks.targets["java"];
        expect(target?.metadata?.description).toBe("Official Java SDK");
        expect(target?.metadata?.authors).toEqual([{ name: "Schematic", email: "support@schematichq.com" }]);
    });

    it("warns on metadata.reference-url as unsupported", () => {
        const result = convertSdkTargetsFromRaw({
            groups: {
                sdk: {
                    generators: [
                        {
                            name: "fernapi/fern-java-sdk",
                            version: "3.44.6",
                            output: { location: "local-file-system", path: "./java" },
                            metadata: { "reference-url": "https://schematichq.com" }
                        }
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined
        });

        const warn = result.warnings.find((w) => w.message.includes("reference-url"));
        expect(warn).toBeDefined();
        expect(warn?.type).toBe("unsupported");
    });

    it("warns on smart-casing as unsupported and does not include it in the target", () => {
        const result = convertSdkTargetsFromRaw({
            groups: {
                sdk: {
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "3.60.9",
                            "smart-casing": true,
                            output: { location: "local-file-system", path: "./ts" }
                        } as never
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: undefined,
            readme: undefined
        });

        const warn = result.warnings.find((w) => w.message.includes("smart-casing"));
        expect(warn).toBeDefined();
        expect(warn?.type).toBe("unsupported");
        expect(result.sdks.targets["typescript"]).not.toHaveProperty("smart-casing");
    });

    it("migrates a real-world schematic-like config with metadata and smart-casing", () => {
        const result = convertSdkTargetsFromRaw({
            groups: {
                "python-sdk": {
                    generators: [
                        {
                            name: "fernapi/fern-python-sdk",
                            version: "4.64.1",
                            output: { location: "pypi", "package-name": "schematichq", token: "${PYPI_TOKEN}" },
                            metadata: { license: "MIT" },
                            github: { repository: "schematichq/schematic-python", mode: "pull-request" },
                            "smart-casing": false
                        } as never
                    ]
                },
                "java-sdk": {
                    generators: [
                        {
                            name: "fernapi/fern-java-sdk",
                            version: "3.44.6",
                            output: {
                                location: "maven",
                                coordinate: "com.schematichq:schematic-java",
                                username: "${MAVEN_USERNAME}",
                                password: "${MAVEN_PASSWORD}"
                            },
                            metadata: {
                                "reference-url": "https://schematichq.com",
                                author: "Schematic",
                                email: "support@schematichq.com",
                                "package-description": "Official Java SDK for Schematic",
                                license: "MIT"
                            },
                            github: { repository: "schematichq/schematic-java", mode: "pull-request" },
                            "smart-casing": false
                        } as never
                    ]
                }
            },
            defaultGroup: undefined,
            autorelease: false,
            readme: undefined
        });

        // Python: license migrated to git.license
        const python = result.sdks.targets["python"];
        const pythonOutput = python?.output as { git?: { license?: string } } | undefined;
        expect(pythonOutput?.git?.license).toBe("MIT");

        // Java: all metadata fields migrated
        const java = result.sdks.targets["java"];
        expect(java?.metadata?.description).toBe("Official Java SDK for Schematic");
        expect(java?.metadata?.authors?.[0]).toEqual({ name: "Schematic", email: "support@schematichq.com" });
        const javaOutput = java?.output as { git?: { license?: string } } | undefined;
        expect(javaOutput?.git?.license).toBe("MIT");

        // smart-casing warnings emitted (2 generators)
        const smartCasingWarnings = result.warnings.filter((w) => w.message.includes("smart-casing"));
        expect(smartCasingWarnings).toHaveLength(2);

        // reference-url warning emitted
        const refUrlWarning = result.warnings.find((w) => w.message.includes("reference-url"));
        expect(refUrlWarning).toBeDefined();

        // autorelease preserved
        expect(result.sdks.autorelease).toBe(false);
    });
});
