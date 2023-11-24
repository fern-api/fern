import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { Migration } from "../../../types/Migration";
import { loadWorkspaces } from "./loadWorkspaces";
import * as newConfigurationUtils from "./new-configuration";
import * as oldConfigurationUtils from "./old-configuration";

export const migration: Migration = {
    name: "generators-configuration",
    summary:
        "migrates the generators configuration to a new format that handles publishing to public registries and GitHub repositories.",
    run: async ({ context }) => {
        const workspaces = await loadWorkspaces(context);
        for (const pathToWorkspace of workspaces) {
            try {
                await migrateWorkspace(pathToWorkspace, context);
            } catch (error) {
                context.failWithoutThrowing("Failed to migrate generators configuration", error);
            }
        }
    }
};

async function migrateWorkspace(pathToWorkspace: AbsoluteFilePath, context: TaskContext) {
    const absolutePathToGeneratorsConfiguration = join(pathToWorkspace, RelativeFilePath.of("generators.yml"));
    const oldRawConfiguration = await oldConfigurationUtils.loadRawGeneratorsConfiguration({
        absolutePathToGeneratorsConfiguration,
        context
    });
    const oldConfiguration = oldConfigurationUtils.convertGeneratorsConfiguration({
        absolutePathToGeneratorsConfiguration,
        rawGeneratorsConfiguration: oldRawConfiguration
    });
    const migratedConfiguration = migrateConfiguration(oldConfiguration);
    await writeFile(absolutePathToGeneratorsConfiguration, yaml.dump(migratedConfiguration));
}

function migrateConfiguration(
    oldConfiguration: oldConfigurationUtils.GeneratorsConfiguration
): newConfigurationUtils.GeneratorsConfigurationSchema {
    return {
        draft: oldConfiguration.generators.map(migrateGeneratorInvocation),
        release: []
    };
}

function migrateGeneratorInvocation(
    oldGenerator: oldConfigurationUtils.GeneratorInvocation
): newConfigurationUtils.DraftGeneratorInvocationSchema {
    return {
        name: oldGenerator.name,
        version: oldGenerator.version,
        "local-output": oldGenerator.generate?.absolutePathToLocalOutput,
        config: oldGenerator.config
    };
}
