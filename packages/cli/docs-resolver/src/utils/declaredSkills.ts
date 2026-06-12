import {
    AbsoluteFilePath,
    basename,
    dirname,
    doesPathExist,
    getAllFilesInDirectory,
    join,
    RelativeFilePath,
    relative,
    resolve
} from "@fern-api/fs-utils";
import { readdir, readFile } from "fs/promises";
import grayMatter from "gray-matter";

/**
 * Upload destination for agent skills declared via `page-actions.options.skills.path` in
 * docs.yml. Every discovered file is re-homed here in the publish payload — regardless of
 * where it lives in the repo — so the docs site serves it at `/.well-known/skills/…` and
 * `npx skills add https://<docs-domain>` works. Nothing is written back to the repo.
 */
export const DECLARED_SKILLS_UPLOAD_DIRECTORY = RelativeFilePath.of(".well-known/skills");

export const MAX_SKILL_NAME_LENGTH = 64;
export const MAX_SKILL_DESCRIPTION_LENGTH = 1024;
export const SKILL_NAME_KEBAB_CASE_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const SKILL_MARKDOWN_FILENAME = "SKILL.md";
const MARKDOWN_FILE_EXTENSIONS = [".md", ".mdx"];
/** Matches markdown link and image targets: `[text](target)` and `![alt](target)`. */
const MARKDOWN_LINK_TARGET_REGEX = /!?\[[^\]]*\]\(\s*<?([^()<>\s]+)>?\s*(?:"[^"]*")?\)/g;

export interface DeclaredSkillFile {
    absoluteFilePath: AbsoluteFilePath;
    /** Path of the file within its skill directory, e.g. `SKILL.md` or `references/api.md`. */
    relativeFilePathInSkill: RelativeFilePath;
}

export interface DeclaredSkill {
    /** The skill identifier — frontmatter `name`, always equal to the directory name. */
    name: string;
    /** Frontmatter `description`. */
    description: string;
    absoluteDirectory: AbsoluteFilePath;
    /** Every file in the skill directory, SKILL.md first. */
    files: DeclaredSkillFile[];
}

export interface DeclaredSkillsViolation {
    severity: "error" | "warning";
    message: string;
    /** The file the violation refers to, when there is one. */
    absoluteFilePath: AbsoluteFilePath | undefined;
}

export interface DiscoveredDeclaredSkills {
    skills: DeclaredSkill[];
    violations: DeclaredSkillsViolation[];
}

/**
 * Discovers and validates agent skills under a directory declared via
 * `page-actions.options.skills.path` in docs.yml. Every subdirectory containing a `SKILL.md`
 * is one skill; frontmatter `name` + `description` are its metadata. Validation failures are
 * returned as violations (severity `error` blocks publishing via the
 * `valid-well-known-skills` rule and `DocsDefinitionResolver`):
 *
 * - the declared path must exist and contain at least one skill
 * - frontmatter `name` must be kebab-case (max 64 characters) and match the skill's directory name
 * - frontmatter `description` must be non-empty (max 1024 characters)
 * - skill names must be unique across the directory
 * - markdown references must not escape the skill's directory (`../`), since installed
 *   bundles only contain the files under `.well-known/skills/<name>/…`
 */
export async function discoverDeclaredSkills({
    absolutePathToSkillsDirectory
}: {
    absolutePathToSkillsDirectory: AbsoluteFilePath;
}): Promise<DiscoveredDeclaredSkills> {
    if (!(await doesPathExist(absolutePathToSkillsDirectory))) {
        return {
            skills: [],
            violations: [
                {
                    severity: "error",
                    message:
                        `Skills path "${absolutePathToSkillsDirectory}" does not exist. ` +
                        "page-actions.options.skills.path must point to a directory of agent skills in this repo.",
                    absoluteFilePath: undefined
                }
            ]
        };
    }

    const skillDirectories = await findSkillDirectories(absolutePathToSkillsDirectory);
    if (skillDirectories.length === 0) {
        return {
            skills: [],
            violations: [
                {
                    severity: "error",
                    message:
                        `No skills found under "${absolutePathToSkillsDirectory}". ` +
                        "Every subdirectory containing a SKILL.md is published as one skill.",
                    absoluteFilePath: undefined
                }
            ]
        };
    }

    const skills: DeclaredSkill[] = [];
    const violations: DeclaredSkillsViolation[] = [];
    for (const skillDirectory of skillDirectories) {
        const { skill, violations: skillViolations } = await loadSkill(skillDirectory);
        violations.push(...skillViolations);
        if (skill != null) {
            skills.push(skill);
        }
    }

    const seenNames = new Set<string>();
    for (const skill of skills) {
        if (seenNames.has(skill.name)) {
            violations.push({
                severity: "error",
                message:
                    `Duplicate skill name "${skill.name}". ` +
                    "Skill names must be unique — each is served at .well-known/skills/<name>/.",
                absoluteFilePath: join(skill.absoluteDirectory, RelativeFilePath.of(SKILL_MARKDOWN_FILENAME))
            });
        }
        seenNames.add(skill.name);
    }

    return { skills, violations };
}

/**
 * Renders the `.well-known/skills/index.json` discovery manifest (v0.1.0 layout — the format
 * served by Stripe and consumed by `npx skills add`): `{ skills: [{ name, description, files }] }`.
 */
export function generateSkillsIndexManifest(skills: DeclaredSkill[]): string {
    return JSON.stringify(
        {
            skills: skills.map((skill) => ({
                name: skill.name,
                description: skill.description,
                files: skill.files.map((file) => String(file.relativeFilePathInSkill))
            }))
        },
        undefined,
        2
    );
}

/**
 * Finds every directory under `directory` (recursively) that contains a SKILL.md. A skill
 * directory owns everything beneath it, so the walk does not descend into one looking for
 * nested skills.
 */
async function findSkillDirectories(directory: AbsoluteFilePath): Promise<AbsoluteFilePath[]> {
    const skillDirectories: AbsoluteFilePath[] = [];
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }
        const subdirectory = join(directory, RelativeFilePath.of(entry.name));
        if (await doesPathExist(join(subdirectory, RelativeFilePath.of(SKILL_MARKDOWN_FILENAME)))) {
            skillDirectories.push(subdirectory);
        } else {
            skillDirectories.push(...(await findSkillDirectories(subdirectory)));
        }
    }
    return skillDirectories.sort();
}

async function loadSkill(
    skillDirectory: AbsoluteFilePath
): Promise<{ skill: DeclaredSkill | undefined; violations: DeclaredSkillsViolation[] }> {
    const skillMarkdownPath = join(skillDirectory, RelativeFilePath.of(SKILL_MARKDOWN_FILENAME));
    const violations: DeclaredSkillsViolation[] = [];

    let frontmatter: Record<string, unknown>;
    try {
        frontmatter = grayMatter(await readFile(skillMarkdownPath, "utf-8")).data;
    } catch (error) {
        return {
            skill: undefined,
            violations: [
                {
                    severity: "error",
                    message: `Failed to parse frontmatter: ${error instanceof Error ? error.message : String(error)}`,
                    absoluteFilePath: skillMarkdownPath
                }
            ]
        };
    }

    violations.push(
        ...validateSkillFrontmatter({ frontmatter, skillDirectoryName: basename(skillDirectory) }).map(
            (message): DeclaredSkillsViolation => ({
                severity: "error",
                message,
                absoluteFilePath: skillMarkdownPath
            })
        )
    );

    const files = await collectSkillFiles(skillDirectory);
    violations.push(...(await findReferencesEscapingSkillDirectory({ skillDirectory, files })));

    if (violations.some((violation) => violation.severity === "error")) {
        return { skill: undefined, violations };
    }

    return {
        skill: {
            // frontmatter `name` is validated above to be a non-empty string matching the directory
            name: basename(skillDirectory),
            description: typeof frontmatter.description === "string" ? frontmatter.description : "",
            absoluteDirectory: skillDirectory,
            files
        },
        violations
    };
}

/**
 * Validates SKILL.md frontmatter for a skill directory, returning human-readable error
 * messages. Shared by declared-path discovery and the `valid-well-known-skills` rule's
 * raw `.well-known/` passthrough validation so the two cannot drift.
 */
export function validateSkillFrontmatter({
    frontmatter,
    skillDirectoryName
}: {
    frontmatter: Record<string, unknown>;
    skillDirectoryName: string;
}): string[] {
    const messages: string[] = [];

    const name = frontmatter.name;
    if (typeof name !== "string" || name.length === 0) {
        messages.push("SKILL.md frontmatter is missing a `name`.");
    } else {
        if (!SKILL_NAME_KEBAB_CASE_REGEX.test(name)) {
            messages.push(`Skill name "${name}" must be kebab-case (lowercase letters, numbers, and hyphens).`);
        }
        if (name.length > MAX_SKILL_NAME_LENGTH) {
            messages.push(`Skill name "${name}" exceeds ${MAX_SKILL_NAME_LENGTH} characters.`);
        }
        if (name !== skillDirectoryName) {
            messages.push(`Skill name "${name}" must match its parent directory "${skillDirectoryName}".`);
        }
    }

    const description = frontmatter.description;
    if (typeof description !== "string" || description.trim().length === 0) {
        messages.push("SKILL.md frontmatter is missing a non-empty `description`.");
    } else if (description.length > MAX_SKILL_DESCRIPTION_LENGTH) {
        messages.push(`Skill description exceeds ${MAX_SKILL_DESCRIPTION_LENGTH} characters.`);
    }

    return messages;
}

async function collectSkillFiles(skillDirectory: AbsoluteFilePath): Promise<DeclaredSkillFile[]> {
    const files = (await getAllFilesInDirectory(skillDirectory)).map(
        (absoluteFilePath): DeclaredSkillFile => ({
            absoluteFilePath: AbsoluteFilePath.of(absoluteFilePath),
            relativeFilePathInSkill: relative(skillDirectory, AbsoluteFilePath.of(absoluteFilePath))
        })
    );
    // SKILL.md first (manifest convention), then the rest alphabetically
    return files.sort((a, b) => {
        if (a.relativeFilePathInSkill === SKILL_MARKDOWN_FILENAME) {
            return -1;
        }
        if (b.relativeFilePathInSkill === SKILL_MARKDOWN_FILENAME) {
            return 1;
        }
        return a.relativeFilePathInSkill < b.relativeFilePathInSkill ? -1 : 1;
    });
}

/**
 * Flags markdown references that resolve outside the skill's directory. An installed bundle
 * only contains the files under `.well-known/skills/<name>/…`, so a `../` reference would
 * dangle for everyone who installs the skill.
 */
async function findReferencesEscapingSkillDirectory({
    skillDirectory,
    files
}: {
    skillDirectory: AbsoluteFilePath;
    files: DeclaredSkillFile[];
}): Promise<DeclaredSkillsViolation[]> {
    const violations: DeclaredSkillsViolation[] = [];
    for (const file of files) {
        if (!MARKDOWN_FILE_EXTENSIONS.some((extension) => file.absoluteFilePath.endsWith(extension))) {
            continue;
        }
        const contents = await readFile(file.absoluteFilePath, "utf-8");
        for (const target of extractRelativeMarkdownReferences(contents)) {
            const resolved = resolve(dirname(file.absoluteFilePath), target);
            if (relative(skillDirectory, resolved).startsWith("..")) {
                violations.push({
                    severity: "error",
                    message:
                        `Reference "${target}" escapes the skill's directory. ` +
                        "Installed skills only include files within the skill's own folder, so this reference would break after `npx skills add`.",
                    absoluteFilePath: file.absoluteFilePath
                });
            }
        }
    }
    return violations;
}

function extractRelativeMarkdownReferences(markdown: string): string[] {
    const targets: string[] = [];
    for (const match of markdown.matchAll(MARKDOWN_LINK_TARGET_REGEX)) {
        const rawTarget = match[1];
        if (rawTarget == null) {
            continue;
        }
        // strip anchors and query strings
        const target = rawTarget.split("#")[0]?.split("?")[0] ?? "";
        if (target.length === 0 || isExternalOrAbsoluteReference(target)) {
            continue;
        }
        targets.push(target);
    }
    return targets;
}

function isExternalOrAbsoluteReference(target: string): boolean {
    // scheme-qualified (https:, mailto:, etc.), protocol-relative, or site-absolute references
    // never resolve against the skill directory
    return /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("//") || target.startsWith("/");
}
