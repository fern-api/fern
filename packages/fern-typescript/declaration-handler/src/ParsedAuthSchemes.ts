import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface ParsedAuthSchemes {
    getProperties: () => OptionalKind<PropertySignatureStructure>[];
    getHeaders: (nodeWithProperties: ts.Expression) => ts.ObjectLiteralElementLike[];
}
