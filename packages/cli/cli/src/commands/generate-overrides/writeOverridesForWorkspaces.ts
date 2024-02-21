import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getEndpointLocation } from "@fern-api/openapi-ir-to-fern";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import { getOpenAPIIRFromOpenAPIWorkspace, OpenAPIWorkspace } from "@fern-api/workspace-loader";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";

export async function writeOverridesForWorkspaces({
    project,
    includeModels,
    overridesFilepath,
    cliContext
}: {
    project: Project;
    includeModels: boolean;
    overridesFilepath: string | undefined;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace.type === "openapi") {
                    await writeDefinitionForOpenAPIWorkspace({
                        workspace,
                        context,
                        includeModels,
                        overridesFilepath:
                            overridesFilepath ?? workspace.generatorsConfiguration?.absolutePathToOpenAPIOverrides
                    });
                } else {
                    context.logger.warn("Skipping fern workspace definition generation");
                }
            });
        })
    );
}

async function readExistingOverrides(overridesFilepath: string, context: TaskContext) {
    let parsedOverrides = null;
    try {
        const contents = (await readFile(overridesFilepath, "utf8")).toString();
        try {
            parsedOverrides = JSON.parse(contents);
        } catch (err) {
            parsedOverrides = yaml.load(contents, { json: true });
        }
    } catch (err) {
        return context.failAndThrow(`Failed to read OpenAPI overrides from file ${overridesFilepath}`);
    }
    return parsedOverrides;
}

async function writeDefinitionForOpenAPIWorkspace({
    workspace,
    includeModels,
    overridesFilepath,
    context
}: {
    workspace: OpenAPIWorkspace;
    includeModels: boolean;
    overridesFilepath: string | undefined;
    context: TaskContext;
}): Promise<void> {
    const openApiIr = await getOpenAPIIRFromOpenAPIWorkspace(workspace, context);

    let existingOverrides: any = {};
    if (overridesFilepath !== undefined) {
        existingOverrides = await readExistingOverrides(overridesFilepath, context);
    }

    const paths: Record<string, Record<string, unknown>> = "path" in existingOverrides
        ? (existingOverrides.path as Record<string, Record<string, unknown>>)
        : {};
    for (const endpoint of openApiIr.endpoints) {
        const endpointLocation = getEndpointLocation(endpoint);
        if (!(endpoint.path in paths)) {
            paths[endpoint.path] = {};
        }
        const pathItem = paths[endpoint.path];
        if (pathItem != null && pathItem[endpoint.method] == null) {
            const groupName = endpointLocation.file
                .split("/")
                .map((part) => part.replace(".yml", ""))
                .filter((part) => part !== "__package__");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sdkMethodNameExtensions: Record<string, any> = {};
            if (groupName.length > 0) {
                sdkMethodNameExtensions["x-fern-sdk-group-name"] = groupName;
            }
            sdkMethodNameExtensions["x-fern-sdk-method-name"] = endpointLocation.endpointId;
            pathItem[endpoint.method.toLowerCase()] = sdkMethodNameExtensions;
        } else if (existingOverrides === undefined) {
            context.logger.warn(`Endpoint ${endpoint.path} ${endpoint.method} is defined multiple times`);
        }
    }
    const schemas: Record<string, Record<string, unknown>> = "path" in existingOverrides
        ? (existingOverrides.path as Record<string, Record<string, unknown>>)
        : {};
    if (includeModels) {
        for (const [schemaId, schema] of Object.entries(openApiIr.schemas)) {
            if (schemaId in schemas) {
                continue;
            }
            const typeNameOverride: Record<string, any> = {};
            typeNameOverride["x-fern-type-name"] =
                "nameOverride" in schema ? schema.nameOverride ?? schemaId : schemaId;
            schemas[schemaId] = typeNameOverride;
        }
    }
    const components: Record<string, Record<string, unknown>> = { schemas };

    await writeFile(
        join(dirname(workspace.absolutePathToOpenAPI), RelativeFilePath.of("openapi-overrides.yml")),
        yaml.dump({ paths, components })
    );
}
