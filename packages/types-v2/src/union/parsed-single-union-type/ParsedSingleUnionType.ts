import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface ParsedSingleUnionType {
    getDocs(): string | null | undefined;
    getDiscriminantValue(): string;
    getInterfaceName(): string;
    getRawInterfaceDeclaration(file: SdkFile): ParsedSingleUnionType.InterfaceDeclaration;
    getInterfaceDeclaration(file: SdkFile): ParsedSingleUnionType.InterfaceDeclaration;
    getSchema(file: SdkFile): Zurg.union.SingleUnionType;
    getBuilder(file: SdkFile, args: { referenceToBuiltType: ts.TypeNode }): ts.ArrowFunction;
    getBuilderName(): string;
    getVisitMethod(args: { referenceToUnionValue: ts.Expression }): ts.ArrowFunction;
    getVisitMethodSignature(file: SdkFile): ts.FunctionTypeNode;
    getVisitorKey(): string;
}

export declare namespace ParsedSingleUnionType {
    export interface InterfaceDeclaration {
        name: string;
        extends: ts.TypeNode[];
        jsonProperties: OptionalKind<PropertySignatureStructure>[];
    }
}
