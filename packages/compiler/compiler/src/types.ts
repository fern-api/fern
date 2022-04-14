import { IntermediateRepresentation } from "@fernapi/api";
import { SyntaxAnalysis } from "@fernapi/syntax-analysis/src/types";

export declare namespace Compiler {
    export type Result = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        intermediateRepresentation: IntermediateRepresentation;
    }

    export interface FailedResult {
        didSucceed: false;
        failure: Failure;
    }

    export type Failure = SyntaxAnalysisFailure | IntermediateRepresentationFailure;

    export interface SyntaxAnalysisFailure extends SyntaxAnalysis.FailedResult {
        type: CompilerFailureType.SYNTAX_ANALYSIS;
    }

    export interface IntermediateRepresentationFailure {
        type: CompilerFailureType.IR_GENERATION;
    }
}

export enum CompilerFailureType {
    SYNTAX_ANALYSIS = "SYNTAX_ANALYSIS",
    IR_GENERATION = "IR_GENERATION",
}
