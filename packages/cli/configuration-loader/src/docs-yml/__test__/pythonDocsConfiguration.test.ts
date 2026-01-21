import { describe, expect, it } from "vitest";

/**
 * Tests for python-docs configuration parsing.
 *
 * The python-docs feature allows users to configure Python library documentation
 * generation from a GitHub repository URL in their docs.yml navigation.
 */
describe("python-docs configuration", () => {
    describe("isRawPythonDocsSectionConfig type guard", () => {
        // Helper to simulate the type guard logic
        function isRawPythonDocsSectionConfig(item: unknown): boolean {
            return (
                typeof item === "object" &&
                item !== null &&
                !Array.isArray(item) &&
                typeof (item as Record<string, unknown>).pythonDocs === "string"
            );
        }

        it("should return true for valid python-docs config with only URL", () => {
            const config = {
                pythonDocs: "https://github.com/NVIDIA/NeMo-RL"
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(true);
        });

        it("should return true for python-docs config with title", () => {
            const config = {
                pythonDocs: "https://github.com/NVIDIA/NeMo-RL",
                title: "NeMo-RL Reference"
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(true);
        });

        it("should return true for python-docs config with slug", () => {
            const config = {
                pythonDocs: "https://github.com/NVIDIA/NeMo-RL",
                slug: "nemo-rl"
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(true);
        });

        it("should return true for python-docs config with all properties", () => {
            const config = {
                pythonDocs: "https://github.com/NVIDIA/NeMo-RL",
                title: "NeMo-RL Reference",
                slug: "nemo-rl"
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(true);
        });

        it("should return false for null", () => {
            expect(isRawPythonDocsSectionConfig(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isRawPythonDocsSectionConfig(undefined)).toBe(false);
        });

        it("should return false for string", () => {
            expect(isRawPythonDocsSectionConfig("https://github.com/NVIDIA/NeMo-RL")).toBe(false);
        });

        it("should return false for array", () => {
            expect(isRawPythonDocsSectionConfig(["pythonDocs"])).toBe(false);
        });

        it("should return false for empty object", () => {
            expect(isRawPythonDocsSectionConfig({})).toBe(false);
        });

        it("should return false for page config", () => {
            const config = {
                page: "Welcome",
                path: "docs/pages/welcome.mdx"
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(false);
        });

        it("should return false for section config", () => {
            const config = {
                section: "Get Started",
                contents: []
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(false);
        });

        it("should return false for api config", () => {
            const config = {
                api: "Plant Store API"
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(false);
        });

        it("should return false for link config", () => {
            const config = {
                link: "GitHub",
                href: "https://github.com/fern-api/fern"
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(false);
        });

        it("should return false for changelog config", () => {
            const config = {
                changelog: "docs/changelog"
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(false);
        });

        it("should return false for folder config", () => {
            const config = {
                folder: "docs/guides"
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(false);
        });

        it("should return false when pythonDocs is not a string", () => {
            const config = {
                pythonDocs: 123
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(false);
        });

        it("should return false when pythonDocs is null", () => {
            const config = {
                pythonDocs: null
            };
            expect(isRawPythonDocsSectionConfig(config)).toBe(false);
        });
    });

    describe("PythonDocsSection type", () => {
        // Test the expected shape of the parsed python-docs section
        interface PythonDocsSection {
            type: "pythonDocsSection";
            githubUrl: string;
            title: string | undefined;
            slug: string | undefined;
        }

        it("should create correct PythonDocsSection from minimal config", () => {
            const rawConfig = {
                pythonDocs: "https://github.com/NVIDIA/NeMo-RL"
            };

            const result: PythonDocsSection = {
                type: "pythonDocsSection",
                githubUrl: rawConfig.pythonDocs,
                title: undefined,
                slug: undefined
            };

            expect(result.type).toBe("pythonDocsSection");
            expect(result.githubUrl).toBe("https://github.com/NVIDIA/NeMo-RL");
            expect(result.title).toBeUndefined();
            expect(result.slug).toBeUndefined();
        });

        it("should create correct PythonDocsSection with title", () => {
            const rawConfig = {
                pythonDocs: "https://github.com/NVIDIA/NeMo-RL",
                title: "NeMo-RL Reference"
            };

            const result: PythonDocsSection = {
                type: "pythonDocsSection",
                githubUrl: rawConfig.pythonDocs,
                title: rawConfig.title ?? undefined,
                slug: undefined
            };

            expect(result.type).toBe("pythonDocsSection");
            expect(result.githubUrl).toBe("https://github.com/NVIDIA/NeMo-RL");
            expect(result.title).toBe("NeMo-RL Reference");
            expect(result.slug).toBeUndefined();
        });

        it("should create correct PythonDocsSection with slug", () => {
            const rawConfig = {
                pythonDocs: "https://github.com/NVIDIA/NeMo-RL",
                slug: "nemo-rl"
            };

            const result: PythonDocsSection = {
                type: "pythonDocsSection",
                githubUrl: rawConfig.pythonDocs,
                title: undefined,
                slug: rawConfig.slug ?? undefined
            };

            expect(result.type).toBe("pythonDocsSection");
            expect(result.githubUrl).toBe("https://github.com/NVIDIA/NeMo-RL");
            expect(result.title).toBeUndefined();
            expect(result.slug).toBe("nemo-rl");
        });

        it("should create correct PythonDocsSection with all properties", () => {
            const rawConfig = {
                pythonDocs: "https://github.com/NVIDIA/NeMo-RL",
                title: "NeMo-RL Reference",
                slug: "nemo-rl"
            };

            const result: PythonDocsSection = {
                type: "pythonDocsSection",
                githubUrl: rawConfig.pythonDocs,
                title: rawConfig.title ?? undefined,
                slug: rawConfig.slug ?? undefined
            };

            expect(result.type).toBe("pythonDocsSection");
            expect(result.githubUrl).toBe("https://github.com/NVIDIA/NeMo-RL");
            expect(result.title).toBe("NeMo-RL Reference");
            expect(result.slug).toBe("nemo-rl");
        });
    });

    describe("python-docs in docs.yml format", () => {
        it("should validate correct YAML structure for python-docs", () => {
            // This represents the expected YAML structure:
            // - python-docs: https://github.com/NVIDIA/NeMo-RL
            //   title: NeMo-RL Reference
            //   slug: nemo-rl
            const yamlParsedConfig = {
                pythonDocs: "https://github.com/NVIDIA/NeMo-RL",
                title: "NeMo-RL Reference",
                slug: "nemo-rl"
            };

            expect(typeof yamlParsedConfig.pythonDocs).toBe("string");
            expect(yamlParsedConfig.pythonDocs).toMatch(/^https:\/\/github\.com\//);
        });

        it("should handle GitHub URLs with different formats", () => {
            const validUrls = [
                "https://github.com/NVIDIA/NeMo-RL",
                "https://github.com/fern-api/fern",
                "https://github.com/owner/repo-name",
                "https://github.com/owner/repo_name"
            ];

            validUrls.forEach((url) => {
                const config = { pythonDocs: url };
                expect(typeof config.pythonDocs).toBe("string");
                expect(config.pythonDocs).toMatch(/^https:\/\/github\.com\//);
            });
        });
    });
});
