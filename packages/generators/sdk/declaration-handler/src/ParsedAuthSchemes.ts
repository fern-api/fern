import { ts } from "ts-morph";

export interface ParsedAuthSchemes {
    getProperties: () => ts.TypeElement[];
    getHeaders: (nodeWithProperties: ts.Expression) => ts.ObjectLiteralElementLike[];
}
