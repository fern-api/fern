import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FernConfigJsonMigrator } from "../fern-config-json/index.js";

describe("FernConfigJsonMigrator", () => {
    let testDir: string;

    beforeEach(async () => {
        testDir = join(tmpdir(), `fern-config-json-test-${randomUUID()}`);
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("detect returns false when fern.config.json does not exist", async () => {
        const migrator = new FernConfigJsonMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.detect();
        expect(result.found).toBe(false);
    });

    it("detect returns true when fern.config.json exists", async () => {
        await writeFile(join(testDir, "fern.config.json"), JSON.stringify({ organization: "acme", version: "0.44.0" }));
        const migrator = new FernConfigJsonMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.detect();
        expect(result.found).toBe(true);
        expect(result.absoluteFilePath).toBeDefined();
    });

    it("migrate extracts organization from fern.config.json", async () => {
        await writeFile(
            join(testDir, "fern.config.json"),
            JSON.stringify({ organization: "my-org", version: "0.44.0" })
        );
        const migrator = new FernConfigJsonMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();
        expect(result.success).toBe(true);
        expect(result.org).toBe("my-org");
        expect(result.warnings).toEqual([]);
    });

    it("migrate extracts version from fern.config.json", async () => {
        await writeFile(join(testDir, "fern.config.json"), JSON.stringify({ organization: "acme", version: "1.2.3" }));
        const migrator = new FernConfigJsonMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();
        expect(result.success).toBe(true);
        expect(result.cliVersion).toBe("1.2.3");
    });

    it("migrate warns when organization field is missing", async () => {
        await writeFile(join(testDir, "fern.config.json"), JSON.stringify({ version: "0.44.0" }));
        const migrator = new FernConfigJsonMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();
        // Implementation returns success: true with a warning when org is missing
        expect(result.warnings.some((w) => w.message.toLowerCase().includes("organization"))).toBe(true);
    });

    it("migrate returns info warning when fern.config.json is not found", async () => {
        const migrator = new FernConfigJsonMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();
        expect(result.success).toBe(false);
        expect(result.org).toBeUndefined();
    });

    it("migrate handles invalid JSON gracefully", async () => {
        await writeFile(join(testDir, "fern.config.json"), "{ invalid json }");
        const migrator = new FernConfigJsonMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();
        expect(result.success).toBe(false);
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("migrate handles empty file gracefully", async () => {
        await writeFile(join(testDir, "fern.config.json"), "");
        const migrator = new FernConfigJsonMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();
        expect(result.success).toBe(false);
    });

    it("migrate returns absolute file path when file exists", async () => {
        await writeFile(join(testDir, "fern.config.json"), JSON.stringify({ organization: "acme", version: "0.44.0" }));
        const migrator = new FernConfigJsonMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();
        expect(result.absoluteFilePath).toBeDefined();
        expect(result.absoluteFilePath).toContain("fern.config.json");
    });
});
