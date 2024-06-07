import { FERN_PACKAGE_MARKER_FILENAME, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { convert } from "@fern-api/openapi-ir-to-fern";
import { parse } from "@fern-api/openapi-parser";
import { TaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { mapValues as mapValuesLodash } from "lodash-es";
import { FernDefinition, FernWorkspace, OSSWorkspace } from "../types/Workspace";

export async function convertToFernWorkspace(
    openapiWorkspace: OSSWorkspace,
    context: TaskContext,
    enableUniqueErrorsPerEndpoint = false,
    sdkLanguage: generatorsYml.GenerationLanguage | undefined
): Promise<FernWorkspace> {
    const workspaceDefinitionCache = new Map<string, FernDefinition>();

    return {
        type: "fern",
        name: openapiWorkspace.name,
        generatorsConfiguration: openapiWorkspace.generatorsConfiguration,
        absoluteFilepath: openapiWorkspace.absoluteFilepath,
        dependenciesConfiguration: {
            dependencies: {}
        },
        workspaceName: openapiWorkspace.workspaceName,
        getDefinition: async (language?: generatorsYml.GenerationLanguage) => {
            const languageKey = language ?? sdkLanguage ?? "default";
            const maybeDefinition = workspaceDefinitionCache.get(languageKey);
            if (maybeDefinition != null) {
                return maybeDefinition;
            }
            const openApiIr = await parse({
                workspace: openapiWorkspace,
                taskContext: context,
                sdkLanguage: language ?? sdkLanguage
            });
            const definition = convert({
                taskContext: context,
                ir: openApiIr,
                enableUniqueErrorsPerEndpoint
            });

            const workspaceDefinition = {
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
            };

            workspaceDefinitionCache.set(languageKey, workspaceDefinition);
            return workspaceDefinition;
        },
        changelog: openapiWorkspace.changelog
    };
}

function mapValues<T extends object, U>(items: T, mapper: (item: T[keyof T]) => U): Record<keyof T, U> {
    return mapValuesLodash(items, mapper) as Record<keyof T, U>;
}
