import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir-sdk";
import { convert } from "@fern-api/openapi-ir-to-fern";
import { parse } from "@fern-api/openapi-parser";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { mapValues as mapValuesLodash } from "lodash-es";
import { FernWorkspace, OpenAPIWorkspace } from "../types/Workspace";

export async function getOpenAPIIRFromOpenAPIWorkspace(
    openapiWorkspace: OpenAPIWorkspace,
    context: TaskContext
): Promise<OpenApiIntermediateRepresentation> {
    return await parse({
        absolutePathToAsyncAPI: openapiWorkspace.absolutePathToAsyncAPI,
        absolutePathToOpenAPI: openapiWorkspace.absolutePathToOpenAPI,
        absolutePathToOpenAPIOverrides: openapiWorkspace.generatorsConfiguration?.absolutePathToOpenAPIOverrides,
        taskContext: context
    });
}

export async function convertOpenApiWorkspaceToFernWorkspace(
    openapiWorkspace: OpenAPIWorkspace,
    context: TaskContext
): Promise<FernWorkspace> {
    const openApiIr = await getOpenAPIIRFromOpenAPIWorkspace(openapiWorkspace, context);
    const definition = convert({
        taskContext: context,
        openApiIr
    });

    return {
        type: "fern",
        name: openapiWorkspace.name,
        generatorsConfiguration: openapiWorkspace.generatorsConfiguration,
        absoluteFilepath: openapiWorkspace.absoluteFilepath,
        dependenciesConfiguration: {
            dependencies: {}
        },
        workspaceName: openapiWorkspace.workspaceName,
        definition: {
            // these files doesn't live on disk, so there's no absolute filepath
            absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
            rootApiFile: {
                contents: definition.rootApiFile,
                rawContents: yaml.dump(definition.rootApiFile)
            },
            namedDefinitionFiles: {
                ...mapValues(definition.definitionFiles, (definitionFile) => ({
                    // these files doesn't live on disk, so there's no absolute filepath
                    absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
                    rawContents: yaml.dump(definitionFile),
                    contents: definitionFile
                })),
                [RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)]: {
                    // these files doesn't live on disk, so there's no absolute filepath
                    absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
                    rawContents: yaml.dump(definition.packageMarkerFile),
                    contents: definition.packageMarkerFile
                }
            },
            packageMarkers: {},
            importedDefinitions: {}
        }
    };
}

function mapValues<T extends object, U>(items: T, mapper: (item: T[keyof T]) => U): Record<keyof T, U> {
    return mapValuesLodash(items, mapper) as Record<keyof T, U>;
}
