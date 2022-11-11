import { Zurg } from "@fern-typescript/commons-v2";
import { Reference, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { UnionModule } from "../UnionModule";

export interface ParsedSingleUnionType {
    getDocs(): string | null | undefined;
    getDiscriminantValue(): string;
    getInterfaceName(): string;
    getRawInterfaceDeclaration(file: SdkFile): ParsedSingleUnionType.InterfaceDeclaration;
    getInterfaceDeclaration(file: SdkFile): ParsedSingleUnionType.InterfaceDeclaration;
    getSchema(file: SdkFile): Zurg.union.SingleUnionType;
    getBuilder(
        file: SdkFile,
        args: {
            referenceToBuiltType: ts.TypeNode;
            getReferenceToUnion: (file: SdkFile) => Reference;
            unionModule: UnionModule;
        }
    ): ts.ArrowFunction;
    invokeBuilder(args: {
        referenceToParsedUnionType: ts.Expression;
        localReferenceToUnionValue: ts.Expression;
    }): ts.CallExpression;
    getBuilderName(): string;
    getVisitMethod(args: { localReferenceToUnionValue: ts.Expression }): ts.ArrowFunction;
    getVisitMethodSignature(file: SdkFile): ts.FunctionTypeNode;
    getVisitorKey(): string;
    invokeVisitMethod(args: {
        localReferenceToUnionValue: ts.Expression;
        localReferenceToVisitor: ts.Expression;
    }): ts.Expression;
}

export declare namespace ParsedSingleUnionType {
    export interface InterfaceDeclaration {
        name: string;
        extends: ts.TypeNode[];
        jsonProperties: OptionalKind<PropertySignatureStructure>[];
    }
}
