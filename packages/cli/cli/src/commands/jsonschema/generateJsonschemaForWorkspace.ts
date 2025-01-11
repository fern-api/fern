import chalk from "chalk";
import { mkdir, writeFile } from "fs/promises";

import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath, dirname, doesPathExist } from "@fern-api/fs-utils";
import {
    IdGenerator,
    constructCasingsGenerator,
    convertToFernFilepath,
    generateIntermediateRepresentation
} from "@fern-api/ir-generator";
import { convertIRtoJsonSchema } from "@fern-api/ir-to-jsonschema";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";

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
                const fernWorkspace = await workspace.toFernWorkspace({ context });

                const intermediateRepresentation = generateIntermediateRepresentation({
                    workspace: fernWorkspace,
                    context,
                    generationLanguage: undefined,
                    audiences: { type: "all" },
                    keywords: undefined,
                    smartCasing: false,
                    disableExamples: true,
                    version: undefined,
                    packageName: undefined,
                    readme: undefined,
                    sourceResolver: new SourceResolverImpl(context, fernWorkspace)
                });

                const splitTypeLocator = typeLocator.split(".");
                const casingsGenerator = constructCasingsGenerator({
                    generationLanguage: undefined,
                    keywords: undefined,
                    smartCasing: false
                });
                const typeName = splitTypeLocator[splitTypeLocator.length - 1] ?? typeLocator;
                const relativeFilepath =
                    splitTypeLocator.length > 1
                        ? `${splitTypeLocator.slice(0, -1).join("/")}.yml`
                        : FERN_PACKAGE_MARKER_FILENAME;
                const typeId = IdGenerator.generateTypeId({
                    fernFilepath: convertToFernFilepath({
                        relativeFilepath: RelativeFilePath.of(`${splitTypeLocator.slice(0, -1).join("/")}.yml`),
                        casingsGenerator
                    }),
                    name: casingsGenerator.generateName(typeName)
                });

                const jsonSchema = convertIRtoJsonSchema({
                    ir: intermediateRepresentation,
                    typeName,
                    typeId,
                    context
                });

                if (!(await doesPathExist(dirname(jsonschemaFilepath)))) {
                    await mkdir(dirname(jsonschemaFilepath), { recursive: true });
                }
                await writeFile(jsonschemaFilepath, JSON.stringify(jsonSchema, null, 2));

                context.logger.info(chalk.green(`Wrote JSON Schema to ${jsonschemaFilepath}`));
            });
        })
    );
}
