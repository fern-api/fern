import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { ExpressServiceContext } from "./ExpressServiceContext";

export interface GeneratedExpressService extends GeneratedFile<ExpressServiceContext> {
    getRoute: (referenceToAbstractClass: ts.Expression) => ts.Expression;
    toRouter: (referenceToService: ts.Expression) => ts.Expression;
}
