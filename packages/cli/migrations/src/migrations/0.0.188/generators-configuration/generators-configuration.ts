import { join, RelativeFilePath } from "@fern-api/core-utils";
import { DraftGeneratorInvocationSchema, GeneratorsConfigurationSchema } from "@fern-api/generators-configuration-v2";
import { Workspace } from "@fern-api/workspace-loader";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { Migration } from "../../../types/Migration";
import * as oldConfigurationUtils from "./old-configuration";

export const GeneratorsConfigurationMigration: Migration = {
    name: "generators-configuration",
    summary:
        "migrates the generators configuration to a new format that handles publishing to public registries and GitHub repositories.",
    run: async ({ context, project }) => {
        for (const workspace of project.workspaces) {
            try {
                await migrateWorkspace(workspace);
            } catch (error) {
                context.fail("Failed to migrate generators configuration", error);
            }
        }
    },
};

async function migrateWorkspace(workspace: Workspace) {
    const absolutePathToGeneratorsConfiguration = join(
        workspace.absolutePathToWorkspace,
        RelativeFilePath.of("generators.yml")
    );
    const oldRawConfiguration = await oldConfigurationUtils.loadRawGeneratorsConfiguration({
        absolutePathToGeneratorsConfiguration,
    });
    const oldConfiguration = oldConfigurationUtils.convertGeneratorsConfiguration({
        absolutePathToGeneratorsConfiguration,
        rawGeneratorsConfiguration: oldRawConfiguration,
    });
    const migratedConfiguration = migrateConfiguration(oldConfiguration);
    await writeFile(absolutePathToGeneratorsConfiguration, yaml.dump(migratedConfiguration));
}

function migrateConfiguration(
    oldConfiguration: oldConfigurationUtils.GeneratorsConfiguration
): GeneratorsConfigurationSchema {
    return {
        draft: oldConfiguration.generators.map(migrateGeneratorInvocation),
        release: [],
    };
}

function migrateGeneratorInvocation(
    oldGenerator: oldConfigurationUtils.GeneratorInvocation
): DraftGeneratorInvocationSchema {
    return {
        name: oldGenerator.name,
        version: oldGenerator.version,
        "local-output": oldGenerator.generate?.absolutePathToLocalOutput,
        config: oldGenerator.config,
    };
}
