import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile";
import { ExpressContext } from "../ExpressContext";

export interface GeneratedExpressErrorSchema extends GeneratedFile<ExpressContext> {
    serializeBody: (context: ExpressContext, args: { referenceToBody: ts.Expression }) => ts.Expression;
}
