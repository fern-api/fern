import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { readdir, readFile } from "fs/promises";
import yaml from "js-yaml";

import { ChangelogEntry, validateAngleBracketEscaping } from "./angleBracketValidator.js";

const UNRELEASED_DIR_NAME = "unreleased";
const FORBIDDEN_UNRELEASED_TYPES = new Set(["break"]);

export async function validateStagedChanges({
    absolutePathToChangelog,
    context,
    label
}: {
    absolutePathToChangelog: AbsoluteFilePath;
    context: TaskContext;
    label: string;
}): Promise<boolean> {
    const changesDir = join(dirname(absolutePathToChangelog), RelativeFilePath.of("changes"));
    if (!(await doesPathExist(changesDir))) {
        return false;
    }

    let hasErrors = false;
    const versionEntries = await readdir(changesDir, { withFileTypes: true });
    for (const versionEntry of versionEntries) {
        if (!versionEntry.isDirectory()) {
            continue;
        }
        const versionName = versionEntry.name;
        const versionDir = join(changesDir, RelativeFilePath.of(versionName));
        const files = await readdir(versionDir);
        for (const file of files) {
            if (!file.endsWith(".yml") && !file.endsWith(".yaml")) {
                continue;
            }
            const filePath = join(versionDir, RelativeFilePath.of(file));
            const relPath = `changes/${versionName}/${file}`;
            let items: unknown;
            try {
                items = yaml.load((await readFile(filePath)).toString());
            } catch (e) {
                hasErrors = true;
                context.logger.error(chalk.red(`[${label}]: ${relPath} failed to parse: ${(e as Error).message}`));
                continue;
            }
            if (!Array.isArray(items)) {
                continue;
            }
            const entry: ChangelogEntry = { version: versionName, changelogEntry: items };
            const angleBracketErrors = validateAngleBracketEscaping(entry);
            context.logger.debug(`Checking ${relPath}: Found ${angleBracketErrors.length} angle bracket errors`);
            if (angleBracketErrors.length > 0) {
                hasErrors = true;
                for (const error of angleBracketErrors) {
                    context.logger.error(chalk.red(`${relPath}: ${error}`));
                }
            }

            if (versionName === UNRELEASED_DIR_NAME) {
                const forbiddenTypeErrors = findForbiddenUnreleasedTypes(items);
                if (forbiddenTypeErrors.length > 0) {
                    hasErrors = true;
                    for (const error of forbiddenTypeErrors) {
                        context.logger.error(chalk.red(`${relPath}: ${error}`));
                    }
                }
            }
        }
    }

    return hasErrors;
}

function findForbiddenUnreleasedTypes(items: unknown[]): string[] {
    const errors: string[] = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (typeof item !== "object" || item === null) {
            continue;
        }
        const type = (item as { type?: unknown }).type;
        if (typeof type === "string" && FORBIDDEN_UNRELEASED_TYPES.has(type)) {
            errors.push(
                `Entry ${i + 1} uses forbidden type "${type}". ` +
                    "Major version bumps are not produced by the automated release flow; " +
                    "to ship a breaking change, edit the relevant versions.yml directly so the major bump is explicitly acknowledged in review."
            );
        }
    }
    return errors;
}
