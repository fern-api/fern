import { AbsoluteFilePath, doesPathExist, RelativeFilePath, dirname } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../cli-context/CliContext";
import { convertIRtoJsonSchema } from "@fern-api/ir-to-jsonschema";
import {
    IdGenerator,
    generateIntermediateRepresentation,
    constructCasingsGenerator,
    convertToFernFilepath
} from "@fern-api/ir-generator";
import { mkdir, writeFile } from "fs/promises";
import chalk from "chalk";

export async function generateJsonschemaForWorkspaces({
    typeLocator,
    project,
    jsonschemaFilepath,
    cliContext
}: {
    // e.g. "MySchema" or "mypackage.MySchema"
    typeLocator: string;
    project: Project;
    jsonschemaFilepath: AbsoluteFilePath;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                cliContext.logger.info(`Generating JSON Schema for workspace ${workspace.workspaceName}`);
                const fernWorkspace = await workspace.toFernWorkspace({ context });

                const intermediateRepresentation = await generateIntermediateRepresentation({
                    workspace: fernWorkspace,
                    context,
                    generationLanguage: undefined,
                    audiences: { type: "all" },
                    keywords: undefined,
                    smartCasing: false,
                    disableExamples: true,
                    version: undefined,
                    packageName: undefined,
                    readme: undefined
                });

                const splitTypeLocator = typeLocator.split(".");
                const casingsGenerator = constructCasingsGenerator({
                    generationLanguage: undefined,
                    keywords: undefined,
                    smartCasing: false
                });
                const typeId = IdGenerator.generateTypeId({
                    fernFilepath: convertToFernFilepath({
                        relativeFilepath: RelativeFilePath.of(splitTypeLocator.slice(0, -1).join("/")),
                        casingsGenerator
                    }),
                    name: casingsGenerator.generateName(typeLocator)
                });

                const jsonSchema = convertIRtoJsonSchema({
                    ir: intermediateRepresentation,
                    typeName: splitTypeLocator[splitTypeLocator.length - 1],
                    typeId,
                    context
                });

                if (!(await doesPathExist(dirname(jsonschemaFilepath)))) {
                    await mkdir(dirname(jsonschemaFilepath), { recursive: true });
                }
                await writeFile(jsonschemaFilepath, JSON.stringify(jsonSchema, null, 2));

                context.logger.info(chalk.green(`Wrote JSON Schema to ${AbsoluteFilePath}`));
            });
        })
    );
}
