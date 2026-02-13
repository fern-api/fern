import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { ExpressContext } from "../ExpressContext.js";

export interface GeneratedExpressInlinedRequestBodySchema extends GeneratedFile<ExpressContext> {
    deserializeRequest: (referenceToRawRequest: ts.Expression, context: ExpressContext) => ts.Expression;
}
