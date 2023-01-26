import { InlinedRequestBodyProperty } from "@fern-fern/ir-model/http";
import { GeneratedFile } from "../commons/GeneratedFile";
import { ExpressInlinedRequestBodyContext } from "./ExpressInlinedRequestBodyContext";

export interface GeneratedExpressInlinedRequestBody extends GeneratedFile<ExpressInlinedRequestBodyContext> {
    getPropertyKey: (property: InlinedRequestBodyProperty) => string;
}
