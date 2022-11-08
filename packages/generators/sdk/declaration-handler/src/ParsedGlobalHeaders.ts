import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface ParsedGlobalHeaders {
    getProperties: () => OptionalKind<PropertySignatureStructure>[];
    getHeaders: (nodeWithProperties: ts.Expression) => ts.ObjectLiteralElementLike[];
}
