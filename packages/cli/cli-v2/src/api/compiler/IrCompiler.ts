import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { Audiences, generatorsYml } from "@fern-api/configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { migrateIntermediateRepresentationThroughVersion } from "@fern-api/ir-migrations";
import { serialization as IrSerialization } from "@fern-api/ir-sdk";

import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../context/Context.js";
import { LegacyFernWorkspaceAdapter } from "../adapter/LegacyFernWorkspaceAdapter.js";
import type { ApiDefinition } from "../config/ApiDefinition.js";

export declare namespace IrCompiler {
    interface Config {
        context: Context;
        cliVersion: string;
    }

    interface Options {
        language?: generatorsYml.GenerationLanguage;
        audiences: Audiences;
        disableExamples: boolean;
        irVersion?: string;
    }

    interface Result {
        /** The serialized IR object, ready for streaming to a file or stdout. */
        object: unknown;
    }
}

export class IrCompiler {
    private readonly context: Context;
    private readonly cliVersion: string;

    constructor(config: IrCompiler.Config) {
        this.context = config.context;
        this.cliVersion = config.cliVersion;
    }

    public async compile({
        apiName,
        definition,
        options
    }: {
        apiName: string;
        definition: ApiDefinition;
        options: IrCompiler.Options;
    }): Promise<IrCompiler.Result> {
        return this.compileInternal({ apiName, definition, dynamic: false, options });
    }

    public async compileDynamic({
        apiName,
        definition,
        options
    }: {
        apiName: string;
        definition: ApiDefinition;
        options: IrCompiler.Options;
    }): Promise<IrCompiler.Result> {
        return this.compileInternal({ apiName, definition, dynamic: true, options });
    }

    private async compileInternal({
        apiName,
        definition,
        dynamic,
        options
    }: {
        apiName: string;
        definition: ApiDefinition;
        dynamic: boolean;
        options: IrCompiler.Options;
    }): Promise<IrCompiler.Result> {
        const taskContext = new TaskContextAdapter({ context: this.context });
        const adapter = new LegacyFernWorkspaceAdapter({
            context: this.context,
            cliVersion: this.cliVersion
        });

        const fernWorkspace = await adapter.adapt(definition);

        const ir = generateIntermediateRepresentation({
            workspace: fernWorkspace,
            generationLanguage: options.language,
            context: taskContext,
            exampleGeneration: { disabled: options.disableExamples },
            audiences: options.audiences,
            sourceResolver: new SourceResolverImpl(taskContext, fernWorkspace),
            disableDynamicExamples: true,

            // For now, these properties are not configurable when generating the IR directly
            // (i.e. for the `compile` command). This is consistent with the legacy CLI.
            keywords: undefined,
            smartCasing: false,
            readme: undefined,
            version: undefined,
            packageName: undefined
        });

        const object = await this.resolveObject({ ir, dynamic, options, taskContext });
        return { object };
    }

    private async resolveObject({
        ir,
        dynamic,
        options,
        taskContext
    }: {
        ir: ReturnType<typeof generateIntermediateRepresentation>;
        dynamic: boolean;
        options: IrCompiler.Options;
        taskContext: TaskContextAdapter;
    }): Promise<unknown> {
        if (dynamic) {
            return ir.dynamic;
        }
        if (options.irVersion != null) {
            return migrateIntermediateRepresentationThroughVersion({
                intermediateRepresentation: ir,
                context: taskContext,
                version: options.irVersion
            });
        }
        return IrSerialization.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip"
        });
    }
}
