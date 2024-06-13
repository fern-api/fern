import { FERN_PACKAGE_MARKER_FILENAME, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { convert } from "@fern-api/openapi-ir-to-fern";
import { parse } from "@fern-api/openapi-parser";
import { TaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { mapValues as mapValuesLodash } from "lodash-es";
import { FernWorkspace, OSSWorkspace } from "../types/Workspace";

export async function convertToFernWorkspace(
    openapiWorkspace: OSSWorkspace,
    context: TaskContext,
    enableUniqueErrorsPerEndpoint = false,
    sdkLanguage: generatorsYml.GenerationLanguage | undefined
): Promise<FernWorkspace> {
    const openApiIr = await parse({
        workspace: openapiWorkspace,
        taskContext: context,
        sdkLanguage
    });
    const definition = convert({
        taskContext: context,
        ir: openApiIr,
        enableUniqueErrorsPerEndpoint
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
        },
        changelog: openapiWorkspace.changelog
    };
}

function mapValues<T extends object, U>(items: T, mapper: (item: T[keyof T]) => U): Record<keyof T, U> {
    return mapValuesLodash(items, mapper) as Record<keyof T, U>;
}
