import { AbsoluteFilePath, relative } from "@fern-api/fs-utils";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { discoverDeclaredSkills, generateSkillsIndexManifest } from "../declaredSkills.js";

describe("discoverDeclaredSkills", () => {
    let skillsDirectory: AbsoluteFilePath;

    beforeEach(async () => {
        skillsDirectory = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-declared-skills-")));
    });

    afterEach(async () => {
        await rm(skillsDirectory, { recursive: true, force: true });
    });

    async function writeFileAt(relativePath: string, contents = "contents"): Promise<void> {
        const absolutePath = path.join(skillsDirectory, relativePath);
        await mkdir(path.dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, contents);
    }

    function skillMarkdown(name: string, body = "# Skill\n"): string {
        return `---\nname: ${name}\ndescription: Does ${name} things.\n---\n\n${body}`;
    }

    it("discovers multiple skills with reference files and builds the manifest", async () => {
        await writeFileAt(
            "best-practices/SKILL.md",
            skillMarkdown("best-practices", "See [the API reference](references/api.md).\n")
        );
        await writeFileAt("best-practices/references/api.md", "# API\n");
        await writeFileAt("upgrade-guide/SKILL.md", skillMarkdown("upgrade-guide"));

        const { skills, violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: skillsDirectory });

        expect(violations).toEqual([]);
        expect(skills.map((skill) => skill.name)).toEqual(["best-practices", "upgrade-guide"]);
        expect(skills[0]?.files.map((file) => String(file.relativeFilePathInSkill))).toEqual([
            "SKILL.md",
            "references/api.md"
        ]);

        expect(JSON.parse(generateSkillsIndexManifest(skills))).toEqual({
            skills: [
                {
                    name: "best-practices",
                    description: "Does best-practices things.",
                    files: ["SKILL.md", "references/api.md"]
                },
                {
                    name: "upgrade-guide",
                    description: "Does upgrade-guide things.",
                    files: ["SKILL.md"]
                }
            ]
        });
    });

    it("discovers a single skill", async () => {
        await writeFileAt("my-skill/SKILL.md", skillMarkdown("my-skill"));

        const { skills, violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: skillsDirectory });

        expect(violations).toEqual([]);
        expect(skills).toHaveLength(1);
        expect(skills[0]?.name).toEqual("my-skill");
        expect(skills[0]?.description).toEqual("Does my-skill things.");
    });

    it("discovers skills nested under grouping directories", async () => {
        await writeFileAt("group-a/my-skill/SKILL.md", skillMarkdown("my-skill"));

        const { skills, violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: skillsDirectory });

        expect(violations).toEqual([]);
        expect(skills.map((skill) => skill.name)).toEqual(["my-skill"]);
    });

    it("errors when the declared path does not exist", async () => {
        const missing = AbsoluteFilePath.of(path.join(skillsDirectory, "does-not-exist"));
        const { skills, violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: missing });

        expect(skills).toEqual([]);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toEqual("error");
        expect(violations[0]?.message).toContain("does not exist");
    });

    it("errors when the declared path contains no skills", async () => {
        await writeFileAt("notes.md", "# Not a skill\n");

        const { skills, violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: skillsDirectory });

        expect(skills).toEqual([]);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toEqual("error");
        expect(violations[0]?.message).toContain("No skills found");
    });

    it("errors when the frontmatter name does not match the directory name", async () => {
        await writeFileAt("my-skill/SKILL.md", skillMarkdown("other-name"));

        const { skills, violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: skillsDirectory });

        expect(skills).toEqual([]);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain('must match its parent directory "my-skill"');
        expect(violations[0]?.absoluteFilePath).toEqual(path.join(skillsDirectory, "my-skill/SKILL.md"));
    });

    it("errors on a non-kebab-case name and an empty description", async () => {
        await writeFileAt("My_Skill/SKILL.md", "---\nname: My_Skill\ndescription: ''\n---\n");

        const { violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: skillsDirectory });

        expect(violations.map((violation) => violation.message)).toEqual([
            'Skill name "My_Skill" must be kebab-case (lowercase letters, numbers, and hyphens).',
            "SKILL.md frontmatter is missing a non-empty `description`."
        ]);
    });

    it("errors on duplicate skill names across grouping directories", async () => {
        await writeFileAt("group-a/my-skill/SKILL.md", skillMarkdown("my-skill"));
        await writeFileAt("group-b/my-skill/SKILL.md", skillMarkdown("my-skill"));

        const { violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: skillsDirectory });

        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toEqual("error");
        expect(violations[0]?.message).toContain('Duplicate skill name "my-skill"');
    });

    it("errors when a markdown reference escapes the skill's directory", async () => {
        await writeFileAt("my-skill/SKILL.md", skillMarkdown("my-skill", "See [shared notes](../shared/notes.md).\n"));
        await writeFileAt("shared/notes.md", "# Shared\n");

        const { skills, violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: skillsDirectory });

        expect(skills).toEqual([]);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain('Reference "../shared/notes.md" escapes the skill\'s directory');
    });

    it("allows external, site-absolute, anchor, and within-skill references", async () => {
        await writeFileAt(
            "my-skill/SKILL.md",
            skillMarkdown(
                "my-skill",
                [
                    "[external](https://example.com/docs)",
                    "[mail](mailto:support@example.com)",
                    "[site absolute](/docs/page)",
                    "[anchor](#section)",
                    "[within](references/api.md#section)",
                    "![image](assets/diagram.png)"
                ].join("\n")
            )
        );
        await writeFileAt("my-skill/references/api.md", "# API\n");
        await writeFileAt("my-skill/assets/diagram.png", "png");

        const { violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: skillsDirectory });

        expect(violations).toEqual([]);
    });

    it("checks references in every markdown file of the skill, not just SKILL.md", async () => {
        await writeFileAt("my-skill/SKILL.md", skillMarkdown("my-skill"));
        await writeFileAt("my-skill/references/api.md", "[escape](../../outside.md)\n");

        const { violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: skillsDirectory });

        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("escapes the skill's directory");
        expect(relative(skillsDirectory, violations[0]?.absoluteFilePath ?? AbsoluteFilePath.of("/unset"))).toEqual(
            "my-skill/references/api.md"
        );
    });

    it("does not treat files inside a skill as nested skills", async () => {
        await writeFileAt("my-skill/SKILL.md", skillMarkdown("my-skill"));
        await writeFileAt("my-skill/examples/SKILL.md", "not frontmatter");

        const { skills, violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory: skillsDirectory });

        expect(violations).toEqual([]);
        expect(skills.map((skill) => skill.name)).toEqual(["my-skill"]);
        expect(skills[0]?.files.map((file) => String(file.relativeFilePathInSkill))).toEqual([
            "SKILL.md",
            "examples/SKILL.md"
        ]);
    });
});
