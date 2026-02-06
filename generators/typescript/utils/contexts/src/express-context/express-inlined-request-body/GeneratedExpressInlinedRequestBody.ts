import { InlinedRequestBodyProperty } from "@fern-fern/ir-sdk/api";
import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { ExpressContext } from "../index.js";

export interface GeneratedExpressInlinedRequestBody extends GeneratedFile<ExpressContext> {
    getPropertyKey: (property: InlinedRequestBodyProperty) => string;
}
