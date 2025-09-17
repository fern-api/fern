import {
    ExampleTypeShape,
    UndiscriminatedUnionMember,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import {
    GetReferenceOpts,
    getWriterForMultiLineUnionType,
    maybeAddDocsStructure,
    TypeReferenceNode
} from "@fern-typescript/commons";
import { BaseContext, GeneratedUndiscriminatedUnionType } from "@fern-typescript/contexts";
import {
    ModuleDeclarationKind,
    ModuleDeclarationStructure,
    StatementStructures,
    StructureKind,
    TypeAliasDeclarationStructure,
    ts,
    WriterFunction
} from "ts-morph";

import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedUndiscriminatedUnionTypeImpl<Context extends BaseContext>
    extends AbstractGeneratedType<UndiscriminatedUnionTypeDeclaration, Context>
    implements GeneratedUndiscriminatedUnionType<Context>
{
    public readonly type = "undiscriminatedUnion";

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        const statements: StatementStructures[] = [this.generateTypeAlias(context)];
        const iModule = this.generateModule(context);
        if (iModule) {
            statements.push(iModule);
        }
        return statements;
    }

    public generateForInlineUnion(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    } {
        const typeReferenceNodes = this.shape.members.map((member) => this.getTypeReferenceNode(context, member));
        return {
            typeNode: ts.factory.createUnionTypeNode(typeReferenceNodes.map((ref) => ref.typeNode)),
            requestTypeNode: ts.factory.createUnionTypeNode(
                typeReferenceNodes.map((ref) => ref.requestTypeNode ?? ref.typeNode)
            ),
            responseTypeNode: ts.factory.createUnionTypeNode(
                typeReferenceNodes.map((ref) => ref.responseTypeNode ?? ref.typeNode)
            )
        };
    }

    public generateModule(context: Context): ModuleDeclarationStructure | undefined {
        const requestResponseStatements = this.generateRequestResponseModuleStatements(context);
        if (requestResponseStatements.length === 0) {
            return undefined;
        }
        const module: ModuleDeclarationStructure = {
            kind: StructureKind.Module,
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: false,
            declarationKind: ModuleDeclarationKind.Namespace,
            statements: requestResponseStatements
        };
        return module;
    }

    private generateRequestResponseModuleStatements(
        context: Context
    ): (string | WriterFunction | StatementStructures)[] {
        if (!this.generateReadWriteOnlyTypes) {
            return [];
        }

        const statements: (string | WriterFunction | StatementStructures)[] = [];

        const typeNodeReferences = this.shape.members.map((member) => ({
            docs: member.docs,
            typeReference: this.getTypeReferenceNode(context, member)
        }));
        const anyRequestVariantsNeeded = typeNodeReferences.some((ref) => ref.typeReference.requestTypeNode != null);
        const anyResponseVariantsNeeded = typeNodeReferences.some((ref) => ref.typeReference.responseTypeNode != null);

        if (anyRequestVariantsNeeded) {
            const requestType: TypeAliasDeclarationStructure = {
                name: "Request",
                kind: StructureKind.TypeAlias,
                isExported: true,
                type: getWriterForMultiLineUnionType(
                    typeNodeReferences.map((value) => {
                        return {
                            docs: value.docs,
                            node: value.typeReference.requestTypeNode ?? value.typeReference.typeNode
                        };
                    })
                )
            };
            maybeAddDocsStructure(
                requestType,
                this.getDocs({
                    context,
                    opts: {
                        isForRequest: true
                    }
                })
            );
            statements.push(requestType);
        }
        if (anyResponseVariantsNeeded) {
            const responseType: TypeAliasDeclarationStructure = {
                name: "Response",
                kind: StructureKind.TypeAlias,
                isExported: true,
                type: getWriterForMultiLineUnionType(
                    typeNodeReferences.map((value) => {
                        return {
                            docs: value.docs,
                            node: value.typeReference.responseTypeNode ?? value.typeReference.typeNode
                        };
                    })
                )
            };
            maybeAddDocsStructure(
                responseType,
                this.getDocs({
                    context,
                    opts: {
                        isForResponse: true
                    }
                })
            );
            statements.push(responseType);
        }

        return statements;
    }

    private generateTypeAlias(context: Context): TypeAliasDeclarationStructure {
        const alias: TypeAliasDeclarationStructure = {
            name: this.typeName,
            kind: StructureKind.TypeAlias,
            isExported: true,
            type: getWriterForMultiLineUnionType(
                this.shape.members.map((value) => {
                    return {
                        docs: value.docs,
                        node: this.getTypeNode(context, value)
                    };
                })
            )
        };
        maybeAddDocsStructure(alias, this.getDocs({ context }));
        return alias;
    }

    private getTypeReferenceNode(context: Context, member: UndiscriminatedUnionMember): TypeReferenceNode {
        return context.type.getReferenceToTypeForInlineUnion(member.type);
    }

    private getTypeNode(context: Context, member: UndiscriminatedUnionMember): ts.TypeNode {
        return this.getTypeReferenceNode(context, member).typeNode;
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "undiscriminatedUnion") {
            throw new Error("Example is not for an undiscriminated union");
        }

        return context.type.getGeneratedExample(example.singleUnionType).build(context, opts);
    }
}
