import { dependenciesYml, generatorsYml } from "@fern-api/configuration";
import { FernIr } from "@fern-api/ir-sdk";
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
         * TwiML builder definitions declared via `twiml` specs. They have no Fern definition
         * equivalent, so they bypass the definition and are attached to the IR directly.
         */
        twiml?: FernIr.TwimlDefinition;
    }
}

export class FernWorkspace extends AbstractAPIWorkspace<void> {
    public definition: FernDefinition;
    public sources: IdentifiableSource[];
    public twiml: FernIr.TwimlDefinition | undefined;

    public type: string = "fern";

    constructor({ definition, sources, twiml, ...superArgs }: FernWorkspace.Args) {
        super(superArgs);
        this.definition = definition;
        this.sources = sources ?? [];
        this.twiml = twiml;
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
