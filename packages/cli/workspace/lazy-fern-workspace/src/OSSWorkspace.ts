import { isNonNullish } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { parse, SpecImportSettings } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import { v4 as uuidv4 } from "uuid";
import { getAllOpenAPISpecs } from "./utils/getAllOpenAPISpecs";
import {
    AbstractAPIWorkspace,
    BaseOpenAPIWorkspace,
    FernWorkspace,
    getOptionsOverridesFromSettings,
    IdentifiableSource,
    Spec
} from "@fern-api/api-workspace-commons";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { OpenAPILoader } from "./loaders/OpenAPILoader";

export declare namespace OSSWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        specs: Spec[];
    }

    export type Settings = BaseOpenAPIWorkspace.Settings;
}

export class OSSWorkspace extends BaseOpenAPIWorkspace {
    public specs: Spec[];
    public sources: IdentifiableSource[];

    private loader: OpenAPILoader;

    constructor({ specs, ...superArgs }: OSSWorkspace.Args) {
        super({
            ...superArgs,
            respectReadonlySchemas: specs.every((spec) => spec.settings?.respectReadonlySchemas ?? false),
            onlyIncludeReferencedSchemas: specs.every((spec) => spec.settings?.onlyIncludeReferencedSchemas ?? false),
            inlinePathParameters: specs.every((spec) => spec.settings?.inlinePathParameters ?? false),
            objectQueryParameters: specs.every((spec) => spec.settings?.objectQueryParameters ?? false)
        });
        this.specs = specs;
        this.sources = this.convertSpecsToIdentifiableSources(specs);
        this.loader = new OpenAPILoader(this.absoluteFilePath);
    }

    public async getOpenAPIIr(
        {
            context,
            relativePathToDependency
        }: {
            context: TaskContext;
            relativePathToDependency?: RelativeFilePath;
        },
        settings?: OSSWorkspace.Settings
    ): Promise<OpenApiIntermediateRepresentation> {
        const openApiSpecs = await getAllOpenAPISpecs({ context, specs: this.specs, relativePathToDependency });
        const optionOverrides = getOptionsOverridesFromSettings(settings);
        return await parse({
            context,
            documents: await this.loader.loadDocuments({
                context,
                specs: openApiSpecs
            }),
            options: {
                ...optionOverrides,
                respectReadonlySchemas: this.respectReadonlySchemas,
                onlyIncludeReferencedSchemas: this.onlyIncludeReferencedSchemas
            }
        });
    }

    public async toFernWorkspace(
        { context }: { context: TaskContext },
        settings?: OSSWorkspace.Settings
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
            cliVersion: this.cliVersion,
            sources: this.sources
        });
    }

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        return [
            this.absoluteFilePath,
            ...this.specs
                .flatMap((spec) => [
                    spec.type === "protobuf" ? spec.absoluteFilepathToProtobufTarget : spec.absoluteFilepath,
                    spec.absoluteFilepathToOverrides
                ])
                .filter(isNonNullish)
        ];
    }

    public getSources(): IdentifiableSource[] {
        return this.sources;
    }

    private convertSpecsToIdentifiableSources(specs: Spec[]): IdentifiableSource[] {
        const seen = new Set<string>();
        const result: IdentifiableSource[] = [];
        return specs.reduce((acc, spec) => {
            const absoluteFilePath =
                spec.type === "protobuf" ? spec.absoluteFilepathToProtobufRoot : spec.absoluteFilepath;

            if (!seen.has(absoluteFilePath)) {
                seen.add(absoluteFilePath);
                acc.push({
                    type: spec.type,
                    id: uuidv4(),
                    absoluteFilePath
                });
            }

            return acc;
        }, result);
    }
}
