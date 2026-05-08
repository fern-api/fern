import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DocsChecker } from "../docs/checker/DocsChecker.js";
import { DocsFixer } from "../docs/fixer/DocsFixer.js";
import type { Workspace } from "../workspace/Workspace.js";
import { createTestContext } from "./utils/createTestContext.js";

describe("DocsFixer", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-docs-fixer-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("fixes invalid instance URL with dot suggestion", async () => {
        const fernYmlPath = join(testDir, "fern.yml");
        await writeFile(
            fernYmlPath,
            `edition: 2026-01-01
org: acme
docs:
  instances:
    - url: my.example.docs.buildwithfern.com
`
        );

        const workspace: Workspace = {
            absoluteFilePath: AbsoluteFilePath.of(fernYmlPath),
            apis: {},
            cliVersion: "1.0.0",
            org: "acme"
        };

        const context = await createTestContext({ cwd: testDir });

        const violations: DocsChecker.ResolvedViolation[] = [
            {
                severity: "fatal",
                relativeFilepath: "fern.yml" as never,
                nodePath: [],
                message:
                    'instances[0].url: Invalid instance URL "my.example.docs.buildwithfern.com": Subdomain "my.example" contains a \'.\' character, which is not allowed. Suggestion: my-example.docs.buildwithfern.com',
                displayRelativeFilepath: "fern.yml",
                line: 5,
                column: 1
            }
        ];

        const fixer = new DocsFixer({ context });
        const result = await fixer.fix({ workspace, violations });

        expect(result.fixedCount).toBe(1);
        expect(result.fixes[0]?.oldValue).toBe("my.example.docs.buildwithfern.com");
        expect(result.fixes[0]?.newValue).toBe("my-example.docs.buildwithfern.com");

        const updatedContent = await readFile(fernYmlPath, "utf-8");
        expect(updatedContent).toContain("my-example.docs.buildwithfern.com");
        expect(updatedContent).not.toContain("my.example.docs.buildwithfern.com");
    });

    it("skips violations without a suggestion", async () => {
        const fernYmlPath = join(testDir, "fern.yml");
        await writeFile(
            fernYmlPath,
            `edition: 2026-01-01
org: acme
docs:
  instances:
    - url: bad--domain.docs.buildwithfern.com
`
        );

        const workspace: Workspace = {
            absoluteFilePath: AbsoluteFilePath.of(fernYmlPath),
            apis: {},
            cliVersion: "1.0.0",
            org: "acme"
        };

        const context = await createTestContext({ cwd: testDir });

        const violations: DocsChecker.ResolvedViolation[] = [
            {
                severity: "fatal",
                relativeFilepath: "fern.yml" as never,
                nodePath: [],
                message:
                    'instances[0].url: Invalid instance URL "bad--domain.docs.buildwithfern.com": some error without suggestion',
                displayRelativeFilepath: "fern.yml",
                line: 5,
                column: 1
            }
        ];

        const fixer = new DocsFixer({ context });
        const result = await fixer.fix({ workspace, violations });

        expect(result.fixedCount).toBe(0);
    });

    it("returns empty result when no fern.yml path", async () => {
        const context = await createTestContext({ cwd: testDir });
        const workspace: Workspace = {
            apis: {},
            cliVersion: "1.0.0",
            org: "acme"
        };

        const fixer = new DocsFixer({ context });
        const result = await fixer.fix({ workspace, violations: [] });

        expect(result.fixedCount).toBe(0);
        expect(result.fixes).toHaveLength(0);
    });
});
