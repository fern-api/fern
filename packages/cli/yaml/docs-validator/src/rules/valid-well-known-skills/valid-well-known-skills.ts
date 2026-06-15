import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readdir, readFile } from "fs/promises";
import grayMatter from "gray-matter";

import { Rule, RuleViolation } from "../../Rule.js";

/**
 * Validates author-supplied Agent Skills bundles placed under `.well-known/skills/` (legacy
 * v0.1.0 layout) or `.well-known/agent-skills/` (current spec layout) in the docs folder.
 * These files are uploaded verbatim and served by the docs site so that
 * `npx skills add https://<docs-domain>` works; serving is passthrough and never validates,
 * so the CLI validates the bundle at upload time instead:
 *
 * - an `index.json` discovery manifest must exist at the root of the directory and parse as JSON
 * - each `<skill-name>/SKILL.md` must have frontmatter with a kebab-case `name` (max 64
 *   characters) matching its parent directory, and a non-empty `description` (max 1024 characters)
 */
export const ValidWellKnownSkillsRule: Rule = {
    name: "valid-well-known-skills",
    create: ({ workspace }) => {
        return {
            file: async () => {
                const violations: RuleViolation[] = [];
                for (const wellKnownDirectory of WELL_KNOWN_SKILLS_DIRECTORIES) {
                    violations.push(
                        ...(await validateWellKnownSkillsDirectory({
                            absolutePathToFernFolder: workspace.absoluteFilePath,
                            wellKnownDirectory
                        }))
                    );
                }
                return violations;
            }
        };
    }
};

const WELL_KNOWN_SKILLS_DIRECTORIES = [
    RelativeFilePath.of(".well-known/skills"),
    RelativeFilePath.of(".well-known/agent-skills")
];

const MAX_SKILL_NAME_LENGTH = 64;
const MAX_SKILL_DESCRIPTION_LENGTH = 1024;
const KEBAB_CASE_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function validateWellKnownSkillsDirectory({
    absolutePathToFernFolder,
    wellKnownDirectory
}: {
    absolutePathToFernFolder: AbsoluteFilePath;
    wellKnownDirectory: RelativeFilePath;
}): Promise<RuleViolation[]> {
    const absoluteDirectory = join(absolutePathToFernFolder, wellKnownDirectory);
    if (!(await doesPathExist(absoluteDirectory))) {
        return [];
    }

    const violations: RuleViolation[] = [];

    const indexJsonPath = join(absoluteDirectory, RelativeFilePath.of("index.json"));
    if (!(await doesPathExist(indexJsonPath))) {
        violations.push({
            severity: "error",
            message:
                `${wellKnownDirectory}/index.json is missing. ` +
                "Agent Skills are discovered via this manifest, so without it " +
                "`npx skills add` cannot install the skills in this directory.",
            relativeFilepath: RelativeFilePath.of(`${wellKnownDirectory}/index.json`)
        });
    } else {
        try {
            JSON.parse(await readFile(indexJsonPath, "utf-8"));
        } catch (error) {
            violations.push({
                severity: "error",
                message: `${wellKnownDirectory}/index.json is not valid JSON: ${
                    error instanceof Error ? error.message : String(error)
                }`,
                relativeFilepath: RelativeFilePath.of(`${wellKnownDirectory}/index.json`)
            });
        }
    }

    const entries = await readdir(absoluteDirectory, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }
        const skillMarkdownRelativePath = RelativeFilePath.of(`${wellKnownDirectory}/${entry.name}/SKILL.md`);
        const skillMarkdownPath = join(
            absoluteDirectory,
            RelativeFilePath.of(entry.name),
            RelativeFilePath.of("SKILL.md")
        );
        if (!(await doesPathExist(skillMarkdownPath))) {
            continue;
        }
        violations.push(
            ...validateSkillMarkdown({
                skillDirectoryName: entry.name,
                skillMarkdownRelativePath,
                skillMarkdownContents: await readFile(skillMarkdownPath, "utf-8")
            })
        );
    }

    return violations;
}

export function validateSkillMarkdown({
    skillDirectoryName,
    skillMarkdownRelativePath,
    skillMarkdownContents
}: {
    skillDirectoryName: string;
    skillMarkdownRelativePath: RelativeFilePath;
    skillMarkdownContents: string;
}): RuleViolation[] {
    let frontmatter: Record<string, unknown>;
    try {
        frontmatter = grayMatter(skillMarkdownContents).data;
    } catch (error) {
        return [
            {
                severity: "error",
                message: `Failed to parse frontmatter: ${error instanceof Error ? error.message : String(error)}`,
                relativeFilepath: skillMarkdownRelativePath
            }
        ];
    }

    const violations: RuleViolation[] = [];

    const name = frontmatter.name;
    if (typeof name !== "string" || name.length === 0) {
        violations.push({
            severity: "error",
            message: "SKILL.md frontmatter is missing a `name`.",
            relativeFilepath: skillMarkdownRelativePath
        });
    } else {
        if (!KEBAB_CASE_REGEX.test(name)) {
            violations.push({
                severity: "error",
                message: `Skill name "${name}" must be kebab-case (lowercase letters, numbers, and hyphens).`,
                relativeFilepath: skillMarkdownRelativePath
            });
        }
        if (name.length > MAX_SKILL_NAME_LENGTH) {
            violations.push({
                severity: "error",
                message: `Skill name "${name}" exceeds ${MAX_SKILL_NAME_LENGTH} characters.`,
                relativeFilepath: skillMarkdownRelativePath
            });
        }
        if (name !== skillDirectoryName) {
            violations.push({
                severity: "error",
                message: `Skill name "${name}" must match its parent directory "${skillDirectoryName}".`,
                relativeFilepath: skillMarkdownRelativePath
            });
        }
    }

    const description = frontmatter.description;
    if (typeof description !== "string" || description.trim().length === 0) {
        violations.push({
            severity: "error",
            message: "SKILL.md frontmatter is missing a non-empty `description`.",
            relativeFilepath: skillMarkdownRelativePath
        });
    } else if (description.length > MAX_SKILL_DESCRIPTION_LENGTH) {
        violations.push({
            severity: "error",
            message: `Skill description exceeds ${MAX_SKILL_DESCRIPTION_LENGTH} characters.`,
            relativeFilepath: skillMarkdownRelativePath
        });
    }

    return violations;
}
