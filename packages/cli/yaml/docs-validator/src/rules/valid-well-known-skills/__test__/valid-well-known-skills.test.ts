import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { validateSkillMarkdown, validateWellKnownSkillsDirectory } from "../valid-well-known-skills.js";

const SKILLS_DIRECTORY = RelativeFilePath.of(".well-known/skills");

describe("validateWellKnownSkillsDirectory", () => {
    let fernFolder: AbsoluteFilePath;

    beforeEach(async () => {
        fernFolder = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-well-known-skills-")));
    });

    afterEach(async () => {
        await rm(fernFolder, { recursive: true, force: true });
    });

    async function writeSkillFile(relativePath: string, contents: string): Promise<void> {
        const absolutePath = path.join(fernFolder, relativePath);
        await mkdir(path.dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, contents);
    }

    it("returns no violations when the directory does not exist", async () => {
        const violations = await validateWellKnownSkillsDirectory({
            absolutePathToFernFolder: fernFolder,
            wellKnownDirectory: SKILLS_DIRECTORY
        });
        expect(violations).toEqual([]);
    });

    it("returns no violations for a valid bundle", async () => {
        await writeSkillFile(".well-known/skills/index.json", JSON.stringify({ skills: [] }));
        await writeSkillFile(
            ".well-known/skills/best-practices/SKILL.md",
            "---\nname: best-practices\ndescription: How to use the API well.\n---\n\n# Best practices\n"
        );

        const violations = await validateWellKnownSkillsDirectory({
            absolutePathToFernFolder: fernFolder,
            wellKnownDirectory: SKILLS_DIRECTORY
        });
        expect(violations).toEqual([]);
    });

    it("reports a missing index.json", async () => {
        await writeSkillFile(
            ".well-known/skills/best-practices/SKILL.md",
            "---\nname: best-practices\ndescription: How to use the API well.\n---\n"
        );

        const violations = await validateWellKnownSkillsDirectory({
            absolutePathToFernFolder: fernFolder,
            wellKnownDirectory: SKILLS_DIRECTORY
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain(".well-known/skills/index.json is missing");
    });

    it("reports an index.json that is not valid JSON", async () => {
        await writeSkillFile(".well-known/skills/index.json", "{ not json");

        const violations = await validateWellKnownSkillsDirectory({
            absolutePathToFernFolder: fernFolder,
            wellKnownDirectory: SKILLS_DIRECTORY
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain(".well-known/skills/index.json is not valid JSON");
    });

    it("reports a skill whose name does not match its directory", async () => {
        await writeSkillFile(".well-known/skills/index.json", JSON.stringify({ skills: [] }));
        await writeSkillFile(
            ".well-known/skills/best-practices/SKILL.md",
            "---\nname: other-name\ndescription: How to use the API well.\n---\n"
        );

        const violations = await validateWellKnownSkillsDirectory({
            absolutePathToFernFolder: fernFolder,
            wellKnownDirectory: SKILLS_DIRECTORY
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain('must match its parent directory "best-practices"');
        expect(violations[0]?.relativeFilepath).toEqual(".well-known/skills/best-practices/SKILL.md");
    });

    it("ignores skill directories without a SKILL.md (e.g. archive layouts)", async () => {
        await writeSkillFile(".well-known/skills/index.json", JSON.stringify({ skills: [] }));
        await writeSkillFile(".well-known/skills/assets/logo.svg", "<svg/>");

        const violations = await validateWellKnownSkillsDirectory({
            absolutePathToFernFolder: fernFolder,
            wellKnownDirectory: SKILLS_DIRECTORY
        });
        expect(violations).toEqual([]);
    });
});

describe("validateSkillMarkdown", () => {
    const relativeFilepath = RelativeFilePath.of(".well-known/skills/my-skill/SKILL.md");

    function validate(contents: string, skillDirectoryName = "my-skill") {
        return validateSkillMarkdown({
            skillDirectoryName,
            skillMarkdownRelativePath: relativeFilepath,
            skillMarkdownContents: contents
        });
    }

    it("accepts valid frontmatter", () => {
        expect(validate("---\nname: my-skill\ndescription: Does things.\n---\nbody")).toEqual([]);
    });

    it("rejects a missing name", () => {
        const violations = validate("---\ndescription: Does things.\n---\n");
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("missing a `name`");
    });

    it("rejects a non-kebab-case name", () => {
        const violations = validate("---\nname: My_Skill\ndescription: Does things.\n---\n", "My_Skill");
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("must be kebab-case");
    });

    it("rejects a name longer than 64 characters", () => {
        const longName = "a".repeat(65);
        const violations = validate(`---\nname: ${longName}\ndescription: Does things.\n---\n`, longName);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("exceeds 64 characters");
    });

    it("rejects a missing description", () => {
        const violations = validate("---\nname: my-skill\n---\n");
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("missing a non-empty `description`");
    });

    it("rejects a description longer than 1024 characters", () => {
        const longDescription = "a".repeat(1025);
        const violations = validate(`---\nname: my-skill\ndescription: ${longDescription}\n---\n`);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("exceeds 1024 characters");
    });

    it("rejects unparseable frontmatter", () => {
        const violations = validate("---\nname: [unclosed\n---\n");
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("Failed to parse frontmatter");
    });
});
