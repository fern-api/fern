import { docsYml } from "@fern-api/configuration";

import { Rule, RuleViolation } from "../../Rule.js";

/**
 * Light validation for the `page-actions.options.skills` display config (the "Install skills"
 * page action and its modal). This is intentionally shallow — it validates the config renders
 * sensibly, not the skill bundles themselves (see `valid-well-known-skills` for that):
 *
 * - skill entries must have a non-empty `name`
 * - `install-command` entries must be non-empty (a custom command is rendered verbatim)
 * - `learn-more-url`, `repository`, and per-skill `url` must be syntactically valid URLs
 */
export const ValidSkillsPageActionRule: Rule = {
    name: "valid-skills-page-action",
    create: () => {
        return {
            file: ({ config }) => validateSkillsPageAction(config.pageActions?.options?.skills)
        };
    }
};

export function validateSkillsPageAction(
    skills: docsYml.RawSchemas.SkillsPageActionConfig | undefined
): RuleViolation[] {
    if (skills == null) {
        return [];
    }

    const violations: RuleViolation[] = [];

    if (skills.path != null && skills.path.trim().length === 0) {
        violations.push({
            severity: "error",
            message: "page-actions.options.skills.path must not be empty."
        });
    }

    if (skills.installCommand != null) {
        const installCommands =
            typeof skills.installCommand === "string" ? [skills.installCommand] : skills.installCommand;
        if (installCommands.length === 0) {
            violations.push({
                severity: "error",
                message: "page-actions.options.skills.install-command must not be an empty list."
            });
        }
        installCommands.forEach((command, index) => {
            if (command.trim().length === 0) {
                violations.push({
                    severity: "error",
                    message: `page-actions.options.skills.install-command[${index}] must not be empty.`
                });
            }
        });
    }

    skills.skills?.forEach((skill, index) => {
        if (skill.name.trim().length === 0) {
            violations.push({
                severity: "error",
                message: `page-actions.options.skills.skills[${index}].name must not be empty.`
            });
        }
        if (skill.url != null && !isValidUrl(skill.url)) {
            violations.push({
                severity: "warning",
                message: `page-actions.options.skills.skills[${index}].url is not a valid URL: "${skill.url}"`
            });
        }
    });

    if (skills.learnMoreUrl != null && !isValidUrl(skills.learnMoreUrl)) {
        violations.push({
            severity: "warning",
            message: `page-actions.options.skills.learn-more-url is not a valid URL: "${skills.learnMoreUrl}"`
        });
    }

    if (skills.repository != null && !isValidUrl(skills.repository)) {
        violations.push({
            severity: "warning",
            message: `page-actions.options.skills.repository is not a valid URL: "${skills.repository}"`
        });
    }

    return violations;
}

function isValidUrl(value: string): boolean {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}
