import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { readdir, readFile } from "fs/promises";
import yaml from "js-yaml";

import { ChangelogEntry, validateAngleBracketEscaping } from "./angleBracketValidator.js";

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
        }
    }

    return hasErrors;
}
