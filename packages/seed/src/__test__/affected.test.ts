import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import {
    type AffectedResult,
    detectAffected,
    resolveAffectedFixtures,
    resolveAffectedGenerators
} from "../commands/affected/getAffected";
import { GeneratorWorkspace } from "../loadGeneratorWorkspaces";

// Helper to create a minimal GeneratorWorkspace for testing
function createGenerator(workspaceName: string): GeneratorWorkspace {
    return {
        workspaceName,
        absolutePathToWorkspace: AbsoluteFilePath.of(`/seed/${workspaceName}`),
        workspaceConfig: {
            image: "test",
            displayName: workspaceName,
            irVersion: "1.0.0",
            test: {} as never,
            publish: {} as never,
            defaultOutputMode: "github",
            generatorType: "SDK"
        }
    };
}

// Standard set of generators used across tests
const ALL_GENERATORS: GeneratorWorkspace[] = [
    createGenerator("ts-sdk"),
    createGenerator("python-sdk"),
    createGenerator("pydantic"),
    createGenerator("pydantic-v2"),
    createGenerator("fastapi"),
    createGenerator("java-sdk"),
    createGenerator("java-model"),
    createGenerator("go-sdk"),
    createGenerator("go-model"),
    createGenerator("csharp-sdk"),
    createGenerator("csharp-model"),
    createGenerator("ruby-sdk"),
    createGenerator("ruby-sdk-v2"),
    createGenerator("php-sdk"),
    createGenerator("php-model"),
    createGenerator("swift-sdk"),
    createGenerator("rust-sdk"),
    createGenerator("rust-model"),
    createGenerator("openapi")
];

// Standard set of fixtures
const ALL_FIXTURES = ["imdb", "exhaustive", "alias", "basic-auth", "file-upload", "unions"];

describe("detectAffected", () => {
    describe("fallback behavior", () => {
        it("skips all seed tests when no changed files detected", () => {
            const result = detectAffected([], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(false);
            expect(result.allFixturesAffected).toBe(false);
            expect(result.affectedGenerators).toEqual([]);
            expect(result.generatorsWithAllFixtures).toEqual([]);
            expect(result.affectedFixtures).toEqual([]);
        });

        it("skips all seed tests when changed files don't match any known pattern", () => {
            const result = detectAffected(["README.md", "docs/guide.md", ".github/workflows/ci.yml"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(false);
            expect(result.allFixturesAffected).toBe(false);
            expect(result.affectedGenerators).toEqual([]);
            expect(result.generatorsWithAllFixtures).toEqual([]);
            expect(result.affectedFixtures).toEqual([]);
        });

        it("skips all seed tests when only versions.yml files change", () => {
            const result = detectAffected(
                ["generators/csharp/sdk/versions.yml", "generators/csharp/model/versions.yml"],
                ALL_GENERATORS
            );

            expect(result.allGeneratorsAffected).toBe(false);
            expect(result.allFixturesAffected).toBe(false);
            expect(result.affectedGenerators).toEqual([]);
            expect(result.generatorsWithAllFixtures).toEqual([]);
            expect(result.affectedFixtures).toEqual([]);
        });

        it("skips seed for versions.yml but still detects other generator changes", () => {
            const result = detectAffected(
                ["generators/csharp/sdk/versions.yml", "generators/python/src/generator.ts"],
                ALL_GENERATORS
            );

            expect(result.affectedGenerators).toContain("python-sdk");
            expect(result.affectedGenerators).not.toContain("csharp-sdk");
            expect(result.affectedGenerators).not.toContain("csharp-model");
        });

        it("skips all seed tests when only CLI code changes", () => {
            const result = detectAffected(
                ["packages/cli/cli/src/commands/check.ts", "packages/cli/cli/src/cli.ts"],
                ALL_GENERATORS
            );

            expect(result.allGeneratorsAffected).toBe(false);
            expect(result.allFixturesAffected).toBe(false);
            expect(result.affectedGenerators).toEqual([]);
            expect(result.affectedFixtures).toEqual([]);
        });
    });

    describe("global infrastructure changes (without turbo)", () => {
        it("runs everything when packages/ir-sdk/ changes", () => {
            const result = detectAffected(["packages/ir-sdk/src/types.ts"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
            expect(result.affectedGenerators).toEqual([]);
            expect(result.affectedFixtures).toEqual([]);
        });

        it("runs everything when packages/seed/ changes", () => {
            const result = detectAffected(["packages/seed/src/cli.ts"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("runs everything when ir-generator changes", () => {
            const result = detectAffected(["packages/cli/generation/ir-generator/src/index.ts"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("runs everything when generators/base/ changes (fallback mode, no turbo)", () => {
            const result = detectAffected(["generators/base/src/utils.ts"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("runs everything when generators/browser-compatible-base/ changes (fallback mode)", () => {
            const result = detectAffected(["generators/browser-compatible-base/src/index.ts"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("runs everything when workspace loader changes", () => {
            const result = detectAffected(["packages/cli/workspace/loader/src/loadWorkspace.ts"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("runs everything when api-importers change", () => {
            const result = detectAffected(
                ["packages/cli/api-importers/openapi-to-ir/src/converter.ts"],
                ALL_GENERATORS
            );

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("runs everything when fern-definition parsing changes", () => {
            const result = detectAffected(["packages/cli/fern-definition/schema/src/schemas.ts"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("runs everything when configuration package changes", () => {
            const result = detectAffected(["packages/cli/configuration/src/generators-yml.ts"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("runs everything when local-generation changes", () => {
            const result = detectAffected(
                ["packages/cli/generation/local-generation/local-workspace-runner/src/runner.ts"],
                ALL_GENERATORS
            );

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("runs everything when ir-migrations change", () => {
            const result = detectAffected(
                ["packages/cli/generation/ir-migrations/src/migrations/v65-to-v64.ts"],
                ALL_GENERATORS
            );

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("runs everything when source-resolver changes", () => {
            const result = detectAffected(["packages/cli/generation/source-resolver/src/resolver.ts"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("runs everything when protoc-gen-fern changes", () => {
            const result = detectAffected(["packages/cli/generation/protoc-gen-fern/src/index.ts"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });
    });

    describe("fixture detection (test definitions)", () => {
        it("detects changed fixture from test-definitions path", () => {
            const result = detectAffected(["test-definitions/fern/apis/imdb/definition/types.yml"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(false);
            expect(result.affectedFixtures).toEqual(["imdb"]);
        });

        it("detects changed fixture from test-definitions-openapi path", () => {
            const result = detectAffected(
                ["test-definitions-openapi/fern/apis/exhaustive/openapi.yml"],
                ALL_GENERATORS
            );

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(false);
            expect(result.affectedFixtures).toEqual(["exhaustive"]);
        });

        it("detects multiple changed fixtures", () => {
            const result = detectAffected(
                [
                    "test-definitions/fern/apis/imdb/definition/types.yml",
                    "test-definitions/fern/apis/exhaustive/definition/service.yml",
                    "test-definitions-openapi/fern/apis/alias/openapi.yml"
                ],
                ALL_GENERATORS
            );

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.affectedFixtures).toContain("imdb");
            expect(result.affectedFixtures).toContain("exhaustive");
            expect(result.affectedFixtures).toContain("alias");
            expect(result.affectedFixtures).toHaveLength(3);
        });

        it("deduplicates fixture names from multiple files in same fixture", () => {
            const result = detectAffected(
                [
                    "test-definitions/fern/apis/imdb/definition/types.yml",
                    "test-definitions/fern/apis/imdb/definition/service.yml"
                ],
                ALL_GENERATORS
            );

            expect(result.affectedFixtures).toEqual(["imdb"]);
        });

        it("sets allGeneratorsAffected when fixtures change (all generators need changed fixtures)", () => {
            const result = detectAffected(["test-definitions/fern/apis/imdb/definition/types.yml"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.affectedGenerators).toEqual([]);
        });
    });

    describe("generator detection (git diff fallback, no turbo)", () => {
        it("detects python generator source change", () => {
            const result = detectAffected(["generators/python/src/some-file.ts"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(false);
            expect(result.affectedGenerators).toContain("python-sdk");
            expect(result.affectedGenerators).toContain("pydantic");
            expect(result.affectedGenerators).toContain("fastapi");
            expect(result.generatorsWithAllFixtures).toContain("python-sdk");
            expect(result.generatorsWithAllFixtures).toContain("pydantic");
            expect(result.generatorsWithAllFixtures).toContain("fastapi");
        });

        it("detects typescript generator source change", () => {
            const result = detectAffected(["generators/typescript/src/index.ts"], ALL_GENERATORS);

            expect(result.affectedGenerators).toContain("ts-sdk");
        });

        it("detects v2 generator source change affects same workspaces", () => {
            const result = detectAffected(["generators/python-v2/src/generator.ts"], ALL_GENERATORS);

            expect(result.affectedGenerators).toContain("python-sdk");
            expect(result.affectedGenerators).toContain("pydantic");
            expect(result.affectedGenerators).toContain("pydantic-v2");
            expect(result.affectedGenerators).toContain("fastapi");
            // pydantic (non-v2) also maps to python-v2/ in GENERATOR_SOURCE_PATHS
        });

        it("does not include generators not in allGenerators list", () => {
            const limitedGenerators = [createGenerator("python-sdk")];
            const result = detectAffected(["generators/python/src/some-file.ts"], limitedGenerators);

            expect(result.affectedGenerators).toEqual(["python-sdk"]);
            expect(result.affectedGenerators).not.toContain("pydantic");
        });
    });

    describe("seed.yml detection", () => {
        it("detects seed.yml change for a generator", () => {
            const result = detectAffected(["seed/python-sdk/seed.yml"], ALL_GENERATORS);

            expect(result.affectedGenerators).toContain("python-sdk");
            expect(result.generatorsWithAllFixtures).toContain("python-sdk");
        });

        it("skips seed tests when seed.yml changes for unknown generator", () => {
            const result = detectAffected(["seed/unknown-generator/seed.yml"], ALL_GENERATORS);

            // No recognized generators affected, skip all seed tests
            expect(result.allGeneratorsAffected).toBe(false);
            expect(result.allFixturesAffected).toBe(false);
            expect(result.affectedGenerators).toEqual([]);
            expect(result.affectedFixtures).toEqual([]);
        });

        it("detects seed.yml change alongside other changes", () => {
            const result = detectAffected(
                ["seed/python-sdk/seed.yml", "test-definitions/fern/apis/imdb/definition/types.yml"],
                ALL_GENERATORS
            );

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.generatorsWithAllFixtures).toContain("python-sdk");
            expect(result.affectedFixtures).toContain("imdb");
        });
    });

    describe("docker/seed/ Dockerfile detection", () => {
        it("detects Dockerfile.java change affects Java generators", () => {
            const result = detectAffected(["docker/seed/Dockerfile.java"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(false);
            expect(result.affectedGenerators).toContain("java-sdk");
            expect(result.affectedGenerators).toContain("java-model");
            expect(result.generatorsWithAllFixtures).toContain("java-sdk");
            expect(result.generatorsWithAllFixtures).toContain("java-model");
            expect(result.affectedGenerators).not.toContain("ts-sdk");
            expect(result.affectedGenerators).not.toContain("python-sdk");
        });

        it("detects Dockerfile.ts change affects TypeScript generators", () => {
            const result = detectAffected(["docker/seed/Dockerfile.ts"], ALL_GENERATORS);

            expect(result.affectedGenerators).toContain("ts-sdk");
            expect(result.affectedGenerators).not.toContain("java-sdk");
        });

        it("detects Dockerfile.python change affects Python generators", () => {
            const result = detectAffected(["docker/seed/Dockerfile.python"], ALL_GENERATORS);

            expect(result.affectedGenerators).toContain("python-sdk");
            expect(result.affectedGenerators).toContain("pydantic");
            expect(result.affectedGenerators).toContain("fastapi");
        });

        it("detects Dockerfile.go change affects Go generators", () => {
            const result = detectAffected(["docker/seed/Dockerfile.go"], ALL_GENERATORS);

            expect(result.affectedGenerators).toContain("go-sdk");
            expect(result.affectedGenerators).toContain("go-model");
        });

        it("detects Dockerfile.csharp change affects C# generators", () => {
            const result = detectAffected(["docker/seed/Dockerfile.csharp"], ALL_GENERATORS);

            expect(result.affectedGenerators).toContain("csharp-sdk");
            expect(result.affectedGenerators).toContain("csharp-model");
        });

        it("detects Dockerfile.php change affects PHP generators", () => {
            const result = detectAffected(["docker/seed/Dockerfile.php"], ALL_GENERATORS);

            expect(result.affectedGenerators).toContain("php-sdk");
            expect(result.affectedGenerators).toContain("php-model");
        });

        it("detects Dockerfile.dockerignore change runs everything", () => {
            const result = detectAffected(["docker/seed/Dockerfile.dockerignore"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.allFixturesAffected).toBe(true);
        });

        it("ignores unknown files in docker/seed/", () => {
            const result = detectAffected(["docker/seed/README.md"], ALL_GENERATORS);

            expect(result.allGeneratorsAffected).toBe(false);
            expect(result.allFixturesAffected).toBe(false);
            expect(result.affectedGenerators).toEqual([]);
        });
    });

    describe("combined generator + fixture changes (precise union)", () => {
        it("returns precise union: affected generators get all fixtures, others get changed fixtures", () => {
            const result = detectAffected(
                ["generators/python/src/generator.ts", "test-definitions/fern/apis/imdb/definition/types.yml"],
                ALL_GENERATORS
            );

            // allGeneratorsAffected should be true (because fixtures changed)
            expect(result.allGeneratorsAffected).toBe(true);
            // allFixturesAffected should be false (only specific fixtures changed)
            expect(result.allFixturesAffected).toBe(false);
            // python generators should be in generatorsWithAllFixtures
            expect(result.generatorsWithAllFixtures).toContain("python-sdk");
            expect(result.generatorsWithAllFixtures).toContain("pydantic");
            expect(result.generatorsWithAllFixtures).toContain("fastapi");
            // imdb should be in affectedFixtures
            expect(result.affectedFixtures).toContain("imdb");
        });

        it("interface contract: affectedGenerators is empty when allGeneratorsAffected", () => {
            const result = detectAffected(
                ["generators/python/src/generator.ts", "test-definitions/fern/apis/imdb/definition/types.yml"],
                ALL_GENERATORS
            );

            expect(result.allGeneratorsAffected).toBe(true);
            expect(result.affectedGenerators).toEqual([]);
        });

        it("interface contract: affectedFixtures is empty when allFixturesAffected", () => {
            const result = detectAffected(["packages/ir-sdk/src/types.ts"], ALL_GENERATORS);

            expect(result.allFixturesAffected).toBe(true);
            expect(result.affectedFixtures).toEqual([]);
        });
    });
});

describe("resolveAffectedGenerators", () => {
    it("returns all generators when allGeneratorsAffected is true", () => {
        const affected: AffectedResult = {
            allGeneratorsAffected: true,
            allFixturesAffected: false,
            affectedGenerators: [],
            generatorsWithAllFixtures: [],
            affectedFixtures: ["imdb"],
            summary: []
        };

        const result = resolveAffectedGenerators(affected, ALL_GENERATORS);

        expect(result).toHaveLength(ALL_GENERATORS.length);
        expect(result).toEqual(ALL_GENERATORS);
    });

    it("returns only affected generators when allGeneratorsAffected is false", () => {
        const affected: AffectedResult = {
            allGeneratorsAffected: false,
            allFixturesAffected: false,
            affectedGenerators: ["python-sdk", "pydantic"],
            generatorsWithAllFixtures: ["python-sdk", "pydantic"],
            affectedFixtures: [],
            summary: []
        };

        const result = resolveAffectedGenerators(affected, ALL_GENERATORS);

        expect(result).toHaveLength(2);
        expect(result.map((g) => g.workspaceName)).toEqual(["python-sdk", "pydantic"]);
    });

    it("returns empty array when no generators match", () => {
        const affected: AffectedResult = {
            allGeneratorsAffected: false,
            allFixturesAffected: false,
            affectedGenerators: ["nonexistent-generator"],
            generatorsWithAllFixtures: [],
            affectedFixtures: [],
            summary: []
        };

        const result = resolveAffectedGenerators(affected, ALL_GENERATORS);

        expect(result).toHaveLength(0);
    });
});

describe("resolveAffectedFixtures", () => {
    it("returns all fixtures when allFixturesAffected is true", () => {
        const affected: AffectedResult = {
            allGeneratorsAffected: true,
            allFixturesAffected: true,
            affectedGenerators: [],
            generatorsWithAllFixtures: [],
            affectedFixtures: [],
            summary: []
        };

        const result = resolveAffectedFixtures(affected, ALL_FIXTURES);

        expect(result).toEqual(ALL_FIXTURES);
    });

    it("returns all fixtures when generator is in generatorsWithAllFixtures", () => {
        const affected: AffectedResult = {
            allGeneratorsAffected: true,
            allFixturesAffected: false,
            affectedGenerators: [],
            generatorsWithAllFixtures: ["python-sdk"],
            affectedFixtures: ["imdb"],
            summary: []
        };

        const result = resolveAffectedFixtures(affected, ALL_FIXTURES, "python-sdk");

        expect(result).toEqual(ALL_FIXTURES);
    });

    it("returns only affected fixtures for generators NOT in generatorsWithAllFixtures", () => {
        const affected: AffectedResult = {
            allGeneratorsAffected: true,
            allFixturesAffected: false,
            affectedGenerators: [],
            generatorsWithAllFixtures: ["python-sdk"],
            affectedFixtures: ["imdb"],
            summary: []
        };

        const result = resolveAffectedFixtures(affected, ALL_FIXTURES, "ts-sdk");

        expect(result).toEqual(["imdb"]);
    });

    it("returns only affected fixtures when no generatorName is provided", () => {
        const affected: AffectedResult = {
            allGeneratorsAffected: true,
            allFixturesAffected: false,
            affectedGenerators: [],
            generatorsWithAllFixtures: ["python-sdk"],
            affectedFixtures: ["imdb", "exhaustive"],
            summary: []
        };

        const result = resolveAffectedFixtures(affected, ALL_FIXTURES);

        expect(result).toEqual(["imdb", "exhaustive"]);
    });

    it("handles fixture:outputFolder format", () => {
        const affected: AffectedResult = {
            allGeneratorsAffected: true,
            allFixturesAffected: false,
            affectedGenerators: [],
            generatorsWithAllFixtures: [],
            affectedFixtures: ["exhaustive"],
            summary: []
        };

        const fixturesWithOutputFolders = [
            "imdb",
            "exhaustive:no-custom-config",
            "exhaustive:inline-path-params",
            "alias",
            "basic-auth"
        ];

        const result = resolveAffectedFixtures(affected, fixturesWithOutputFolders, "ts-sdk");

        expect(result).toEqual(["exhaustive:no-custom-config", "exhaustive:inline-path-params"]);
    });

    it("returns empty array when no fixtures match", () => {
        const affected: AffectedResult = {
            allGeneratorsAffected: true,
            allFixturesAffected: false,
            affectedGenerators: [],
            generatorsWithAllFixtures: [],
            affectedFixtures: ["nonexistent-fixture"],
            summary: []
        };

        const result = resolveAffectedFixtures(affected, ALL_FIXTURES, "ts-sdk");

        expect(result).toEqual([]);
    });

    describe("precise union scenario (both generators and fixtures change)", () => {
        it("generator whose source changed gets ALL fixtures", () => {
            // Simulates: generators/python/ changed AND test-definitions/fern/apis/imdb/ changed
            const affected: AffectedResult = {
                allGeneratorsAffected: true,
                allFixturesAffected: false,
                affectedGenerators: [],
                generatorsWithAllFixtures: ["python-sdk", "pydantic", "fastapi"],
                affectedFixtures: ["imdb"],
                summary: []
            };

            // python-sdk gets ALL fixtures (source changed)
            const pythonResult = resolveAffectedFixtures(affected, ALL_FIXTURES, "python-sdk");
            expect(pythonResult).toEqual(ALL_FIXTURES);

            // pydantic also gets ALL fixtures (source changed)
            const pydanticResult = resolveAffectedFixtures(affected, ALL_FIXTURES, "pydantic");
            expect(pydanticResult).toEqual(ALL_FIXTURES);
        });

        it("generator whose source did NOT change gets only changed fixtures", () => {
            const affected: AffectedResult = {
                allGeneratorsAffected: true,
                allFixturesAffected: false,
                affectedGenerators: [],
                generatorsWithAllFixtures: ["python-sdk", "pydantic", "fastapi"],
                affectedFixtures: ["imdb"],
                summary: []
            };

            // ts-sdk only gets imdb (source didn't change)
            const tsResult = resolveAffectedFixtures(affected, ALL_FIXTURES, "ts-sdk");
            expect(tsResult).toEqual(["imdb"]);

            // java-sdk only gets imdb (source didn't change)
            const javaResult = resolveAffectedFixtures(affected, ALL_FIXTURES, "java-sdk");
            expect(javaResult).toEqual(["imdb"]);

            // go-sdk only gets imdb (source didn't change)
            const goResult = resolveAffectedFixtures(affected, ALL_FIXTURES, "go-sdk");
            expect(goResult).toEqual(["imdb"]);
        });

        it("demonstrates no full cross-product", () => {
            // This is the key test: when both generators and fixtures change,
            // we should NOT run all generators x all fixtures
            const affected: AffectedResult = {
                allGeneratorsAffected: true,
                allFixturesAffected: false,
                affectedGenerators: [],
                generatorsWithAllFixtures: ["python-sdk"],
                affectedFixtures: ["imdb"],
                summary: []
            };

            let totalTests = 0;
            for (const gen of ALL_GENERATORS) {
                const fixtures = resolveAffectedFixtures(affected, ALL_FIXTURES, gen.workspaceName);
                totalTests += fixtures.length;
            }

            // Full cross-product would be 21 generators * 6 fixtures = 126
            // Precise union: python-sdk gets 6, other 20 generators get 1 each = 26
            const fullCrossProduct = ALL_GENERATORS.length * ALL_FIXTURES.length;
            expect(totalTests).toBeLessThan(fullCrossProduct);
            expect(totalTests).toBe(ALL_FIXTURES.length + (ALL_GENERATORS.length - 1));
        });
    });
});

describe("end-to-end scenario tests", () => {
    it("scenario: only fixture imdb changes", () => {
        const changedFiles = ["test-definitions/fern/apis/imdb/definition/types.yml"];
        const affected = detectAffected(changedFiles, ALL_GENERATORS);

        // All generators should run
        const generators = resolveAffectedGenerators(affected, ALL_GENERATORS);
        expect(generators).toHaveLength(ALL_GENERATORS.length);

        // Each generator should only run imdb
        for (const gen of generators) {
            const fixtures = resolveAffectedFixtures(affected, ALL_FIXTURES, gen.workspaceName);
            expect(fixtures).toEqual(["imdb"]);
        }
    });

    it("scenario: only generator python source changes", () => {
        const changedFiles = ["generators/python/src/generator.ts"];
        const affected = detectAffected(changedFiles, ALL_GENERATORS);

        // Only python generators should run
        const generators = resolveAffectedGenerators(affected, ALL_GENERATORS);
        const names = generators.map((g) => g.workspaceName);
        expect(names).toContain("python-sdk");
        expect(names).toContain("pydantic");
        expect(names).toContain("fastapi");
        expect(names).not.toContain("ts-sdk");

        // Each python generator should run ALL fixtures
        for (const gen of generators) {
            const fixtures = resolveAffectedFixtures(affected, ALL_FIXTURES, gen.workspaceName);
            expect(fixtures).toEqual(ALL_FIXTURES);
        }
    });

    it("scenario: both python source and imdb fixture change", () => {
        const changedFiles = [
            "generators/python/src/generator.ts",
            "test-definitions/fern/apis/imdb/definition/types.yml"
        ];
        const affected = detectAffected(changedFiles, ALL_GENERATORS);

        // ALL generators should run (because fixture changed)
        const generators = resolveAffectedGenerators(affected, ALL_GENERATORS);
        expect(generators).toHaveLength(ALL_GENERATORS.length);

        // Python generators get ALL fixtures
        const pythonFixtures = resolveAffectedFixtures(affected, ALL_FIXTURES, "python-sdk");
        expect(pythonFixtures).toEqual(ALL_FIXTURES);

        // Non-python generators get only imdb
        const tsFixtures = resolveAffectedFixtures(affected, ALL_FIXTURES, "ts-sdk");
        expect(tsFixtures).toEqual(["imdb"]);
    });

    it("scenario: seed.yml change for python-sdk", () => {
        const changedFiles = ["seed/python-sdk/seed.yml"];
        const affected = detectAffected(changedFiles, ALL_GENERATORS);

        // Only python-sdk should run
        const generators = resolveAffectedGenerators(affected, ALL_GENERATORS);
        expect(generators).toHaveLength(1);
        expect(generators[0]?.workspaceName).toBe("python-sdk");

        // python-sdk should run ALL fixtures
        const fixtures = resolveAffectedFixtures(affected, ALL_FIXTURES, "python-sdk");
        expect(fixtures).toEqual(ALL_FIXTURES);
    });

    it("scenario: infrastructure change runs everything", () => {
        const changedFiles = ["packages/ir-sdk/src/types.ts"];
        const affected = detectAffected(changedFiles, ALL_GENERATORS);

        const generators = resolveAffectedGenerators(affected, ALL_GENERATORS);
        expect(generators).toHaveLength(ALL_GENERATORS.length);

        for (const gen of generators) {
            const fixtures = resolveAffectedFixtures(affected, ALL_FIXTURES, gen.workspaceName);
            expect(fixtures).toEqual(ALL_FIXTURES);
        }
    });

    it("scenario: unrelated CLI changes skip all seed tests", () => {
        const changedFiles = [
            "packages/cli/cli/src/commands/check.ts",
            "packages/cli/cli/src/commands/apiCheck.ts",
            "packages/cli/cli/src/cli.ts"
        ];
        const affected = detectAffected(changedFiles, ALL_GENERATORS);

        // No generators should run
        const generators = resolveAffectedGenerators(affected, ALL_GENERATORS);
        expect(generators).toHaveLength(0);

        // No fixtures should be resolved for any generator
        for (const gen of ALL_GENERATORS) {
            const fixtures = resolveAffectedFixtures(affected, ALL_FIXTURES, gen.workspaceName);
            expect(fixtures).toEqual([]);
        }
    });

    it("scenario: mixed unrelated and seed-related changes only runs affected", () => {
        const changedFiles = ["packages/cli/cli/src/commands/check.ts", "generators/python/src/generator.ts"];
        const affected = detectAffected(changedFiles, ALL_GENERATORS);

        // Only python generators should run (CLI changes are ignored)
        const generators = resolveAffectedGenerators(affected, ALL_GENERATORS);
        const names = generators.map((g) => g.workspaceName);
        expect(names).toContain("python-sdk");
        expect(names).toContain("pydantic");
        expect(names).toContain("fastapi");
        expect(names).not.toContain("ts-sdk");
        expect(names).not.toContain("java-sdk");
    });

    it("scenario: docker/seed/Dockerfile.java change runs Java generators with all fixtures", () => {
        const changedFiles = ["docker/seed/Dockerfile.java"];
        const affected = detectAffected(changedFiles, ALL_GENERATORS);

        // Only Java generators should run
        const generators = resolveAffectedGenerators(affected, ALL_GENERATORS);
        const names = generators.map((g) => g.workspaceName);
        expect(names).toContain("java-sdk");
        expect(names).toContain("java-model");
        expect(names).not.toContain("ts-sdk");
        expect(names).not.toContain("python-sdk");

        // Each Java generator should run ALL fixtures
        for (const gen of generators) {
            const fixtures = resolveAffectedFixtures(affected, ALL_FIXTURES, gen.workspaceName);
            expect(fixtures).toEqual(ALL_FIXTURES);
        }
    });

    it("scenario: versions.yml changes are fully ignored for seed detection", () => {
        const changedFiles = [
            "generators/csharp/sdk/versions.yml",
            "generators/csharp/model/versions.yml",
            "generators/python/sdk/versions.yml"
        ];
        const affected = detectAffected(changedFiles, ALL_GENERATORS);

        // No generators should run
        const generators = resolveAffectedGenerators(affected, ALL_GENERATORS);
        expect(generators).toHaveLength(0);

        // No fixtures should be resolved
        for (const gen of ALL_GENERATORS) {
            const fixtures = resolveAffectedFixtures(affected, ALL_FIXTURES, gen.workspaceName);
            expect(fixtures).toEqual([]);
        }
    });
});
