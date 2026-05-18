import type * as SeedApi from "../../../index.js";
export interface FunctionCallHistoryMessage {
    type: FunctionCallHistoryMessage.Type;
    function_calls: SeedApi.javaWebsocketSharedDiscriminator.FunctionCall[];
}
export declare namespace FunctionCallHistoryMessage {
    const Type: {
        readonly History: "History";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
