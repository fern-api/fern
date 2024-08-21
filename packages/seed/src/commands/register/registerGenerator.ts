import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernRegistry, FernRegistryClient as FdrClient } from "@fern-fern/generators-sdk";
import * as serializers from "@fern-fern/generators-sdk/serialization";
import { readFile } from "fs/promises";
import YAML from "yaml";
import { GeneratorType } from "../../config/api";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";

// TODO: we should share the language and generator type with the FDR definition
export async function registerGenerator({
    generator,
    fdrClient,
    context
}: {
    generator: GeneratorWorkspace;
    fdrClient: FdrClient;
    context: TaskContext;
}): Promise<void> {
    const generatorId = generator.workspaceName;
    const generatorConfig = generator.workspaceConfig;
    context.logger.info(`Registering generator ${generatorId}...`);

    // Register generator itself
    fdrClient.generators.upsertGenerator({
        id: generatorId,
        generatorType: convertGeneratorType(generatorConfig.generatorType),
        generatorLanguage: generatorConfig.language,
        dockerImage: generatorConfig.docker
    });

    // Register generator versions
    if (generatorConfig.changelogLocation) {
        const absolutePathToChangelogLocation = join(
            generator.absolutePathToWorkspace,
            RelativeFilePath.of(generatorConfig.changelogLocation)
        );
        if (!(await doesPathExist(absolutePathToChangelogLocation))) {
            context.logger.error(
                `Specified changelog location (${absolutePathToChangelogLocation}) not found, continuing without registering versions for generator ${generator.workspaceName}.`
            );
            return undefined;
        }

        // We've found a versions file, let's read it and register all the versions
        const changelogs = YAML.parseDocument((await readFile(absolutePathToChangelogLocation)).toString());
        context.logger.info(`Registering generator ${generatorId} releases...`);
        if (YAML.isSeq(changelogs)) {
            for (const entry of changelogs.items) {
                if (!YAML.isMap(entry)) {
                    continue;
                }
                try {
                    const release = serializers.generators.GeneratorReleaseRequest.parseOrThrow({
                        generator_id: generatorId,
                        ...entry
                    });
                    context.logger.debug(`Registering generator  ${generatorId} release: ${release.version}`);
                    fdrClient.generators.versions.upsertGeneratorRelease(release);
                } catch (e) {
                    context.logger.error(`Error parsing release: ${e}`);
                }
            }
        }
    }
}

function convertGeneratorType(generatorType: GeneratorType): FernRegistry.generators.GeneratorType {
    switch (generatorType) {
        case GeneratorType.Sdk:
            return { type: "sdk" };
        case GeneratorType.Model:
            return { type: "model" };
        case GeneratorType.Server:
            return { type: "server" };
        default:
            return { type: "other" };
    }
}
