import type * as SeedApi from "../../../index.mjs";
export type V2V3TestCaseImplementationDescriptionBoard = SeedApi.trace.V2V3TestCaseImplementationDescriptionBoard.Html | SeedApi.trace.V2V3TestCaseImplementationDescriptionBoard.ParamId;
export declare namespace V2V3TestCaseImplementationDescriptionBoard {
    interface Html {
        type: "html";
        value?: string | undefined;
    }
    interface ParamId {
        type: "paramId";
        value?: SeedApi.trace.V2V3ParameterId | undefined;
    }
}
