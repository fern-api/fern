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
        expect(target?.image?.name).toBe("fernapi/fern-typescript-sdk");
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
});
