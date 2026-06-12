import { discoverDeclaredSkills, validateSkillFrontmatter } from "@fern-api/docs-resolver";
import {
    AbsoluteFilePath,
    dirname,
    doesPathExist,
    join,
    RelativeFilePath,
    relative,
    resolve
} from "@fern-api/fs-utils";
import { readdir, readFile } from "fs/promises";
import grayMatter from "gray-matter";

import { Rule, RuleViolation } from "../../Rule.js";

/**
 * Validates the Agent Skills a docs site publishes for `npx skills add https://<docs-domain>`.
 * Serving is passthrough and never validates, so the CLI validates at check/publish time:
 *
 * - When docs.yml declares `page-actions.options.skills.path`, the declared directory is the
 *   source of truth: every subdirectory containing a `SKILL.md` is one skill, validated by
 *   `discoverDeclaredSkills` (path exists and contains skills, kebab-case `name` matching the
 *   directory, non-empty `description`, unique names, no references escaping a skill's
 *   directory). The CLI generates the discovery manifest at publish time, so a hand-populated
 *   `.well-known/skills/` folder is ignored — flagged here as a warning.
 *
 * - Without a declared path, author-supplied bundles under `.well-known/skills/` (legacy
 *   v0.1.0 layout) and `.well-known/agent-skills/` (current spec layout) are uploaded
 *   verbatim, so each must ship its own `index.json` and valid `<skill-name>/SKILL.md`s.
 */
export const ValidWellKnownSkillsRule: Rule = {
    name: "valid-well-known-skills",
    create: ({ workspace }) => {
        return {
            file: async ({ config }) => {
                const declaredSkillsPath = config.pageActions?.options?.skills?.path;
                if (declaredSkillsPath != null) {
                    return validateDeclaredSkillsPath({
                        absolutePathToFernFolder: workspace.absoluteFilePath,
                        absolutePathToSkillsDirectory: resolve(
                            dirname(workspace.absoluteFilepathToDocsConfig),
                            declaredSkillsPath
                        )
                    });
                }

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

const WELL_KNOWN_SKILLS_DIRECTORY = RelativeFilePath.of(".well-known/skills");
const WELL_KNOWN_AGENT_SKILLS_DIRECTORY = RelativeFilePath.of(".well-known/agent-skills");
const WELL_KNOWN_SKILLS_DIRECTORIES = [WELL_KNOWN_SKILLS_DIRECTORY, WELL_KNOWN_AGENT_SKILLS_DIRECTORY];

export async function validateDeclaredSkillsPath({
    absolutePathToFernFolder,
    absolutePathToSkillsDirectory
}: {
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToSkillsDirectory: AbsoluteFilePath;
}): Promise<RuleViolation[]> {
    const { violations } = await discoverDeclaredSkills({ absolutePathToSkillsDirectory });

    const ruleViolations: RuleViolation[] = violations.map((violation): RuleViolation => {
        if (violation.absoluteFilePath == null) {
            return { severity: violation.severity, message: violation.message };
        }
        const relativeFilepath = relative(absolutePathToFernFolder, violation.absoluteFilePath);
        // files outside the fern folder (e.g. a repo-root ../.agents/skills path) don't have a
        // meaningful workspace-relative path, so name them in the message instead
        if (relativeFilepath.startsWith("..")) {
            return {
                severity: violation.severity,
                message: `${violation.absoluteFilePath}: ${violation.message}`
            };
        }
        return { severity: violation.severity, message: violation.message, relativeFilepath };
    });

    // the declared path wins over a hand-populated .well-known/skills folder
    if (await doesPathExist(join(absolutePathToFernFolder, WELL_KNOWN_SKILLS_DIRECTORY))) {
        ruleViolations.push({
            severity: "warning",
            message:
                `${WELL_KNOWN_SKILLS_DIRECTORY}/ is ignored because page-actions.options.skills.path is declared in docs.yml — ` +
                "the skills bundle is generated from the declared path instead. Remove the folder to silence this warning.",
            relativeFilepath: WELL_KNOWN_SKILLS_DIRECTORY
        });
    }

    return ruleViolations;
}

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

    return validateSkillFrontmatter({ frontmatter, skillDirectoryName }).map(
        (message): RuleViolation => ({
            severity: "error",
            message,
            relativeFilepath: skillMarkdownRelativePath
        })
    );
}
