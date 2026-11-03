import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { actionPrerequisiteSkipReason } from "../wizard";

const tempDirs: string[] = [];

async function tempRepo(): Promise<string> {
    const dir = await mkdtemp(path.join(os.tmpdir(), "fern-wizard-prerequisites-"));
    tempDirs.push(dir);
    return dir;
}

afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("fresh action prerequisites", () => {
    it("skips preview/publish and docs-skill installation when docs.yml is missing", async () => {
        const dir = await tempRepo();

        await expect(actionPrerequisiteSkipReason("publish-docs", dir)).resolves.toBe(
            "Skipped: no docs site. Run `fern init --docs` first."
        );
        await expect(actionPrerequisiteSkipReason("docs-skills", dir)).resolves.toBe(
            "Skipped: no docs site. Run `fern init --docs` first."
        );
    });

    it("allows docs actions when docs.yml exists", async () => {
        const dir = await tempRepo();
        await mkdir(path.join(dir, "fern"), { recursive: true });
        await writeFile(path.join(dir, "fern", "docs.yml"), "instances: []\n");

        await expect(actionPrerequisiteSkipReason("publish-docs", dir)).resolves.toBeUndefined();
        await expect(actionPrerequisiteSkipReason("docs-skills", dir)).resolves.toBeUndefined();
    });

    it("skips SDK generation when the Fern project has been removed", async () => {
        const dir = await tempRepo();

        await expect(actionPrerequisiteSkipReason("generate-sdks", dir)).resolves.toBe(
            "Skipped: no Fern project. Run `fern init` first."
        );

        await mkdir(path.join(dir, "fern"), { recursive: true });
        await writeFile(path.join(dir, "fern", "sdk-config.yml"), "targets: []\n");
        await expect(actionPrerequisiteSkipReason("generate-sdks", dir)).resolves.toBeUndefined();
    });
});
