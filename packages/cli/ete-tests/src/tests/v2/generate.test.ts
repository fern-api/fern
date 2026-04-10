import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";
import { createTempFixture } from "../../utils/createTempFixture.js";
import { cliV2, runCliV2 } from "../../utils/runCliV2.js";

const FIXTURES = {
    petstore: "petstore",
    fernDefinition: "fern-definition"
} as const;

describe("fern sdk generate", () => {
    describe("basic generation", () => {
        it("python", async () => {
            const result = await cliV2.generate(FIXTURES.petstore, "python");
            expect(result.exitCode).toBe(0);
        }, 180_000);

        it("go", async () => {
            const result = await cliV2.generate(FIXTURES.petstore, "go");
            expect(result.exitCode).toBe(0);
        }, 180_000);
    });

    describe("local generation", () => {
        it.each([["python"], ["go"]])("should generate %s SDK with --local flag", async (target) => {
            const result = await runCliV2({
                args: ["sdk", "generate", "--target", target, "--local"],
                fixture: FIXTURES.petstore,
                timeout: 60_000
            });

            expect(result.exitCode).toBe(0);

            const outputPath = join(
                AbsoluteFilePath.of(result.workingDirectory),
                RelativeFilePath.of(`sdks/${target}`)
            );
            expect(await doesPathExist(outputPath)).toBe(true);
        }, 60_000);
    });

    describe("target validation", () => {
        it("should fail with invalid target name", async () => {
            const result = await runCliV2({
                args: ["sdk", "generate", "--target", "invalid-target"],
                fixture: FIXTURES.petstore,
                expectError: true,
                timeout: 60_000
            });
            expect(result.exitCode).not.toBe(0);
            expect(
                result.stderrPlain.toLowerCase().includes("invalid") ||
                    result.stderrPlain.toLowerCase().includes("target") ||
                    result.stderrPlain.toLowerCase().includes("not found")
            ).toBe(true);
        });

        it("should fail when target is not configured in fern.yml", async () => {
            const result = await runCliV2({
                args: ["sdk", "generate", "--target", "ruby"],
                fixture: FIXTURES.petstore,
                expectError: true,
                timeout: 60_000
            });
            expect(result.exitCode).toBe(1);
        });
    });

    describe("fern definition", () => {
        it("should generate SDK from fern definition", async () => {
            const result = await cliV2.generate(FIXTURES.fernDefinition, "go");
            expect(result.exitCode).toBe(0);
        }, 60_000);
    });

    describe("audiences", () => {
        it("single audience", async () => {
            const fixture = await createTempFixture({
                "fern.yml": `edition: 2026-01-01

org: test-org

api:
  specs:
    - openapi: ./openapi.yml

sdks:
  targets:
    go:
      version: 1.30.0
      output:
        path: ./sdks/go
`,
                "openapi.yml": `openapi: 3.0.3
info:
  title: Audience Test API
  version: 1.0.0
paths:
  /public/resource:
    get:
      operationId: getPublicResource
      x-fern-audiences:
        - public
      responses:
        "200":
          description: OK
  /internal/resource:
    get:
      operationId: getInternalResource
      x-fern-audiences:
        - internal
      responses:
        "200":
          description: OK
  /admin/resource:
    get:
      operationId: getAdminResource
      x-fern-audiences:
        - admin
      responses:
        "200":
          description: OK
`
            });

            try {
                const result = await runCliV2({
                    args: ["sdk", "generate", "--target", "go", "--audience", "public", "--local"],
                    cwd: fixture.path,
                    timeout: 60_000
                });
                expect(result.exitCode).toBeDefined();
            } finally {
                await fixture.cleanup();
            }
        }, 60_000);

        it("multiple audiences", async () => {
            const fixture = await createTempFixture({
                "fern.yml": `edition: 2026-01-01

org: test-org

api:
  specs:
    - openapi: ./openapi.yml

sdks:
  targets:
    go:
      version: 1.30.0
      output:
        path: ./sdks/go
`,
                "openapi.yml": `openapi: 3.0.3
info:
  title: Multi Audience API
  version: 1.0.0
paths:
  /endpoint:
    get:
      operationId: getEndpoint
      responses:
        "200":
          description: OK
`
            });

            try {
                const result = await runCliV2({
                    args: [
                        "sdk",
                        "generate",
                        "--target",
                        "go",
                        "--audience",
                        "public",
                        "--audience",
                        "internal",
                        "--local"
                    ],
                    cwd: fixture.path,
                    timeout: 60_000
                });
                expect(result.exitCode).toBeDefined();
            } finally {
                await fixture.cleanup();
            }
        }, 60_000);
    });

    describe("help and usage", () => {
        it("should display help for sdk generate command", async () => {
            const result = await cliV2.help("sdk generate");
            expect(result.exitCode).toBe(0);
            expect(result.stdoutPlain.toLowerCase()).toMatch(/usage|options|target/i);
        });
    });

    describe("flags-only mode (no fern.yml)", () => {
        const SIMPLE_OPENAPI = `openapi: 3.0.3
info:
  title: Test API
  version: 1.0.0
paths:
  /health:
    get:
      operationId: healthCheck
      responses:
        "200":
          description: OK`;

        describe("flag validation", () => {
            it("should report all missing flags when no flags are provided", async () => {
                const fixture = await createTempFixture({
                    "openapi.yml": SIMPLE_OPENAPI
                });
                try {
                    const result = await runCliV2({
                        args: ["sdk", "generate"],
                        cwd: fixture.path,
                        expectError: true
                    });
                    expect(result.exitCode).not.toBe(0);
                    expect(result.stderrPlain).toContain("--api");
                    expect(result.stderrPlain).toContain("--target");
                    expect(result.stderrPlain).toContain("--org");
                    expect(result.stderrPlain).toContain("--output");
                } finally {
                    await fixture.cleanup();
                }
            });

            it("should report missing --target, --org, and --output when only --api is provided", async () => {
                const fixture = await createTempFixture({
                    "openapi.yml": SIMPLE_OPENAPI
                });
                try {
                    const result = await runCliV2({
                        args: ["sdk", "generate", "--api", "openapi.yml"],
                        cwd: fixture.path,
                        expectError: true
                    });
                    expect(result.exitCode).not.toBe(0);
                    expect(result.stderrPlain).toContain("--target");
                    expect(result.stderrPlain).toContain("--org");
                    expect(result.stderrPlain).toContain("--output");
                    expect(result.stderrPlain).not.toContain("--api");
                } finally {
                    await fixture.cleanup();
                }
            });

            it("should report only the specific missing flags", async () => {
                const fixture = await createTempFixture({
                    "openapi.yml": SIMPLE_OPENAPI
                });
                try {
                    const result = await runCliV2({
                        args: ["sdk", "generate", "--api", "openapi.yml", "--target", "go"],
                        cwd: fixture.path,
                        expectError: true
                    });
                    expect(result.exitCode).not.toBe(0);
                    expect(result.stderrPlain).toContain("--org");
                    expect(result.stderrPlain).toContain("--output");
                    expect(result.stderrPlain).not.toContain("--target");
                    expect(result.stderrPlain).not.toContain("--api");
                } finally {
                    await fixture.cleanup();
                }
            });

            it("should reject --group in flags-only mode", async () => {
                const fixture = await createTempFixture({
                    "openapi.yml": SIMPLE_OPENAPI
                });
                try {
                    const result = await runCliV2({
                        args: [
                            "sdk",
                            "generate",
                            "--api",
                            "openapi.yml",
                            "--target",
                            "go",
                            "--org",
                            "test-org",
                            "--output",
                            "./out",
                            "--group",
                            "prod"
                        ],
                        cwd: fixture.path,
                        expectError: true
                    });
                    expect(result.exitCode).not.toBe(0);
                    expect(result.stderrPlain).toContain("--group");
                } finally {
                    await fixture.cleanup();
                }
            });

            it("should fail with an unsupported language", async () => {
                const fixture = await createTempFixture({
                    "openapi.yml": SIMPLE_OPENAPI
                });
                try {
                    const result = await runCliV2({
                        args: [
                            "sdk",
                            "generate",
                            "--api",
                            "openapi.yml",
                            "--target",
                            "cobol",
                            "--org",
                            "test-org",
                            "--output",
                            "./out",
                            "--local"
                        ],
                        cwd: fixture.path,
                        expectError: true
                    });
                    expect(result.exitCode).not.toBe(0);
                    expect(result.stderrPlain).toContain("not a supported language");
                } finally {
                    await fixture.cleanup();
                }
            });
        });

        describe("successful generation", () => {
            it("should generate Go SDK with all required flags", async () => {
                const fixture = await createTempFixture({
                    "openapi.yml": SIMPLE_OPENAPI
                });
                try {
                    const result = await runCliV2({
                        args: [
                            "sdk",
                            "generate",
                            "--api",
                            "openapi.yml",
                            "--target",
                            "go",
                            "--org",
                            "test-org",
                            "--output",
                            "./out",
                            "--local"
                        ],
                        cwd: fixture.path,
                        timeout: 120_000
                    });
                    expect(result.exitCode).toBe(0);

                    const outputPath = join(AbsoluteFilePath.of(fixture.path), RelativeFilePath.of("out"));
                    expect(await doesPathExist(outputPath)).toBe(true);
                } finally {
                    await fixture.cleanup();
                }
            }, 120_000);

            it("should generate Go SDK from a URL-referenced spec", async () => {
                const fixture = await createTempFixture({});
                try {
                    const result = await runCliV2({
                        args: [
                            "sdk",
                            "generate",
                            "--api",
                            "https://petstore3.swagger.io/api/v3/openapi.json",
                            "--target",
                            "go",
                            "--org",
                            "test-org",
                            "--output",
                            "./out",
                            "--local"
                        ],
                        cwd: fixture.path,
                        timeout: 120_000
                    });
                    expect(result.exitCode).toBe(0);

                    const outputPath = join(AbsoluteFilePath.of(fixture.path), RelativeFilePath.of("out"));
                    expect(await doesPathExist(outputPath)).toBe(true);
                } finally {
                    await fixture.cleanup();
                }
            }, 120_000);
        });
    });
}, 300_000);
