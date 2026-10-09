import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { migrateDocsYml } from "../docs-yml/index.js";

describe("migrateDocsYml", () => {
    let projectDir: string;
    let fernDir: string;

    beforeEach(async () => {
        projectDir = join(tmpdir(), `docs-yml-test-${randomUUID()}`);
        fernDir = join(projectDir, "fern");
        await mkdir(fernDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(projectDir, { recursive: true, force: true });
    });

    it("returns found=false when docs.yml does not exist", async () => {
        const result = await migrateDocsYml(AbsoluteFilePath.of(projectDir), AbsoluteFilePath.of(fernDir));
        expect(result.found).toBe(false);
        expect(result.docsRef).toBeUndefined();
    });

    it("returns a $ref pointer when docs.yml exists", async () => {
        await writeFile(join(fernDir, "docs.yml"), "title: My Docs\nnavigation:\n  - page: Home\n");
        const result = await migrateDocsYml(AbsoluteFilePath.of(projectDir), AbsoluteFilePath.of(fernDir));
        expect(result.found).toBe(true);
        expect(result.docsRef).toEqual({ $ref: "./fern/docs.yml" });
    });

    it("returns a $ref pointer even when docs.yml is empty", async () => {
        await writeFile(join(fernDir, "docs.yml"), "");
        const result = await migrateDocsYml(AbsoluteFilePath.of(projectDir), AbsoluteFilePath.of(fernDir));
        expect(result.found).toBe(true);
        expect(result.docsRef).toEqual({ $ref: "./fern/docs.yml" });
    });

    it("returns a $ref pointer when docs.yml contains complex content with $ref references", async () => {
        await writeFile(
            join(fernDir, "docs.yml"),
            'title: My Docs\nnavigation:\n  - section: API\n    contents:\n      - $ref: "./api-ref.yml"\n'
        );
        const result = await migrateDocsYml(AbsoluteFilePath.of(projectDir), AbsoluteFilePath.of(fernDir));
        expect(result.found).toBe(true);
        expect(result.docsRef).toEqual({ $ref: "./fern/docs.yml" });
    });

    it("does not resolve or inline any content from docs.yml", async () => {
        await writeFile(join(fernDir, "docs.yml"), "title: My Docs\n");
        const result = await migrateDocsYml(AbsoluteFilePath.of(projectDir), AbsoluteFilePath.of(fernDir));
        // The result should only contain a $ref pointer, never parsed content
        expect(result.docsRef).toBeDefined();
        expect(result.docsRef).toEqual({ $ref: "./fern/docs.yml" });
        expect(result.docsRef).toBeDefined();
        expect(Object.keys(result.docsRef ?? {})).toEqual(["$ref"]);
    });
});
