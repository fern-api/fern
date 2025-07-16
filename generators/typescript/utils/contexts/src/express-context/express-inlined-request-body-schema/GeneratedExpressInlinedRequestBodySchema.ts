import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile";
import { ExpressContext } from "../ExpressContext";

export interface GeneratedExpressInlinedRequestBodySchema extends GeneratedFile<ExpressContext> {
    deserializeRequest: (referenceToRawRequest: ts.Expression, context: ExpressContext) => ts.Expression;
}
