import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { ExpressContext } from "../ExpressContext.js";

export interface GeneratedExpressErrorSchema extends GeneratedFile<ExpressContext> {
    serializeBody: (context: ExpressContext, args: { referenceToBody: ts.Expression }) => ts.Expression;
}
