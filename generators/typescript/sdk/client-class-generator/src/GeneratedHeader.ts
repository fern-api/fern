import { ts } from "ts-morph";

export interface GeneratedHeader {
    header: string;
    value: ts.Expression;
}
