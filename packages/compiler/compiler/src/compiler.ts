import { FernFile } from "@fern-api/compiler-commons";
import { IntermediateRepresentationGenerationStage } from "@fern-api/ir-generation";
import { SyntaxAnalysisStage } from "@fern-api/syntax-analysis";
import { Compiler, CompilerFailureType } from "./types";

export async function compile(files: readonly FernFile[]): Promise<Compiler.Result> {
    const syntaxAnalysisResult = await SyntaxAnalysisStage.run(files);
    if (!syntaxAnalysisResult.didSucceed) {
        return {
            didSucceed: false,
            failure: {
                type: CompilerFailureType.SYNTAX_ANALYSIS,
                failures: syntaxAnalysisResult.failures,
            },
        };
    }

    const intermediateRepresentationResult = await IntermediateRepresentationGenerationStage.run(
        syntaxAnalysisResult.result.validatedFiles
    );
    if (!intermediateRepresentationResult.didSucceed) {
        return {
            didSucceed: false,
            failure: {
                type: CompilerFailureType.IR_GENERATION,
            },
        };
    }

    return {
        didSucceed: true,
        intermediateRepresentation: intermediateRepresentationResult.result.intermediateRepresentation,
        nonStandardEncodings: intermediateRepresentationResult.result.nonStandardEncodings,
    };
}
