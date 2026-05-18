import type * as SeedApi from "../../../index.mjs";
export type V2TestCaseImplementationDescriptionBoard = SeedApi.trace.V2TestCaseImplementationDescriptionBoard.Html | SeedApi.trace.V2TestCaseImplementationDescriptionBoard.ParamId;
export declare namespace V2TestCaseImplementationDescriptionBoard {
    interface Html {
        type: "html";
        value?: string | undefined;
    }
    interface ParamId {
        type: "paramId";
        value?: SeedApi.trace.V2ParameterId | undefined;
    }
}
