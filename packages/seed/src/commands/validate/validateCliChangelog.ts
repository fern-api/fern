import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadCliWorkspace } from "../../loadGeneratorWorkspaces";
import yaml from "js-yaml";
import { readFile } from "fs/promises";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import * as serializers from "@fern-fern/generators-sdk/serialization";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

export async function validateCliRelease({ context }: { context: TaskContext }): Promise<void> {
    const cliWorkspace = await loadCliWorkspace();

    if (cliWorkspace == null) {
        context.logger.error("Failed to load CLI workspace");
        return;
    }

    if (cliWorkspace.workspaceConfig.changelogLocation == null) {
        context.logger.warn("No changelog location specified");
        return;
    }

    const absolutePathToChangelog = join(
        cliWorkspace.absolutePathToWorkspace,
        RelativeFilePath.of(cliWorkspace.workspaceConfig.changelogLocation)
    );
    if (!(await doesPathExist(absolutePathToChangelog))) {
        context.logger.error(`Changelog does not exist at path ${cliWorkspace.workspaceConfig.changelogLocation}`);
        return;
    }

    await validateCliChangelog({ absolutePathToChangelog, context });
}

async function validateCliChangelog({
    absolutePathToChangelog,
    context
}: {
    absolutePathToChangelog: AbsoluteFilePath;
    context: TaskContext;
}): Promise<void> {
    let hasErrors = false;
    const changelogs = yaml.load((await readFile(absolutePathToChangelog)).toString());
    if (Array.isArray(changelogs)) {
        for (const entry of changelogs) {
            try {
                const release = serializers.generators.CliReleaseRequest.parseOrThrow(entry);
                context.logger.debug(chalk.green(`${release.version} is valid`));
            } catch (e) {
                hasErrors = true;
                const maybeVersion = (entry as any)?.version;
                if (maybeVersion != null) {
                    context.logger.error(`${maybeVersion} is invalid`);
                } else {
                    context.logger.error(`Failed to parse: ${yaml.dump(entry)}`);
                }
                // eslint-disable-next-line
                context.logger.error(e as string);
            }
        }
    }
    if (!hasErrors) {
        context.logger.info(chalk.green("All changelogs are valid"));
    } else {
        context.failAndThrow();
    }
}
