import { InlinedRequestBodyProperty } from "@fern-fern/ir-sdk";

import { ExpressContext } from "..";
import { GeneratedFile } from "../../commons/GeneratedFile";

export interface GeneratedExpressInlinedRequestBody extends GeneratedFile<ExpressContext> {
    getPropertyKey: (property: InlinedRequestBodyProperty) => string;
}
