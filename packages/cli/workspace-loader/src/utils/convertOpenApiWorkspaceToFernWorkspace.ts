import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convert } from "@fern-api/openapi-ir-to-fern";
import { parse } from "@fern-api/openapi-parser";
import { TaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { mapValues as mapValuesLodash } from "lodash-es";
import { FernWorkspace, OpenAPIWorkspace } from "../types/Workspace";

export async function convertOpenApiWorkspaceToFernWorkspace(
    openapiWorkspace: OpenAPIWorkspace,
    context: TaskContext
): Promise<FernWorkspace> {
    const openApiIr = await parse({
        asyncApiFile: openapiWorkspace.asyncapi,
        openApiFile: openapiWorkspace.openapi,
        taskContext: context,
    });
    const definition = convert({
        taskContext: context,
        openApiIr,
    });

    return {
        type: "fern",
        name: openapiWorkspace.name,
        generatorsConfiguration: openapiWorkspace.generatorsConfiguration,
        absoluteFilepath: openapiWorkspace.absoluteFilepath,
        dependenciesConfiguration: {
            dependencies: {},
        },
        workspaceName: openapiWorkspace.workspaceName,
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
