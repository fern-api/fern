import type * as SeedApi from "../../../index.mjs";
export type ProblemDescriptionBoard = SeedApi.trace.ProblemDescriptionBoard.Html | SeedApi.trace.ProblemDescriptionBoard.Variable | SeedApi.trace.ProblemDescriptionBoard.TestCaseId;
export declare namespace ProblemDescriptionBoard {
    interface Html {
        type: "html";
        value?: string | undefined;
    }
    interface Variable {
        type: "variable";
        value?: SeedApi.trace.VariableValue | undefined;
    }
    interface TestCaseId {
        type: "testCaseId";
        value?: string | undefined;
    }
}
