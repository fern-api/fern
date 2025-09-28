import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import * as serializers from "@fern-fern/generators-sdk/serialization";
import chalk from "chalk";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { validateAngleBracketEscaping } from "./angleBracketValidator";
import { assertValidSemVerChangeOrThrow, assertValidSemVerOrThrow } from "./semVerUtils";

const parseReleaseOrThrow = serializers.generators.GeneratorReleaseRequest.parseOrThrow;

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
            const angleBracketErrors = validateAngleBracketEscaping(entry);
            context.logger.debug(
                `Checking version ${entry.version}: Found ${angleBracketErrors.length} angle bracket errors`
            );
            if (angleBracketErrors.length > 0) {
                hasErrors = true;
                for (const error of angleBracketErrors) {
                    context.logger.error(chalk.red(error));
                }
            }

            try {
                const release = parseReleaseOrThrow({ generatorId, ...entry });
                assertValidSemVerOrThrow(release.version);
                context.logger.debug(chalk.green(`${release.version} is valid`));
            } catch (e) {
                hasErrors = true;
                const maybeVersion = (entry as any)?.version;
                if (maybeVersion != null) {
                    context.logger.error(`${maybeVersion} is invalid`);
                } else {
                    context.logger.error(`Failed to parse: ${yaml.dump(entry)}`);
                }
                // biome-ignore lint: ignore next line
                context.logger.error((e as Error)?.message);
            }
        }
        if (changelogs.length > 1) {
            try {
                const currentRelease = parseReleaseOrThrow({ generatorId, ...changelogs[0] });
                const previousRelease = parseReleaseOrThrow({ generatorId, ...changelogs[1] });
                assertValidSemVerChangeOrThrow(currentRelease, previousRelease);
            } catch (e) {
                context.logger.error(`Failed to validate semver change: ${yaml.dump(changelogs[0])}`);
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
