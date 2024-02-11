import { ts } from "ts-morph";

export interface UrlJoin {
    invoke: (paths: ts.Expression[]) => ts.Expression;
}
