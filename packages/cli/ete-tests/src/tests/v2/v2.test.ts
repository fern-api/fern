import { describe, expect, it } from "vitest";
import { createTempFixture } from "../../utils/createTempFixture.js";
import { runCliV2 } from "../../utils/runCliV2.js";

const VALID_FERN_YML = `edition: 2026-01-01
org: acme

cli:
  version: 3.38.0

api:
  specs:
    - openapi: openapi.yml

sdks:
  autorelease: true
  targets:
    typescript:
      lang: typescript
      version: "1.0.0"
      output:
        path: ./sdks/typescript
`;

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
          description: OK
`;

const INVALID_FERN_YML = `org: 12345`;

describe("fern check", () => {
    it("fern check (success)", async () => {
        const fixture = await createTempFixture({
            "fern.yml": VALID_FERN_YML,
            "openapi.yml": SIMPLE_OPENAPI
        });

        try {
            const result = await runCliV2({
                args: ["check"],
                cwd: fixture.path
            });
            expect(result.stdout).toBe("");
            expect(result.exitCode).toBe(0);
        } finally {
            await fixture.cleanup();
        }
    });

    it("fern check (failure)", async () => {
        const fixture = await createTempFixture({
            "fern.yml": INVALID_FERN_YML
        });

        try {
            const result = await runCliV2({
                args: ["check"],
                cwd: fixture.path,
                expectError: true
            });
            expect(result.exitCode).toBe(1);
            expect(result.stdout).toBe("");
            expect(result.stderr).toContain("fern.yml:1:1: edition is required");
            expect(result.stderr).toContain("fern.yml:1:6: org must be a string");
        } finally {
            await fixture.cleanup();
        }
    });

    it("fern check --api with valid API name", async () => {
        const fixture = await createTempFixture({
            "fern.yml": VALID_FERN_YML,
            "openapi.yml": SIMPLE_OPENAPI
        });

        try {
            const result = await runCliV2({
                args: ["check", "--api", "api"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toBe("");
        } finally {
            await fixture.cleanup();
        }
    });

    it("fern check --api with non-existent API shows available APIs", async () => {
        const fixture = await createTempFixture({
            "fern.yml": VALID_FERN_YML,
            "openapi.yml": SIMPLE_OPENAPI
        });

        try {
            const result = await runCliV2({
                args: ["check", "--api", "nonexistent"],
                cwd: fixture.path,
                expectError: true
            });
            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain("API 'nonexistent' not found");
            expect(result.stderr).toContain("Available APIs:");
            expect(result.stderr).toContain("api");
        } finally {
            await fixture.cleanup();
        }
    });
}, 90_000);
