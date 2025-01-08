import chalk from "chalk";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import * as serializers from "@fern-fern/generators-sdk/serialization";

import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";

// TODO: we should share the language and generator type with the FDR definition
export async function validateGenerator({
    generator,
    context
}: {
    generator: GeneratorWorkspace;
    context: TaskContext;
}): Promise<void> {
    const generatorId = generator.workspaceName;
    const generatorConfig = generator.workspaceConfig;

    if (generatorConfig.changelogLocation == null) {
        context.logger.warn("No changelog location specified");
        return;
    }

    const absolutePathToChangelog = join(
        generator.absolutePathToWorkspace,
        RelativeFilePath.of(generatorConfig.changelogLocation)
    );
    if (!(await doesPathExist(absolutePathToChangelog))) {
        context.logger.error(`Changelog does not exist at path ${absolutePathToChangelog}`);
        return;
    }

    await validateGeneratorChangelog({ absolutePathToChangelog, context, generatorId });
}

async function validateGeneratorChangelog({
    generatorId,
    absolutePathToChangelog,
    context
}: {
    generatorId: string;
    absolutePathToChangelog: AbsoluteFilePath;
    context: TaskContext;
}): Promise<void> {
    let hasErrors = false;
    const changelogs = yaml.load((await readFile(absolutePathToChangelog)).toString());
    if (Array.isArray(changelogs)) {
        for (const entry of changelogs) {
            try {
                const release = serializers.generators.GeneratorReleaseRequest.parseOrThrow({ generatorId, ...entry });
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
                context.logger.error((e as Error)?.message);
            }
        }
    }
    if (!hasErrors) {
        context.logger.info(chalk.green("All changelogs are valid"));
    } else {
        context.failAndThrow();
    }
}
