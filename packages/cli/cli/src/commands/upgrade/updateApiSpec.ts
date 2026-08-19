import { generatorsYml, loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";
import * as fs from "fs";
import { readFile, writeFile } from "fs/promises";
import { buildClientSchema, getIntrospectionQuery, IntrospectionQuery, printSchema } from "graphql";
import yaml from "js-yaml";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { ReadableStream } from "stream/web";
import { CliContext } from "../../cli-context/CliContext.js";

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

// Helper function to prepare authentication headers
function prepareAuthHeaders(url: string): Record<string, string> {
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
        } else {
            headers.Authorization = `Bearer ${authToken}`;
        }
    }

    return headers;
}

// Helper function to check if JSON response contains introspection data
function isIntrospectionResult(data: unknown): boolean {
    if (!data || typeof data !== "object") {
        return false;
    }
    // Check for direct introspection format: { __schema: ... }
    if ("__schema" in data && data.__schema) {
        return true;
    }
    // Check for wrapped format: { data: { __schema: ... } }
    if ("data" in data && data.data && typeof data.data === "object" && "__schema" in data.data) {
        return true;
    }
    return false;
}

// Helper function to extract introspection data from response
function extractIntrospectionData(data: unknown): IntrospectionQuery {
    if (!data || typeof data !== "object") {
        throw new CliError({
            message: "Data does not contain valid GraphQL introspection result",
            code: CliError.Code.InternalError
        });
    }

    // If it has __schema directly, return it
    if ("__schema" in data && data.__schema) {
        return data as IntrospectionQuery;
    }

    // If it's wrapped in { data: ... }, unwrap it
    if ("data" in data && data.data && typeof data.data === "object" && "__schema" in data.data) {
        return data.data as IntrospectionQuery;
    }

    throw new CliError({
        message: "Data does not contain valid GraphQL introspection result",
        code: CliError.Code.InternalError
    });
}

// Try GraphQL POST introspection approach
async function tryGraphQLIntrospection(
    url: string,
    logger: Logger
): Promise<
    | {
          success: true;
          result: string; // SDL string
      }
    | {
          success: false;
          error: string;
      }
> {
    try {
        logger.debug("Attempting GraphQL POST introspection");

        // Create the introspection query
        const introspectionQuery = getIntrospectionQuery();

        // Prepare headers with authentication if available
        const headers = prepareAuthHeaders(url);

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
                return {
                    success: false,
                    error:
                        `GraphQL introspection failed: ${resp.status} ${resp.statusText}. ` +
                        `This endpoint requires authentication. ${authHint}`
                };
            }
            return {
                success: false,
                error: `GraphQL introspection failed: ${resp.status} ${resp.statusText}`
            };
        }

        const result = await resp.json();

        // Validate the response structure
        if (!result || typeof result !== "object") {
            return {
                success: false,
                error: "Invalid JSON response from GraphQL endpoint"
            };
        }

        if (result.errors) {
            return {
                success: false,
                error: `GraphQL introspection errors: ${JSON.stringify(result.errors)}`
            };
        }

        if (!isIntrospectionResult(result)) {
            return {
                success: false,
                error: "GraphQL introspection returned no data"
            };
        }

        // Extract the introspection data regardless of format
        const introspectionData = extractIntrospectionData(result);

        // Convert introspection result to schema and then to SDL
        const schema = buildClientSchema(introspectionData);
        const sdl = printSchema(schema);

        logger.debug("GraphQL POST introspection succeeded");
        return {
            success: true,
            result: sdl
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to perform GraphQL introspection: ${error}`
        };
    }
}

// Try direct JSON fetch approach
async function tryDirectJSONFetch(
    url: string,
    logger: Logger
): Promise<
    | {
          success: true;
          result: string; // SDL string
      }
    | {
          success: false;
          error: string;
      }
> {
    try {
        logger.debug("Attempting direct JSON fetch");

        // Prepare headers with authentication if available
        const headers = prepareAuthHeaders(url);
        // Remove Content-Type for GET request
        delete headers["Content-Type"];

        // Send GET request
        const resp = await fetch(url, {
            method: "GET",
            headers
        });

        if (!resp.ok) {
            if (resp.status === 401 || resp.status === 403) {
                const authHint = url.includes("github.com")
                    ? "Set GITHUB_TOKEN environment variable with a GitHub personal access token"
                    : "Set GRAPHQL_TOKEN or API_TOKEN environment variable with an authentication token";
                return {
                    success: false,
                    error:
                        `Direct JSON fetch failed: ${resp.status} ${resp.statusText}. ` +
                        `This endpoint requires authentication. ${authHint}`
                };
            }
            return {
                success: false,
                error: `Direct JSON fetch failed: ${resp.status} ${resp.statusText}`
            };
        }

        const result = await resp.json();

        // Validate that the response contains introspection data
        if (!isIntrospectionResult(result)) {
            return {
                success: false,
                error: "Response does not contain GraphQL introspection data. Expected __schema field."
            };
        }

        // Extract the introspection data
        const introspectionData = extractIntrospectionData(result);

        // Convert introspection result to schema and then to SDL
        const schema = buildClientSchema(introspectionData);
        const sdl = printSchema(schema);

        logger.debug("Direct JSON fetch succeeded");
        return {
            success: true,
            result: sdl
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to fetch JSON directly: ${error}`
        };
    }
}

// Auto-detection wrapper that tries both approaches
export async function fetchGraphQLSchemaWithAutoDetection(url: string, path: string, logger: Logger): Promise<void> {
    // First attempt: POST introspection query
    const postResult = await tryGraphQLIntrospection(url, logger);

    if (postResult.success) {
        await writeFile(path, postResult.result, "utf8");
        logger.info("Successfully fetched GraphQL schema using POST introspection");
        return;
    }

    // Log the first attempt failure for debugging
    logger.debug(`POST introspection failed: ${postResult.error}`);

    // Second attempt: GET direct JSON fetch
    const getResult = await tryDirectJSONFetch(url, logger);

    if (getResult.success) {
        await writeFile(path, getResult.result, "utf8");
        logger.info("Successfully fetched GraphQL schema using direct JSON fetch");
        return;
    }

    // Both attempts failed - provide comprehensive error message
    const errorMessage =
        `Failed to fetch GraphQL schema from ${url}.\n\n` +
        `Attempt 1 (POST introspection): ${postResult.error}\n` +
        `Attempt 2 (GET direct fetch): ${getResult.error}\n\n` +
        `To update the schema from its defined origin, please ensure the origin either:\n` +
        `1. Accepts GraphQL introspection queries via POST, or\n` +
        `2. Returns introspection results directly via GET`;

    throw new CliError({ message: errorMessage, code: CliError.Code.InternalError });
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
            cliContext.logger.info(`GraphQL schema origin found, fetching schema from ${apiLocation.origin}`);
            await fetchGraphQLSchemaWithAutoDetection(apiLocation.origin, filePath, cliContext.logger);
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
