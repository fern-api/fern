import { RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { FernRegistryClient as FdrClient, FernRegistry } from "@fern-fern/generators-sdk";

import { GeneratorType } from "../../config/api";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { parseGeneratorReleasesFile } from "../../utils/convertVersionsFileToReleases";

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
        displayName: generatorConfig.displayName,
        generatorType: convertGeneratorType(generatorConfig.generatorType),
        generatorLanguage: generatorConfig.language,
        dockerImage: generatorConfig.image,
        scripts: {
            preInstallScript: generatorConfig.buildScripts?.preInstallScript
                ? {
                      steps: generatorConfig.buildScripts.preInstallScript.commands
                  }
                : undefined,
            installScript: generatorConfig.buildScripts?.installScript
                ? {
                      steps: generatorConfig.buildScripts.installScript.commands
                  }
                : undefined,
            compileScript: generatorConfig.buildScripts?.compileScript
                ? {
                      steps: generatorConfig.buildScripts.compileScript.commands
                  }
                : undefined,
            testScript: generatorConfig.buildScripts?.testScript
                ? {
                      steps: generatorConfig.buildScripts.testScript.commands
                  }
                : undefined
        }
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
        context.logger.info(`Registering generator ${generatorId} releases from ${absolutePathToChangelogLocation}...`);
        await parseGeneratorReleasesFile({
            generatorId,
            changelogPath: absolutePathToChangelogLocation,
            context,
            action: async (release) => {
                context.logger.info(`Registering generator ${generatorId} release: ${release.version}`);
                await fdrClient.generators.versions.upsertGeneratorRelease(release);
            }
        });
        context.logger.info("Registration complete.");
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
