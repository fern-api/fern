import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    GetReferenceOpts,
    getPropertyKey,
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
import { AbstractGeneratedType } from "../AbstractGeneratedType.js";

export class GeneratedUndiscriminatedUnionTypeImpl<Context extends BaseContext>
    extends AbstractGeneratedType<FernIr.UndiscriminatedUnionTypeDeclaration, Context>
    implements GeneratedUndiscriminatedUnionType<Context>
{
    public readonly type = "undiscriminatedUnion";

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        const statements: StatementStructures[] = [];

        statements.push(this.generateTypeAlias(context));

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
        const members = this.shape.members.map((member) => ({
            member,
            ref: this.getTypeReferenceNode(context, member)
        }));
        return {
            typeNode: ts.factory.createUnionTypeNode(
                members.map(({ member, ref }) =>
                    this.intersectWithBaseProperties(context, member, ref.typeNode, "normal")
                )
            ),
            requestTypeNode: ts.factory.createUnionTypeNode(
                members.map(({ member, ref }) =>
                    this.intersectWithBaseProperties(context, member, ref.requestTypeNode ?? ref.typeNode, "request")
                )
            ),
            responseTypeNode: ts.factory.createUnionTypeNode(
                members.map(({ member, ref }) =>
                    this.intersectWithBaseProperties(context, member, ref.responseTypeNode ?? ref.typeNode, "response")
                )
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

    public getBasePropertyKey({ propertyWireKey }: { propertyWireKey: string }): string {
        const property = this.getBaseProperties().find((property) => getWireValue(property.name) === propertyWireKey);
        if (property == null) {
            throw new Error("Base property does not exist: " + propertyWireKey);
        }
        return this.getPropertyKeyFromProperty(property);
    }

    public appliesBasePropertiesToMember(context: Context, member: FernIr.UndiscriminatedUnionMember): boolean {
        if (this.getBaseProperties().length === 0) {
            return false;
        }
        const resolved = context.type.resolveTypeReference(member.type);
        return resolved.type === "named" && resolved.shape === FernIr.ShapeType.Object;
    }

    private getBaseProperties(): FernIr.ObjectProperty[] {
        return this.shape.baseProperties ?? [];
    }

    private getPropertyKeyFromProperty(property: FernIr.ObjectProperty): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return this.case.camelUnsafe(property.name);
        }
        return getWireValue(property.name);
    }

    private getBasePropertyNodes(context: Context): BasePropertyNode[] {
        return this.getBaseProperties().map((property) => {
            const type = context.type.getReferenceToType(property.valueType);
            const shouldIncludeUndefined = type.isOptional && !this.includeSerdeLayer;
            const undefinedKw = ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
            const toTypeNode = (node: ts.TypeNode, nodeWithoutUndefined: ts.TypeNode | undefined): ts.TypeNode =>
                this.noOptionalProperties
                    ? node
                    : shouldIncludeUndefined
                      ? ts.factory.createUnionTypeNode([nodeWithoutUndefined ?? node, undefinedKw])
                      : (nodeWithoutUndefined ?? node);
            return {
                name: getPropertyKey(this.getPropertyKeyFromProperty(property)),
                hasQuestionToken: !this.noOptionalProperties && type.isOptional,
                isReadonly: this.generateReadWriteOnlyTypes && property.propertyAccess === "READ_ONLY",
                isWriteonly: this.generateReadWriteOnlyTypes && property.propertyAccess === "WRITE_ONLY",
                typeNode: toTypeNode(type.typeNode, type.typeNodeWithoutUndefined),
                requestTypeNode:
                    this.generateReadWriteOnlyTypes && type.requestTypeNode != null
                        ? toTypeNode(type.requestTypeNode, type.requestTypeNodeWithoutUndefined)
                        : undefined,
                responseTypeNode:
                    this.generateReadWriteOnlyTypes && type.responseTypeNode != null
                        ? toTypeNode(type.responseTypeNode, type.responseTypeNodeWithoutUndefined)
                        : undefined
            };
        });
    }

    private intersectWithBaseProperties(
        context: Context,
        member: FernIr.UndiscriminatedUnionMember,
        memberNode: ts.TypeNode,
        whatFor: "normal" | "request" | "response"
    ): ts.TypeNode {
        if (!this.appliesBasePropertiesToMember(context, member)) {
            return memberNode;
        }
        const baseProperties = this.getBasePropertyNodes(context).filter((property) => {
            switch (whatFor) {
                case "normal":
                    return true;
                case "request":
                    return !property.isReadonly;
                case "response":
                    return !property.isWriteonly;
            }
        });
        const selectTypeNode = (property: BasePropertyNode): ts.TypeNode => {
            switch (whatFor) {
                case "normal":
                    return property.typeNode;
                case "request":
                    return property.requestTypeNode ?? property.typeNode;
                case "response":
                    return property.responseTypeNode ?? property.typeNode;
            }
        };
        return ts.factory.createParenthesizedType(
            ts.factory.createIntersectionTypeNode([
                memberNode,
                ts.factory.createTypeLiteralNode(
                    baseProperties.map((property) =>
                        ts.factory.createPropertySignature(
                            undefined,
                            ts.factory.createIdentifier(property.name),
                            property.hasQuestionToken ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                            selectTypeNode(property)
                        )
                    )
                )
            ])
        );
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
            member: member,
            typeReference: this.getTypeReferenceNode(context, member)
        }));
        const basePropertyNodes = this.getBasePropertyNodes(context);
        const anyRequestVariantsNeeded =
            typeNodeReferences.some((ref) => ref.typeReference.requestTypeNode != null) ||
            basePropertyNodes.some((property) => property.isReadonly || property.requestTypeNode != null);
        const anyResponseVariantsNeeded =
            typeNodeReferences.some((ref) => ref.typeReference.responseTypeNode != null) ||
            basePropertyNodes.some((property) => property.isWriteonly || property.responseTypeNode != null);

        if (anyRequestVariantsNeeded) {
            const requestType: TypeAliasDeclarationStructure = {
                name: "Request",
                kind: StructureKind.TypeAlias,
                isExported: true,
                type: getWriterForMultiLineUnionType(
                    typeNodeReferences.map((value) => {
                        const requestNode = value.typeReference.requestTypeNode ?? value.typeReference.typeNode;
                        return {
                            docs: value.docs,
                            node: this.intersectWithBaseProperties(
                                context,
                                value.member,
                                this.applyIndexSignatureSubstitution(context, value.member, requestNode),
                                "request"
                            )
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
                        const responseNode = value.typeReference.responseTypeNode ?? value.typeReference.typeNode;
                        return {
                            docs: value.docs,
                            node: this.intersectWithBaseProperties(
                                context,
                                value.member,
                                this.applyIndexSignatureSubstitution(context, value.member, responseNode),
                                "response"
                            )
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
                        node: this.intersectWithBaseProperties(
                            context,
                            value,
                            this.getTypeNodeForMember(context, value),
                            "normal"
                        )
                    };
                })
            )
        };
        maybeAddDocsStructure(alias, this.getDocs({ context }));
        return alias;
    }

    private getTypeReferenceNode(context: Context, member: FernIr.UndiscriminatedUnionMember): TypeReferenceNode {
        return context.type.getReferenceToTypeForInlineUnion(member.type);
    }

    private getTypeNode(context: Context, member: FernIr.UndiscriminatedUnionMember): ts.TypeNode {
        return this.getTypeReferenceNode(context, member).typeNode;
    }

    public buildExample(example: FernIr.ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "undiscriminatedUnion") {
            throw new Error("Example is not for an undiscriminated union");
        }

        return context.type.getGeneratedExample(example.singleUnionType).build(context, opts);
    }

    private isSelfRecursive(context: Context, typeRef: FernIr.TypeReference): boolean {
        const unwrappedRef = unwrapOptionalAndNullable(typeRef);
        if (unwrappedRef.type !== "named") {
            return false;
        }

        const namedTypeDeclaration = context.type.getTypeDeclaration(unwrappedRef);
        return this.case.pascalUnsafe(namedTypeDeclaration.name.name) === this.typeName;
    }

    private applyIndexSignatureSubstitution(
        context: Context,
        member: FernIr.UndiscriminatedUnionMember,
        typeNode: ts.TypeNode
    ): ts.TypeNode {
        if (member.type.type !== "container") {
            return typeNode;
        }

        const container = member.type.container;

        if (container.type === "map" && this.isSelfRecursive(context, container.valueType)) {
            return ts.factory.createTypeLiteralNode([
                ts.factory.createIndexSignature(
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            "key",
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                        )
                    ],
                    ts.factory.createTypeReferenceNode(this.typeName)
                )
            ]);
        }

        return typeNode;
    }

    private getTypeNodeForMember(context: Context, member: FernIr.UndiscriminatedUnionMember): ts.TypeNode {
        if (member.type.type !== "container") {
            return this.getTypeNode(context, member);
        }

        const container = member.type.container;

        if (container.type === "map" && this.isSelfRecursive(context, container.valueType)) {
            return ts.factory.createTypeLiteralNode([
                ts.factory.createIndexSignature(
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            "key",
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                        )
                    ],
                    ts.factory.createTypeReferenceNode(this.typeName)
                )
            ]);
        }

        return this.getTypeNode(context, member);
    }
}

interface BasePropertyNode {
    name: string;
    hasQuestionToken: boolean;
    isReadonly: boolean;
    isWriteonly: boolean;
    typeNode: ts.TypeNode;
    requestTypeNode: ts.TypeNode | undefined;
    responseTypeNode: ts.TypeNode | undefined;
}

function unwrapOptionalAndNullable(typeReference: FernIr.TypeReference): FernIr.TypeReference {
    if (typeReference.type === "container") {
        if (typeReference.container.type === "optional") {
            return unwrapOptionalAndNullable(typeReference.container.optional);
        }
        if (typeReference.container.type === "nullable") {
            return unwrapOptionalAndNullable(typeReference.container.nullable);
        }
    }

    return typeReference;
}
