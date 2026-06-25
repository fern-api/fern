import { dependenciesYml, generatorsYml } from "@fern-api/configuration";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { AbsoluteFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";

import { AbstractAPIWorkspace, FernDefinition } from "./AbstractAPIWorkspace.js";
import { IdentifiableSource } from "./Source.js";

export declare namespace FernWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        dependenciesConfiguration: dependenciesYml.DependenciesConfiguration;
        definition: FernDefinition;
        sources?: IdentifiableSource[];
        /**
         * Pre-built IRs (e.g. generated from GraphQL schemas) to merge into the IR produced
         * from this workspace's Fern definition. This lets specs that convert directly to IR
         * — rather than to a Fern definition — flow through the standard generation pipeline
         * (`toFernWorkspace()` → `generateIntermediateRepresentation()`).
         */
        additionalIrs?: IntermediateRepresentation[];
    }
}

export class FernWorkspace extends AbstractAPIWorkspace<void> {
    public definition: FernDefinition;
    public sources: IdentifiableSource[];
    public additionalIrs: IntermediateRepresentation[];

    public type: string = "fern";

    constructor({ definition, sources, additionalIrs, ...superArgs }: FernWorkspace.Args) {
        super(superArgs);
        this.definition = definition;
        this.sources = sources ?? [];
        this.additionalIrs = additionalIrs ?? [];
    }

    public async getDefinition(): Promise<FernDefinition> {
        return this.definition;
    }

    public async toFernWorkspace(
        { context }: { context: TaskContext },
        settings?: void,
        specsOverride?: generatorsYml.ApiConfigurationV2SpecsSchema,
        generatorOverrides?: generatorsYml.OverridesSchema
    ): Promise<FernWorkspace> {
        return this;
    }

    public getSources(): IdentifiableSource[] {
        return this.sources;
    }

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        return [this.absoluteFilePath];
    }
}
