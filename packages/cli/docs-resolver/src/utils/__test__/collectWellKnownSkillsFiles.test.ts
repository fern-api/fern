import { AbsoluteFilePath, relative } from "@fern-api/fs-utils";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { collectWellKnownSkillsFiles } from "../collectWellKnownSkillsFiles.js";

describe("collectWellKnownSkillsFiles", () => {
    let fernFolder: AbsoluteFilePath;

    beforeEach(async () => {
        fernFolder = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-well-known-")));
    });

    afterEach(async () => {
        await rm(fernFolder, { recursive: true, force: true });
    });

    async function writeFileAt(relativePath: string): Promise<void> {
        const absolutePath = path.join(fernFolder, relativePath);
        await mkdir(path.dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, "contents");
    }

    it("returns an empty list when no well-known skills directories exist", async () => {
        const files = await collectWellKnownSkillsFiles({ absolutePathToFernFolder: fernFolder });
        expect(files).toEqual([]);
    });

    it("collects all files under .well-known/skills and .well-known/agent-skills recursively", async () => {
        await writeFileAt(".well-known/skills/index.json");
        await writeFileAt(".well-known/skills/best-practices/SKILL.md");
        await writeFileAt(".well-known/skills/best-practices/references/api.md");
        await writeFileAt(".well-known/agent-skills/index.json");
        await writeFileAt("pages/getting-started.mdx");

        const files = await collectWellKnownSkillsFiles({ absolutePathToFernFolder: fernFolder });
        const relativePaths = files.map((file) => relative(fernFolder, file)).sort();

        expect(relativePaths).toEqual([
            ".well-known/agent-skills/index.json",
            ".well-known/skills/best-practices/SKILL.md",
            ".well-known/skills/best-practices/references/api.md",
            ".well-known/skills/index.json"
        ]);
    });
});
