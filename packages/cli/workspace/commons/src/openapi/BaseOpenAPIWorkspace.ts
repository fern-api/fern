import { generatorsYml } from "@fern-api/configuration";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";

import { AbstractAPIWorkspace, AbstractAPIWorkspaceSync, FernDefinition, FernWorkspace } from "..";
import { FernDefinitionConverter } from "./FernDefinitionConverter";
import { OpenAPISettings } from "./OpenAPISettings";

export declare namespace BaseOpenAPIWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        inlinePathParameters: boolean | undefined;
        objectQueryParameters: boolean | undefined;
        onlyIncludeReferencedSchemas: boolean | undefined;
        respectReadonlySchemas: boolean | undefined;
        respectNullableSchemas: boolean | undefined;
        exampleGeneration: generatorsYml.OpenApiExampleGenerationSchema | undefined;
        useBytesForBinaryResponse: boolean | undefined;
        respectForwardCompatibleEnums: boolean | undefined;
        inlineAllOfSchemas: boolean | undefined;
    }

    export type Settings = Partial<OpenAPISettings>;
}

export abstract class BaseOpenAPIWorkspace extends AbstractAPIWorkspace<BaseOpenAPIWorkspace.Settings> {
    public inlinePathParameters: boolean | undefined;
    public objectQueryParameters: boolean | undefined;
    public onlyIncludeReferencedSchemas: boolean | undefined;
    public respectReadonlySchemas: boolean | undefined;
    public respectNullableSchemas: boolean | undefined;
    public exampleGeneration: generatorsYml.OpenApiExampleGenerationSchema | undefined;
    public useBytesForBinaryResponse: boolean | undefined;
    public respectForwardCompatibleEnums: boolean | undefined;
    public inlineAllOfSchemas: boolean | undefined;
    private converter: FernDefinitionConverter;

    constructor(args: BaseOpenAPIWorkspace.Args) {
        super(args);
        this.inlinePathParameters = args.inlinePathParameters;
        this.objectQueryParameters = args.objectQueryParameters;
        this.onlyIncludeReferencedSchemas = args.onlyIncludeReferencedSchemas;
        this.respectReadonlySchemas = args.respectReadonlySchemas;
        this.respectNullableSchemas = args.respectNullableSchemas;
        this.exampleGeneration = args.exampleGeneration;
        this.useBytesForBinaryResponse = args.useBytesForBinaryResponse;
        this.respectForwardCompatibleEnums = args.respectForwardCompatibleEnums;
        this.inlineAllOfSchemas = args.inlineAllOfSchemas;
        this.converter = new FernDefinitionConverter(args);
    }

    public async getDefinition(
        {
            context,
            absoluteFilePath,
            relativePathToDependency
        }: {
            context: TaskContext;
            absoluteFilePath?: AbsoluteFilePath;
            relativePathToDependency?: RelativeFilePath;
        },
        settings?: BaseOpenAPIWorkspace.Settings
    ): Promise<FernDefinition> {
        const openApiIr = await this.getOpenAPIIr({ context, relativePathToDependency }, settings);
        return this.converter.convert({
            context,
            ir: openApiIr,
            settings,
            absoluteFilePath
        });
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

export abstract class BaseOpenAPIWorkspaceSync extends AbstractAPIWorkspaceSync<BaseOpenAPIWorkspace.Settings> {
    public inlinePathParameters: boolean | undefined;
    public objectQueryParameters: boolean | undefined;
    public onlyIncludeReferencedSchemas: boolean | undefined;
    public respectReadonlySchemas: boolean | undefined;
    public useBytesForBinaryResponse: boolean | undefined;
    public respectForwardCompatibleEnums: boolean | undefined;
    private converter: FernDefinitionConverter;

    constructor(args: BaseOpenAPIWorkspace.Args) {
        super(args);
        this.inlinePathParameters = args.inlinePathParameters;
        this.objectQueryParameters = args.objectQueryParameters;
        this.onlyIncludeReferencedSchemas = args.onlyIncludeReferencedSchemas;
        this.respectReadonlySchemas = args.respectReadonlySchemas;
        this.useBytesForBinaryResponse = args.useBytesForBinaryResponse;
        this.respectForwardCompatibleEnums = args.respectForwardCompatibleEnums;
        this.converter = new FernDefinitionConverter(args);
    }

    public getDefinition(
        {
            context,
            absoluteFilePath,
            relativePathToDependency
        }: {
            context: TaskContext;
            absoluteFilePath?: AbsoluteFilePath;
            relativePathToDependency?: RelativeFilePath;
        },
        settings?: BaseOpenAPIWorkspace.Settings
    ): FernDefinition {
        const openApiIr = this.getOpenAPIIr({ context, relativePathToDependency }, settings);
        return this.converter.convert({
            context,
            ir: openApiIr,
            settings,
            absoluteFilePath
        });
    }

    public toFernWorkspace(
        { context }: { context: TaskContext },
        settings?: BaseOpenAPIWorkspace.Settings
    ): FernWorkspace {
        const definition = this.getDefinition({ context }, settings);
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
    ): OpenApiIntermediateRepresentation;

    public abstract getAbsoluteFilePaths(): AbsoluteFilePath[];
}
