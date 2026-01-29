import { InlinedRequestBodyProperty } from "@fern-api/ir-sdk";
import { GeneratedFile } from "../../commons/GeneratedFile";
import { ExpressContext } from "..";

export interface GeneratedExpressInlinedRequestBody extends GeneratedFile<ExpressContext> {
    getPropertyKey: (property: InlinedRequestBodyProperty) => string;
}
