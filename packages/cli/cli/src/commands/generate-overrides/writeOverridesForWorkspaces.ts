import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { RelativeFilePath, dirname, join } from "@fern-api/fs-utils";
import { OSSWorkspace, OpenAPILoader, getAllOpenAPISpecs } from "@fern-api/lazy-fern-workspace";
import { Schema } from "@fern-api/openapi-ir";
import { parse } from "@fern-api/openapi-ir-parser";
import { getEndpointLocation } from "@fern-api/openapi-ir-to-fern";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";

import { CliContext } from "../../cli-context/CliContext";

export async function writeOverridesForWorkspaces({
    project,
    includeModels,
    cliContext
}: {
    project: Project;
    includeModels: boolean;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace instanceof OSSWorkspace) {
                    await writeDefinitionForOpenAPIWorkspace({
                        workspace,
                        context,
                        includeModels
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
    context
}: {
    workspace: OSSWorkspace;
    includeModels: boolean;
    context: TaskContext;
}): Promise<void> {
    const loader = new OpenAPILoader(workspace.absoluteFilePath);
    const specs = await getAllOpenAPISpecs({ context, specs: workspace.specs });
    for (const spec of specs) {
        const ir = parse({
            context,
            documents: await loader.loadDocuments({ context, specs: [spec] })
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let existingOverrides: any = {};
        if (spec.absoluteFilepathToOverrides !== undefined) {
            existingOverrides = await readExistingOverrides(spec.absoluteFilepathToOverrides, context);
        }

        const paths: Record<string, Record<string, unknown>> = "path" in existingOverrides
            ? (existingOverrides.path as Record<string, Record<string, unknown>>)
            : {};
        for (const endpoint of ir.endpoints) {
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
            } else if (existingOverrides == null) {
                context.logger.warn(`Endpoint ${endpoint.path} ${endpoint.method} is defined multiple times`);
            }
        }
        const schemas: Record<string, Record<string, unknown>> = "path" in existingOverrides
            ? (existingOverrides.path as Record<string, Record<string, unknown>>)
            : {};
        if (includeModels) {
            writeModels(schemas, ir.groupedSchemas.rootSchemas);
            for (const [_, namespacedSchemas] of Object.entries(ir.groupedSchemas.namespacedSchemas)) {
                writeModels(schemas, namespacedSchemas);
            }
        }
        const components: Record<string, Record<string, unknown>> = { schemas };

        await writeFile(
            join(dirname(spec.absoluteFilepath), RelativeFilePath.of("openapi-overrides.yml")),
            yaml.dump({ paths, components })
        );
    }
}

function writeModels(existingSchemas: Record<string, Record<string, unknown>>, schemas: Record<string, Schema>) {
    for (const [schemaId, schema] of Object.entries(schemas)) {
        if (schemaId in existingSchemas) {
            continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const typeNameOverride: Record<string, any> = {};
        typeNameOverride["x-fern-type-name"] = "nameOverride" in schema ? (schema.nameOverride ?? schemaId) : schemaId;
        existingSchemas[schemaId] = typeNameOverride;
    }
}
