import { FERN_PACKAGE_MARKER_FILENAME, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { convert } from "@fern-api/openapi-ir-to-fern";
import { parse } from "@fern-api/openapi-parser";
import { TaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { mapValues as mapValuesLodash } from "lodash-es";
import { APIChangelog, FernDefinition, Spec } from "../types/Workspace";
import { AbstractAPIWorkspace } from "./AbstractAPIWorkspace";
import { FernWorkspace } from "./FernWorkspace";

export declare namespace OSSWorkspace {
    export interface Args {
        absoluteFilepath: AbsoluteFilePath;
        workspaceName: string | undefined;
        specs: Spec[];
        changelog: APIChangelog | undefined;
        generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
    }
}

export class OSSWorkspace extends AbstractAPIWorkspace {
    public type: "fern" | "oss" = "oss";
    public absoluteFilepath: AbsoluteFilePath;
    public workspaceName: string | undefined;
    public specs: Spec[];
    public changelog: APIChangelog | undefined;
    public generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;

    constructor({ absoluteFilepath, workspaceName, specs, changelog, generatorsConfiguration }: OSSWorkspace.Args) {
        super();
        this.absoluteFilepath = absoluteFilepath;
        this.workspaceName = workspaceName;
        this.specs = specs;
        this.changelog = changelog;
        this.generatorsConfiguration = generatorsConfiguration;
    }

    public async getDefinition({ context }: { context: TaskContext }): Promise<FernDefinition> {
        const openApiIr = await parse({
            specs: this.specs,
            taskContext: context
        });

        const definition = convert({
            taskContext: context,
            ir: openApiIr,
            enableUniqueErrorsPerEndpoint: false // Come back to this
        });

        return {
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
    }

    public async toFernWorkspace({ context }: { context: TaskContext }): Promise<FernWorkspace> {
        const definition = await this.getDefinition({ context });
        return new FernWorkspace({
            absoluteFilepath: this.absoluteFilepath,
            workspaceName: this.workspaceName,
            generatorsConfiguration: this.generatorsConfiguration,
            dependenciesConfiguration: {
                dependencies: {}
            },
            definition,
            changelog: this.changelog
        });
    }
}

function mapValues<T extends object, U>(items: T, mapper: (item: T[keyof T]) => U): Record<keyof T, U> {
    return mapValuesLodash(items, mapper) as Record<keyof T, U>;
}
