import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convert } from "@fern-api/openapi-ir-to-fern";
import { parse } from "@fern-api/openapi-parser";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace, OpenAPIWorkspace } from "@fern-api/workspace-loader";
import yaml from "js-yaml";
import { mapValues as mapValuesLodash } from "lodash-es";

export async function convertOpenApiWorkspaceToFernWorkspace(
    openapiWorkspace: OpenAPIWorkspace,
    context: TaskContext
): Promise<FernWorkspace> {
    const openApiIr = await parse({
        root: openapiWorkspace.definition,
        taskContext: context,
    });
    const definition = convert({
        openApiIr,
    });

    return {
        type: "fern",
        name: openapiWorkspace.name,
        generatorsConfiguration: openapiWorkspace.generatorsConfiguration,
        docsDefinition: openapiWorkspace.docsDefinition,
        absoluteFilepath: openapiWorkspace.absoluteFilepath,
        dependenciesConfiguration: {
            dependencies: {},
        },
        definition: {
            // these files doesn't live on disk, so there's no absolute filepath
            absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
            rootApiFile: {
                contents: definition.rootApiFile,
                rawContents: yaml.dump(definition.rootApiFile),
            },
            namedDefinitionFiles: mapValues(definition.definitionFiles, (definitionFile) => ({
                // these files doesn't live on disk, so there's no absolute filepath
                absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
                rawContents: yaml.dump(definitionFile),
                contents: definitionFile,
            })),
            packageMarkers: {},
            importedDefinitions: {},
        },
    };
}

function mapValues<T extends object, U>(items: T, mapper: (item: T[keyof T]) => U): Record<keyof T, U> {
    return mapValuesLodash(items, mapper) as Record<keyof T, U>;
}
