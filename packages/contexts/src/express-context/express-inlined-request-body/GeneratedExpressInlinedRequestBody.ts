import { InlinedRequestBodyProperty } from "@fern-fern/ir-model/http";
import { ExpressContext } from "..";
import { GeneratedFile } from "../../commons/GeneratedFile";

export interface GeneratedExpressInlinedRequestBody extends GeneratedFile<ExpressContext> {
    getPropertyKey: (property: InlinedRequestBodyProperty) => string;
}
