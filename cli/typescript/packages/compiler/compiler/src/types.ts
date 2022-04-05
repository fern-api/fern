import { SyntaxAnalysis } from "@fern/syntax-analysis/src/types";
import { IntermediateRepresentation } from "@usebirch/ir-generation";

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
        type: FailureType.SYNTAX_ANALYSIS;
    }

    export interface IntermediateRepresentationFailure {
        type: FailureType.IR_GENERATION;
    }

    export enum FailureType {
        SYNTAX_ANALYSIS = "SYNTAX_ANALYSIS",
        IR_GENERATION = "IR_GENERATION",
    }
}
