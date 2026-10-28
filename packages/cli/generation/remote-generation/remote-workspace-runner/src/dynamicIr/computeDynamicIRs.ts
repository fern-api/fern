import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { generatorsYml } from "@fern-api/configuration";
import { convertIrToDynamicSnippetsIr, generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { dynamic } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";

/** One snippet language's dynamic IR to generate for a docs API. */
export interface DynamicIrGeneratorJob {
    language: generatorsYml.GenerationLanguage;
    smartCasing: boolean;
    smartCasingDigitWordBoundary: boolean | undefined;
    packageName: string;
    dynamicGeneratorConfig: dynamic.GeneratorConfig | undefined;
}

/** The dynamic IR generated for each job, in job order (`undefined` if conversion produced none). */
export type DynamicIrResults = Array<[language: string, dynamicIR: unknown]>;

export function computeDynamicIRs({
    workspace,
    generators,
    context
}: {
    workspace: FernWorkspace;
    generators: DynamicIrGeneratorJob[];
    context: TaskContext;
}): DynamicIrResults {
    return generators.map((generator) => {
        const irForDynamicSnippets = generateIntermediateRepresentation({
            workspace,
            generationLanguage: generator.language,
            keywords: undefined,
            smartCasing: generator.smartCasing,
            smartCasingDigitWordBoundary: generator.smartCasingDigitWordBoundary,
            exampleGeneration: {
                disabled: true,
                skipAutogenerationIfManualExamplesExist: true,
                skipErrorAutogenerationIfManualErrorExamplesExist: true
            },
            audiences: {
                type: "all"
            },
            readme: undefined,
            packageName: generator.packageName,
            version: undefined,
            context,
            sourceResolver: new SourceResolverImpl(context, workspace),
            dynamicGeneratorConfig: generator.dynamicGeneratorConfig
        });

        const dynamicIR = convertIrToDynamicSnippetsIr({
            ir: irForDynamicSnippets,
            disableExamples: true,
            smartCasing: generator.smartCasing,
            smartCasingDigitWordBoundary: generator.smartCasingDigitWordBoundary,
            generationLanguage: generator.language,
            generatorConfig: generator.dynamicGeneratorConfig
        });
        return [generator.language, dynamicIR];
    });
}
