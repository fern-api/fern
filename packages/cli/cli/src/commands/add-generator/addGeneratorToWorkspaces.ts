import { GeneratorsConfigurationSchema, loadRawGeneratorsConfiguration } from "@fern-api/generators-configuration";
import {
    addJavaGenerator,
    addOpenApiGenerator,
    addPostmanGenerator,
    addTypescriptGenerator,
    GeneratorAddResult,
} from "@fern-api/manage-generator";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { Project } from "../../createProjectLoader";

export async function addGeneratorToWorkspaces(
    { workspaces }: Project,
    generatorName: "java" | "typescript" | "postman" | "openapi"
): Promise<void> {
    for (const workspace of workspaces) {
        const generatorsConfiguration = await loadRawGeneratorsConfiguration({
            absolutePathToWorkspace: workspace.absolutePathToWorkspace,
        });
        const addGeneratorResult = addGeneratorToWorkspaceConfiguration(generatorName, generatorsConfiguration);
        if (addGeneratorResult === undefined) {
            console.log(chalk.yellow(`Generator ${generatorName} already exists`));
        } else {
            await writeFile(
                workspace.generatorsConfiguration.absolutePathToConfiguration,
                yaml.dump(addGeneratorResult.updatedGeneratorsConfiguration)
            );
            console.log(
                chalk.green(
                    `Added generator ${addGeneratorResult.addedInvocation.name}@${addGeneratorResult.addedInvocation.version}`
                )
            );
        }
    }
}

function addGeneratorToWorkspaceConfiguration(
    generatorName: "java" | "typescript" | "postman" | "openapi",
    generatorsConfiguration: GeneratorsConfigurationSchema
): GeneratorAddResult {
    switch (generatorName) {
        case "java":
            return addJavaGenerator(generatorsConfiguration);
        case "typescript":
            return addTypescriptGenerator(generatorsConfiguration);
        case "postman":
            return addPostmanGenerator(generatorsConfiguration);
        case "openapi":
            return addOpenApiGenerator(generatorsConfiguration);
    }
}
