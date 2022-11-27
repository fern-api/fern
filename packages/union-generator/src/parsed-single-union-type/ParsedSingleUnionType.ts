import { TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { GeneratedUnionImpl } from "../GeneratedUnionImpl";

export interface ParsedSingleUnionType<Context extends TypeContext> {
    getDocs(): string | null | undefined;
    getDiscriminantValue(): string;
    getInterfaceName(): string;
    getInterfaceDeclaration(context: Context): ParsedSingleUnionType.InterfaceDeclaration;
    getBuilder(context: Context, generatedUnion: GeneratedUnionImpl<Context>): ts.ArrowFunction;
    getBuilderName(): string;
    getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[];
    getVisitMethod(args: { localReferenceToUnionValue: ts.Expression }): ts.ArrowFunction;
    getVisitMethodSignature(context: Context): ts.FunctionTypeNode;
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
