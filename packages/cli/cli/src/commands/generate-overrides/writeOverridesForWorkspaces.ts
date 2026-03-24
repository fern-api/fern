import { dirname, getFilename, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getAllOpenAPISpecs, OpenAPILoader, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { OpenApiIntermediateRepresentation, Schema } from "@fern-api/openapi-ir";
import { parse } from "@fern-api/openapi-ir-parser";
import { getEndpointLocation } from "@fern-api/openapi-ir-to-fern";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { CliContext } from "../../cli-context/CliContext.js";

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

export function generateOverridesContent({
    ir,
    existingOverrides,
    includeModels,
    context
}: {
    ir: OpenApiIntermediateRepresentation;
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    existingOverrides: any;
    includeModels: boolean;
    context: TaskContext;
}): { paths: Record<string, Record<string, unknown>>; components: Record<string, Record<string, unknown>> } {
    const hasExisting = existingOverrides != null && typeof existingOverrides === "object";

    const paths: Record<string, Record<string, unknown>> = hasExisting && "paths" in existingOverrides
        ? (existingOverrides.paths as Record<string, Record<string, unknown>>)
        : {};
    for (const endpoint of ir.endpoints) {
        const endpointLocation = getEndpointLocation(endpoint);
        if (!(endpoint.path in paths)) {
            paths[endpoint.path] = {};
        }
        const pathItem = paths[endpoint.path];
        if (pathItem != null && pathItem[endpoint.method] == null && pathItem[endpoint.method.toLowerCase()] == null) {
            const groupName = endpointLocation.file
                .split("/")
                .map((part) => part.replace(".yml", ""))
                .filter((part) => part !== "__package__");
            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            const sdkMethodNameExtensions: Record<string, any> = {};
            if (groupName.length > 0) {
                sdkMethodNameExtensions["x-fern-sdk-group-name"] = groupName;
            }
            sdkMethodNameExtensions["x-fern-sdk-method-name"] = endpointLocation.endpointId;
            pathItem[endpoint.method.toLowerCase()] = sdkMethodNameExtensions;
        } else if (!hasExisting) {
            context.logger.warn(`Endpoint ${endpoint.path} ${endpoint.method} is defined multiple times`);
        }
    }

    const schemas: Record<string, Record<string, unknown>> = hasExisting &&
    "components" in existingOverrides &&
    existingOverrides.components?.schemas != null
        ? (existingOverrides.components.schemas as Record<string, Record<string, unknown>>)
        : {};
    if (includeModels) {
        writeModels(schemas, ir.groupedSchemas.rootSchemas);
        for (const [_, namespacedSchemas] of Object.entries(ir.groupedSchemas.namespacedSchemas)) {
            writeModels(schemas, namespacedSchemas as Record<string, Schema>);
        }
    }

    return { paths, components: { schemas } };
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

        const overridesPaths = Array.isArray(spec.absoluteFilepathToOverrides)
            ? spec.absoluteFilepathToOverrides
            : spec.absoluteFilepathToOverrides != null
              ? [spec.absoluteFilepathToOverrides]
              : [];

        if (overridesPaths.length > 0) {
            // For each existing override file, read it, merge in the generated SDK
            // method names, and write it back to its original location.
            for (const overridesPath of overridesPaths) {
                const existingOverrides = await readExistingOverrides(overridesPath, context);
                const content = generateOverridesContent({ ir, existingOverrides, includeModels, context });
                await writeFile(overridesPath, yaml.dump(content));
            }
        } else {
            // No existing override files - generate a new one from scratch.
            const content = generateOverridesContent({ ir, existingOverrides: {}, includeModels, context });

            const specFilename = getFilename(spec.absoluteFilepath);
            let overridesFilename = "openapi-overrides.yml"; // fallback
            if (specFilename != null) {
                const lastDotIndex = specFilename.lastIndexOf(".");
                if (lastDotIndex > 0) {
                    const nameWithoutExt = specFilename.substring(0, lastDotIndex);
                    const extension = specFilename.substring(lastDotIndex);
                    overridesFilename = `${nameWithoutExt}-overrides${extension}`;
                }
            }

            await writeFile(
                join(dirname(spec.absoluteFilepath), RelativeFilePath.of(overridesFilename)),
                yaml.dump(content)
            );
        }
    }
}

function writeModels(existingSchemas: Record<string, Record<string, unknown>>, schemas: Record<string, Schema>) {
    for (const [schemaId, schema] of Object.entries(schemas)) {
        if (schemaId in existingSchemas) {
            continue;
        }
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        const typeNameOverride: Record<string, any> = {};
        typeNameOverride["x-fern-type-name"] = "nameOverride" in schema ? (schema.nameOverride ?? schemaId) : schemaId;
        existingSchemas[schemaId] = typeNameOverride;
    }
}
