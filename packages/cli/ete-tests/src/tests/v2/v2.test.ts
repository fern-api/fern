import { describe, expect, it } from "vitest";
import { createTempFixture } from "../../utils/createTempFixture";
import { runCliV2 } from "../../utils/runCliV2";

const VALID_FERN_YML = `edition: 2026-01-01
org: acme

cli:
  version: 3.38.0

sdks:
  autorelease: true
  targets:
    typescript:
      lang: typescript
      version: "1.0.0"
      output:
        path: ./sdks/typescript
`;

const INVALID_FERN_YML = `org: 12345`;

describe("fern check", () => {
    it("fern check (success)", async () => {
        const fixture = await createTempFixture({
            "fern.yml": VALID_FERN_YML
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
}, 90_000);
