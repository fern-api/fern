import { AbstractAPIWorkspace, FernDefinition, FernWorkspace } from "..";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { mapValues } from "lodash-es";
import { convert } from "@fern-api/openapi-ir-to-fern";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { OpenAPISettings } from "./OpenAPISettings";
import yaml from "js-yaml";

export declare namespace BaseOpenAPIWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        inlinePathParameters: boolean;
        objectQueryParameters: boolean;
        onlyIncludeReferencedSchemas: boolean;
        respectReadonlySchemas: boolean;
    }

    export type Settings = OpenAPISettings;
}

export abstract class BaseOpenAPIWorkspace extends AbstractAPIWorkspace<BaseOpenAPIWorkspace.Settings> {
    public inlinePathParameters: boolean;
    public objectQueryParameters: boolean;
    public onlyIncludeReferencedSchemas: boolean;
    public respectReadonlySchemas: boolean;

    constructor(args: BaseOpenAPIWorkspace.Args) {
        super(args);
        this.inlinePathParameters = args.inlinePathParameters;
        this.objectQueryParameters = args.objectQueryParameters;
        this.onlyIncludeReferencedSchemas = args.onlyIncludeReferencedSchemas;
        this.respectReadonlySchemas = args.respectReadonlySchemas;
    }

    public async getDefinition(
        {
            context,
            relativePathToDependency
        }: {
            context: TaskContext;
            relativePathToDependency?: RelativeFilePath;
        },
        settings?: BaseOpenAPIWorkspace.Settings
    ): Promise<FernDefinition> {
        const openApiIr = await this.getOpenAPIIr({ context, relativePathToDependency }, settings);
        const definition = convert({
            authOverrides:
                this.generatorsConfiguration?.api?.auth != null ? { ...this.generatorsConfiguration?.api } : undefined,
            environmentOverrides:
                this.generatorsConfiguration?.api?.environments != null
                    ? { ...this.generatorsConfiguration?.api }
                    : undefined,
            globalHeaderOverrides:
                this.generatorsConfiguration?.api?.headers != null
                    ? { ...this.generatorsConfiguration?.api }
                    : undefined,
            taskContext: context,
            ir: openApiIr,
            enableUniqueErrorsPerEndpoint: settings?.enableUniqueErrorsPerEndpoint ?? false,
            detectGlobalHeaders: settings?.detectGlobalHeaders ?? true,
            objectQueryParameters: this.objectQueryParameters,
            respectReadonlySchemas: this.respectReadonlySchemas,
            onlyIncludeReferencedSchemas: this.onlyIncludeReferencedSchemas,
            inlinePathParameters: this.inlinePathParameters
        });

        return {
            absoluteFilePath: this.absoluteFilePath,
            rootApiFile: {
                defaultUrl: definition.rootApiFile["default-url"],
                contents: definition.rootApiFile,
                rawContents: yaml.dump(definition.rootApiFile)
            },
            namedDefinitionFiles: {
                ...mapValues(definition.definitionFiles, (definitionFile) => ({
                    absoluteFilepath: this.absoluteFilePath,
                    rawContents: yaml.dump(definitionFile),
                    contents: definitionFile
                })),
                [RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)]: {
                    absoluteFilepath: this.absoluteFilePath,
                    rawContents: yaml.dump(definition.packageMarkerFile),
                    contents: definition.packageMarkerFile
                }
            },
            packageMarkers: {},
            importedDefinitions: {}
        };
    }

    public async toFernWorkspace(
        { context }: { context: TaskContext },
        settings?: BaseOpenAPIWorkspace.Settings
    ): Promise<FernWorkspace> {
        const definition = await this.getDefinition({ context }, settings);
        return new FernWorkspace({
            absoluteFilePath: this.absoluteFilePath,
            workspaceName: this.workspaceName,
            generatorsConfiguration: this.generatorsConfiguration,
            dependenciesConfiguration: {
                dependencies: {}
            },
            definition,
            cliVersion: this.cliVersion
        });
    }

    public abstract getOpenAPIIr(
        {
            context,
            relativePathToDependency
        }: {
            context: TaskContext;
            relativePathToDependency?: RelativeFilePath;
        },
        settings?: BaseOpenAPIWorkspace.Settings
    ): Promise<OpenApiIntermediateRepresentation>;

    public abstract getAbsoluteFilePaths(): AbsoluteFilePath[];
}
