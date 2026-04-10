import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { ExpressContext } from "../ExpressContext.js";

export interface GeneratedExpressService extends GeneratedFile<ExpressContext> {
    toRouter: (referenceToService: ts.Expression) => ts.Expression;
}
