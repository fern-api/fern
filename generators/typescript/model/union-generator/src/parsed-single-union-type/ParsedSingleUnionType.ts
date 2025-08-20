import { ModelContext } from "@fern-typescript/contexts";
import { ModuleDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

import { GeneratedUnionImpl } from "../GeneratedUnionImpl";

export interface ParsedSingleUnionType<Context extends ModelContext> {
    getDocs(): string | null | undefined;
    getDiscriminantValue(): string | number | undefined;
    getDiscriminantValueAsExpression: () => ts.Expression;
    getDiscriminantValueOrThrow(): string | number;
    getDiscriminantValueType(): ts.TypeNode;
    getTypeName(): string;
    needsRequestResponse(context: Context): { request: boolean; response: boolean };
    getInterfaceDeclaration(
        context: Context,
        generatedUnion: GeneratedUnionImpl<Context>
    ): ParsedSingleUnionType.InterfaceDeclaration;
    generateForInlineUnion(
        context: Context,
        generatedUnion: GeneratedUnionImpl<Context>
    ): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    };
    getBuilder(context: Context, generatedUnion: GeneratedUnionImpl<Context>): ts.ArrowFunction;
    getBuilderName(): string;
    getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[];
    getVisitMethod(args: { localReferenceToUnionValue: ts.Expression }): ts.ArrowFunction;
    getVisitMethodSignature(context: Context, generatedUnion: GeneratedUnionImpl<Context>): ts.FunctionTypeNode;
    getVisitorKey(): string;
    invokeVisitMethod(args: {
        localReferenceToUnionValue: ts.Expression;
        localReferenceToVisitor: ts.Expression;
    }): ts.Expression;
}

export declare namespace ParsedSingleUnionType {
    export interface InterfaceDeclaration {
        name: string;
        extends: {
            typeNode: ts.TypeNode;
            requestTypeNode: ts.TypeNode | undefined;
            responseTypeNode: ts.TypeNode | undefined;
        }[];
        properties: {
            property: PropertySignatureStructure;
            requestProperty: PropertySignatureStructure | undefined;
            responseProperty: PropertySignatureStructure | undefined;
            isReadonly: boolean;
            isWriteonly: boolean;
        }[];
        module: ModuleDeclarationStructure | undefined;
    }
}
