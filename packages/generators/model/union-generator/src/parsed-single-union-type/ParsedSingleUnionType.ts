import { ModelContext } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { GeneratedUnionImpl } from "../GeneratedUnionImpl";

export interface ParsedSingleUnionType<Context extends ModelContext> {
    getDocs(): string | null | undefined;
    getDiscriminantValue(): string | number | undefined;
    getDiscriminantValueOrThrow(): string | number;
    getDiscriminantValueType(): ts.TypeNode;
    getInterfaceName(): string;
    getInterfaceDeclaration(
        context: Context,
        generatedUnion: GeneratedUnionImpl<Context>
    ): ParsedSingleUnionType.InterfaceDeclaration;
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
        extends: ts.TypeNode[];
        jsonProperties: OptionalKind<PropertySignatureStructure>[];
    }
}
