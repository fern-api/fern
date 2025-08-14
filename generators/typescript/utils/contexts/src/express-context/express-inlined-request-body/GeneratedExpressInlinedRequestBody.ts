import { InlinedRequestBodyProperty } from "@fern-fern/ir-sdk/api";
import { GeneratedFile } from "../../commons/GeneratedFile";
import { ExpressContext } from "..";

export interface GeneratedExpressInlinedRequestBody extends GeneratedFile<ExpressContext> {
    getPropertyKey: (property: InlinedRequestBodyProperty) => string;
}
