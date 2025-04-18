import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile";
import { ExpressContext } from "../ExpressContext";

export interface GeneratedExpressService extends GeneratedFile<ExpressContext> {
    toRouter: (referenceToService: ts.Expression) => ts.Expression;
}
