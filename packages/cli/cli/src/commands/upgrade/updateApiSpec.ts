import { generatorsYml, loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { Project } from "@fern-api/project-loader";
import * as fs from "fs";
import { readFile, writeFile } from "fs/promises";
import { buildClientSchema, getIntrospectionQuery, printSchema } from "graphql";
import yaml from "js-yaml";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { ReadableStream } from "stream/web";

import { CliContext } from "../../cli-context/CliContext";

async function fetchAndWriteFile(url: string, path: string, logger: Logger, indent: number): Promise<void> {
    const resp = await fetch(url);
    if (resp.ok && resp.body) {
        logger.debug("Origin successfully fetched, writing to file");
        // Write file to disk
        const fileStream = fs.createWriteStream(path);
        await finished(Readable.fromWeb(resp.body as ReadableStream).pipe(fileStream));

        // Read and format file
        const fileContents = await readFile(path, "utf8");
        try {
            await writeFile(path, JSON.stringify(JSON.parse(fileContents), undefined, indent), "utf8");
        } catch (e) {
            await writeFile(path, yaml.dump(yaml.load(fileContents), { indent }), "utf8");
        }
        logger.debug("File written successfully");
    }
}

async function fetchGraphQLSchemaFromIntrospection(url: string, path: string, logger: Logger): Promise<void> {
    logger.debug("Performing GraphQL introspection query");

    // Create the introspection query
    const introspectionQuery = getIntrospectionQuery();

    // Prepare headers with authentication if available
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json"
    };

    // Check for authentication tokens in environment variables
    const authToken = process.env.GRAPHQL_TOKEN;

    if (authToken) {
        // GitHub uses "token" format, most others use "Bearer"
        if (url.includes("github.com")) {
            headers.Authorization = `token ${authToken}`;
            logger.debug("Using GitHub token authentication");
        } else {
            headers.Authorization = `Bearer ${authToken}`;
            logger.debug("Using Bearer token authentication");
        }
    } else {
        logger.debug("No authentication token found, using unauthenticated request");
    }

    // Send POST request with introspection query
    const resp = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
            query: introspectionQuery
        })
    });

    if (!resp.ok) {
        if (resp.status === 401 || resp.status === 403) {
            const authHint = url.includes("github.com")
                ? "Set GITHUB_TOKEN environment variable with a GitHub personal access token"
                : "Set GRAPHQL_TOKEN or API_TOKEN environment variable with an authentication token";
            throw new Error(
                `GraphQL introspection failed: ${resp.status} ${resp.statusText}. ` +
                    `This endpoint requires authentication. ${authHint}`
            );
        }
        throw new Error(`GraphQL introspection failed: ${resp.status} ${resp.statusText}`);
    }

    const result = await resp.json();

    if (result.errors) {
        throw new Error(`GraphQL introspection errors: ${JSON.stringify(result.errors)}`);
    }

    if (!result.data) {
        throw new Error("GraphQL introspection returned no data");
    }

    try {
        // Convert introspection result to schema and then to SDL
        const schema = buildClientSchema(result.data);
        const sdl = printSchema(schema);

        logger.debug("GraphQL schema introspection successful, writing SDL to file");
        await writeFile(path, sdl, "utf8");
        logger.debug("GraphQL schema file written successfully");
    } catch (error) {
        throw new Error(`Failed to convert introspection result to SDL: ${error}`);
    }
}

export async function updateApiSpec({
    cliContext,
    project: { apiWorkspaces },
    indent
}: {
    cliContext: CliContext;
    project: Project;
    indent: number;
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
                        apiLocations: generatorConfig.api.definitions,
                        indent
                    });
                    return;
                } else if (generatorConfig.api.type === "multiNamespace") {
                    // process root definitions
                    if (generatorConfig.api.rootDefinitions != null) {
                        await processDefinitions({
                            cliContext,
                            workspacePath: workspace.absoluteFilePath,
                            apiLocations: generatorConfig.api.rootDefinitions,
                            indent
                        });
                    }

                    // process namespaced definitions
                    for (const [_, apiLocations] of Object.entries(generatorConfig.api.definitions)) {
                        await processDefinitions({
                            cliContext,
                            workspacePath: workspace.absoluteFilePath,
                            apiLocations,
                            indent
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
    apiLocation,
    indent
}: {
    cliContext: CliContext;
    workspacePath: AbsoluteFilePath;
    apiLocation: generatorsYml.APIDefinitionLocation;
    indent: number;
}) {
    if (apiLocation.schema.type === "protobuf") {
        cliContext.logger.info("Encountered conjure API definition, skipping API update.");
        return;
    }
    if (apiLocation.origin != null) {
        const filePath = join(workspacePath, RelativeFilePath.of(apiLocation.schema.path));

        if (apiLocation.schema.type === "graphql") {
            cliContext.logger.info(
                `GraphQL schema origin found, performing introspection query to ${apiLocation.origin}`
            );
            await fetchGraphQLSchemaFromIntrospection(apiLocation.origin, filePath, cliContext.logger);
        } else {
            cliContext.logger.info(`Origin found, fetching spec from ${apiLocation.origin}`);
            await fetchAndWriteFile(apiLocation.origin, filePath, cliContext.logger, indent);
        }
    }
}

async function processDefinitions({
    cliContext,
    workspacePath,
    apiLocations,
    indent
}: {
    cliContext: CliContext;
    workspacePath: AbsoluteFilePath;
    apiLocations: generatorsYml.APIDefinitionLocation[];
    indent: number;
}) {
    for (const apiLocation of apiLocations) {
        await getAndFetchFromAPIDefinitionLocation({
            cliContext,
            workspacePath,
            apiLocation,
            indent
        });
    }
}
