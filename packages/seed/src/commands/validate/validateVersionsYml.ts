import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { validateAngleBracketEscaping } from "./angleBracketValidator";
import { assertValidSemVerChangeOrThrow, assertValidSemVerOrThrow } from "./semVerUtils";

export interface ValidateVersionsYmlOptions {
    absolutePathToChangelog: AbsoluteFilePath;
    context: TaskContext;
}

interface VersionEntry {
    version: string;
    changelogEntry?: Array<{
        summary?: string;
        type?: string;
    }>;
}

/**
 * Validates an arbitrary versions.yml (changelog) file without requiring workspace configuration.
 * This performs schema-agnostic validation focusing on:
 * - Valid semver version strings
 * - Proper semver progression between versions
 * - Proper angle bracket escaping in summaries
 */
export async function validateVersionsYml({
    absolutePathToChangelog,
    context
}: ValidateVersionsYmlOptions): Promise<void> {
    // Check if file exists
    if (!(await doesPathExist(absolutePathToChangelog))) {
        context.logger.error(`Changelog does not exist at path ${absolutePathToChangelog}`);
        context.failAndThrow();
        return;
    }

    const fileContent = await readFile(absolutePathToChangelog, "utf-8");

    // Parse YAML content
    let changelogs: unknown;
    try {
        changelogs = yaml.load(fileContent);
    } catch (e) {
        context.logger.error(`Failed to parse YAML file: ${(e as Error)?.message}`);
        context.failAndThrow();
        return;
    }

    if (!Array.isArray(changelogs)) {
        context.logger.error("Changelog file must contain an array of entries");
        context.failAndThrow();
        return;
    }

    let hasErrors = false;

    // Validate each entry
    for (const entry of changelogs) {
        const typedEntry = entry as VersionEntry;

        // Check if version field exists
        if (!typedEntry.version) {
            context.logger.error(`Entry missing required 'version' field: ${yaml.dump(entry)}`);
            hasErrors = true;
            continue;
        }

        // Validate angle bracket escaping
        const angleBracketErrors = validateAngleBracketEscaping(entry);
        context.logger.debug(
            `Checking version ${typedEntry.version}: Found ${angleBracketErrors.length} angle bracket errors`
        );
        if (angleBracketErrors.length > 0) {
            hasErrors = true;
            for (const error of angleBracketErrors) {
                context.logger.error(chalk.red(error));
            }
        }

        // Validate semver format
        try {
            assertValidSemVerOrThrow(typedEntry.version);
            context.logger.debug(chalk.green(`${typedEntry.version} is valid`));
        } catch (e) {
            hasErrors = true;
            context.logger.error(`${typedEntry.version} is invalid semver`);
            context.logger.error((e as Error)?.message);
        }
    }

    // Validate semver changes between consecutive versions
    if (changelogs.length > 1) {
        const typedChangelogs = changelogs as VersionEntry[];

        for (let i = 0; i < typedChangelogs.length - 1; i++) {
            const currentEntry = typedChangelogs[i];
            const previousEntry = typedChangelogs[i + 1];

            if (!currentEntry?.version || !previousEntry?.version) {
                continue; // Skip if versions are missing (already reported above)
            }

            try {
                // Create minimal release objects for semver comparison
                // Cast to 'any' to work with different schema types (CLI vs Generator vs other)
                const currentRelease = {
                    version: currentEntry.version,
                    changelogEntry: currentEntry.changelogEntry ?? []
                } as any;
                const previousRelease = {
                    version: previousEntry.version,
                    changelogEntry: previousEntry.changelogEntry ?? []
                } as any;

                assertValidSemVerChangeOrThrow(currentRelease, previousRelease);
                context.logger.debug(
                    chalk.green(`Semver change valid: ${previousEntry.version} -> ${currentEntry.version}`)
                );
            } catch (e) {
                context.logger.error(`Invalid semver change: ${previousEntry.version} -> ${currentEntry.version}`);
                context.logger.error((e as Error)?.message);
                hasErrors = true;
            }
        }
    }

    if (!hasErrors) {
        context.logger.info(chalk.green("All changelogs are valid"));
    } else {
        context.failAndThrow();
    }
}
