import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { ExpressServiceContext } from "./ExpressServiceContext";

export interface GeneratedExpressService extends GeneratedFile<ExpressServiceContext> {
    toRouter: (referenceToService: ts.Expression) => ts.Expression;
}
