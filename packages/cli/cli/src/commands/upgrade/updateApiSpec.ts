import * as fs from "fs";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { ReadableStream } from "stream/web";

import { generatorsYml, getFernDirectory, loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { assertNever, isPlainObject } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";

async function fetchAndWriteFile(url: string, path: string, logger: Logger): Promise<void> {
    const resp = await fetch(url);
    if (resp.ok && resp.body) {
        logger.debug("Origin successfully fetched, writing to file");
        // Write file to disk
        const fileStream = fs.createWriteStream(path);
        await finished(Readable.fromWeb(resp.body as ReadableStream).pipe(fileStream));

        // Read and format file
        const fileContents = await readFile(path, "utf8");
        try {
            await writeFile(path, JSON.stringify(JSON.parse(fileContents), undefined, 2), "utf8");
        } catch (e) {
            await writeFile(path, yaml.dump(yaml.load(fileContents)), "utf8");
        }
        logger.debug("File written successfully");
    }
}

export async function updateApiSpec({
    cliContext,
    project: { apiWorkspaces }
}: {
    cliContext: CliContext;
    project: Project;
}): Promise<void> {
    // Filter to the specified API, if provided, if not then run through them all
    for (const workspace of apiWorkspaces) {
        if (workspace.type === "fern") {
            continue;
        }

        await cliContext.runTaskForWorkspace(workspace, async (context) => {
            const generatorConfig: generatorsYml.GeneratorsConfiguration | undefined =
                await loadGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilePath,
                    context
                });
            if (generatorConfig == null) {
                cliContext.logger.info("No API configuration was found, skipping API update.");
                return;
            }

            if (generatorConfig.api != null) {
                if (generatorConfig.api.type === "conjure") {
                    cliContext.logger.info("Encountered conjure API definition, skipping API update.");
                    return;
                }
                if (generatorConfig.api.type === "singleNamespace") {
                    await processDefinitions({
                        cliContext,
                        workspacePath: workspace.absoluteFilePath,
                        apiLocations: generatorConfig.api.definitions
                    });
                    return;
                } else if (generatorConfig.api.type === "multiNamespace") {
                    // process root definitions
                    if (generatorConfig.api.rootDefinitions != null) {
                        await processDefinitions({
                            cliContext,
                            workspacePath: workspace.absoluteFilePath,
                            apiLocations: generatorConfig.api.rootDefinitions
                        });
                    }

                    // process namespaced definitions
                    for (const [_, apiLocations] of Object.entries(generatorConfig.api.definitions)) {
                        await processDefinitions({
                            cliContext,
                            workspacePath: workspace.absoluteFilePath,
                            apiLocations
                        });
                    }
                }
            }
            return;
        });
    }
}

async function getAndFetchFromAPIDefinitionLocation({
    cliContext,
    workspacePath,
    apiLocation
}: {
    cliContext: CliContext;
    workspacePath: AbsoluteFilePath;
    apiLocation: generatorsYml.APIDefinitionLocation;
}) {
    if (apiLocation.schema.type === "protobuf") {
        cliContext.logger.info("Encountered conjure API definition, skipping API update.");
        return;
    }
    if (apiLocation.origin != null) {
        cliContext.logger.info(`Origin found, fetching spec from ${apiLocation.origin}`);
        await fetchAndWriteFile(
            apiLocation.origin,
            join(workspacePath, RelativeFilePath.of(apiLocation.schema.path)),
            cliContext.logger
        );
    }
}

async function processDefinitions({
    cliContext,
    workspacePath,
    apiLocations
}: {
    cliContext: CliContext;
    workspacePath: AbsoluteFilePath;
    apiLocations: generatorsYml.APIDefinitionLocation[];
}) {
    for (const apiLocation of apiLocations) {
        await getAndFetchFromAPIDefinitionLocation({
            cliContext,
            workspacePath,
            apiLocation
        });
    }
}
