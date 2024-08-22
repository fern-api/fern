import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { getIrVersionForGeneratorVersion } from "../../../../cli/generation/local-generation/local-workspace-runner/node_modules/@fern-api/ir-migrations/src";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { parseGeneratorReleasesFile } from "../../utils/convertVersionsFileToReleases";
import yaml from "js-yaml";
import { writeFile } from "fs/promises";
import { GeneratorName } from "@fern-api/configuration";

export async function enrichChangelogWithIr({
    generator,
    context
}: {
    generator: GeneratorWorkspace;
    context: TaskContext;
}): Promise<void> {
    const generatorConfig = generator.workspaceConfig;
    const generatorName = getGeneratorNameFromWorkspaceName(generator.workspaceName);
    context.logger.info(`Enriching changelog with IR data for generator ${generator.workspaceName}`);
    if (generatorName && generatorConfig.changelogLocation) {
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
        const enrichedReleases: unknown[] = [];
        await parseGeneratorReleasesFile({
            generatorId: generator.workspaceName,
            changelogPath: absolutePathToChangelogLocation,
            context,
            action: async (release, rawRelease) => {
                const ver = await getIrVersionForGeneratorVersion({
                    targetGenerator: {
                        name: generatorName,
                        version: release.version
                    },
                    context
                });
                if (!ver) {
                    context.logger.warn(
                        `Failed to get IR version for generator version ${release.version}, continuing without enriching release.`
                    );
                    return;
                }

                enrichedReleases.push({ ...rawRelease, ir_version: Number.parseInt(ver.replace("v", "")) });
            }
        });

        const enrichedChangelog = yaml.dump(enrichedReleases);
        await writeFile(absolutePathToChangelogLocation + ".new", enrichedChangelog);
    }
}

function getGeneratorNameFromWorkspaceName(workspaceName: string): GeneratorName | undefined {
    switch (workspaceName) {
        case "csharp-model":
            return GeneratorName.CSHARP_MODEL;
        case "csharp-sdk":
            return GeneratorName.CSHARP_SDK;
        case "fastapi":
            return GeneratorName.PYTHON_FASTAPI;
        case "go-fiber":
            return GeneratorName.GO_FIBER;
        case "go-model":
            return GeneratorName.GO_MODEL;
        case "go-sdk":
            return GeneratorName.GO_SDK;
        case "java-model":
            return GeneratorName.JAVA_MODEL;
        case "java-sdk":
            return GeneratorName.JAVA_SDK;
        case "java-spring":
            return GeneratorName.JAVA_SPRING;
        case "openapi":
            return GeneratorName.OPENAPI;
        case "postman":
            return GeneratorName.POSTMAN;
        case "pydantic":
            return GeneratorName.PYTHON_PYDANTIC;
        case "python-sdk":
            return GeneratorName.PYTHON_SDK;
        case "ruby-model":
            return GeneratorName.RUBY_MODEL;
        case "ruby-sdk":
            return GeneratorName.RUBY_SDK;
        case "ts-sdk":
            return GeneratorName.TYPESCRIPT_SDK;
        case "ts-express":
            return GeneratorName.TYPESCRIPT_EXPRESS;
    }
    return undefined;
}
