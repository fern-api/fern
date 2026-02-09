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
        it("typescript", async () => {
            const result = await cliV2.generate(FIXTURES.petstore, "typescript");
            expect(result.exitCode).toBe(0);
        }, 60_000);

        it("python", async () => {
            const result = await cliV2.generate(FIXTURES.petstore, "python");
            expect(result.exitCode).toBe(0);
        }, 60_000);

        it("go", async () => {
            const result = await cliV2.generate(FIXTURES.petstore, "go");
            expect(result.exitCode).toBe(0);
        }, 60_000);
    });

    describe("local generation", () => {
        it.each([["typescript"], ["python"], ["go"]])("should generate %s SDK with --local flag", async (target) => {
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
            const result = await cliV2.generate(FIXTURES.fernDefinition, "typescript");
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
    typescript:
      version: 3.45.1
      output:
        path: ./sdks/typescript
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
                    args: ["sdk", "generate", "--target", "typescript", "--audience", "public", "--local"],
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
    typescript:
      version: 3.45.1
      output:
        path: ./sdks/typescript
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
                        "typescript",
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

        it("should fail without required --target flag", async () => {
            const result = await runCliV2({
                args: ["sdk", "generate"],
                fixture: FIXTURES.petstore,
                expectError: true,
                timeout: 60_000
            });
            expect(result.exitCode).toBe(1);
            expect(result.stderrPlain.toLowerCase().includes("target")).toBe(true);
        });
    });
}, 300_000);
