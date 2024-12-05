import { assertNever } from "@fern-api/core-utils";
import {
    ExampleTypeShape,
    MapType,
    NamedType,
    TypeDeclaration,
    TypeReference,
    UndiscriminatedUnionMember,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getWriterForMultiLineUnionType, maybeAddDocs } from "@fern-typescript/commons";
import { GeneratedUndiscriminatedUnionType, ModelContext } from "@fern-typescript/contexts";
import {
    ModuleDeclarationKind,
    ModuleDeclarationStructure,
    StatementStructures,
    StructureKind,
    ts,
    TypeAliasDeclarationStructure,
    WriterFunction
} from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedUndiscriminatedUnionTypeImpl<Context extends ModelContext>
    extends AbstractGeneratedType<UndiscriminatedUnionTypeDeclaration, Context>
    implements GeneratedUndiscriminatedUnionType<Context>
{
    public readonly type = "undiscriminatedUnion";

    public writeToFile(context: Context): void {
        context.sourceFile.addStatements(this.generateStatements(context));
    }

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        const statements: StatementStructures[] = [this.generateTypeAlias(context)];
        return statements;
    }

    public generateForInlineUnion(context: Context): ts.TypeNode {
        return ts.factory.createUnionTypeNode(this.shape.members.map((value) => this.getTypeNode(context, value)));
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
        maybeAddDocs(alias, this.getDocs(context));
        return alias;
    }

    private getTypeNode(context: Context, member: UndiscriminatedUnionMember): ts.TypeNode {
        const inlineMembers = this.getInlineMembersWithTypeDeclaration(context);
        if (inlineMembers.has(member)) {
            const typeDeclaration = inlineMembers.get(member)!;
            const generatedType = context.type.getGeneratedType(typeDeclaration.name);
            return generateTypeVisitor(member.type, {
                named: () => generatedType.generateForInlineUnion(context),
                list: () => ts.factory.createArrayTypeNode(generatedType.generateForInlineUnion(context)),
                map: (mapType) => {
                    const keyTypeReference = context.type.getReferenceToType(mapType.keyType);
                    const valueTypeReference = context.type.getReferenceToType(mapType.valueType);
                    const namedValueType = getNamedType(mapType.valueType);
                    let valueTypeNode: ts.TypeNode;
                    const getValueTypeReferenceNode = () =>
                        this.noOptionalProperties
                            ? valueTypeReference.typeNode
                            : valueTypeReference.typeNodeWithoutUndefined;
                    if (namedValueType) {
                        const valueTypeDeclaration = context.type.getTypeDeclaration(namedValueType);
                        if (valueTypeDeclaration.inline === true) {
                            const generatedValueType = context.type.getGeneratedType(valueTypeDeclaration.name);
                            valueTypeNode = generatedValueType.generateForInlineUnion(context);
                        } else {
                            valueTypeNode = getValueTypeReferenceNode();
                        }
                    } else {
                        valueTypeNode = getValueTypeReferenceNode();
                    }

                    return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                        keyTypeReference.typeNode,
                        valueTypeNode
                    ]);
                },
                set: () => ts.factory.createArrayTypeNode(generatedType.generateForInlineUnion(context)),
                other: () => {
                    throw new Error("boo");
                }
            });
        }
        return context.type.getReferenceToType(member.type).typeNode;
    }

    private getInlineMembersWithTypeDeclaration(context: Context): Map<UndiscriminatedUnionMember, TypeDeclaration> {
        const inlineProperties = new Map<UndiscriminatedUnionMember, TypeDeclaration>(
            this.shape.members
                .map((member): [UndiscriminatedUnionMember, NamedType] | undefined => {
                    const namedType = getNamedType(member.type);
                    if (namedType) return [member, namedType];
                    return undefined;
                })
                .filter((x): x is [UndiscriminatedUnionMember, NamedType] => x !== undefined)
                .map(([member, type]): [UndiscriminatedUnionMember, TypeDeclaration] => {
                    return [member, context.type.getTypeDeclaration(type)];
                })
                .filter(([_, type]) => type.inline === true)
        );
        return inlineProperties;
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "undiscriminatedUnion") {
            throw new Error("Example is not for an undiscriminated union");
        }

        return context.type.getGeneratedExample(example.singleUnionType).build(context, opts);
    }
}

function generateTypeVisitor<TOut>(
    typeReference: TypeReference,
    visitor: {
        named: (type: NamedType) => TOut;
        list: (type: TypeReference) => TOut;
        map: (type: MapType) => TOut;
        set: (type: TypeReference) => TOut;
        other: () => TOut;
    }
): TOut {
    return typeReference._visit({
        named: visitor.named,
        primitive: visitor.other,
        unknown: visitor.other,
        container: (containerType) =>
            containerType._visit({
                list: (type) => visitor.list(type),
                literal: visitor.other,
                map: (type) => visitor.map(type),
                set: (type) => visitor.set(type),
                optional: (typeReference) => generateTypeVisitor(typeReference, visitor),
                _other: visitor.other
            }),
        _other: visitor.other
    });
}

function getNamedType(typeReference: TypeReference): NamedType | undefined {
    switch (typeReference.type) {
        case "named":
            return typeReference;
        case "container":
            switch (typeReference.container.type) {
                case "optional":
                    return getNamedType(typeReference.container.optional);
                case "list":
                    return getNamedType(typeReference.container.list);
                case "map":
                    return getNamedType(typeReference.container.valueType);
                case "set":
                    return getNamedType(typeReference.container.set);
                case "literal":
                    return undefined;
                default:
                    assertNever(typeReference.container);
            }
        case "primitive":
            return undefined;
        case "unknown":
            return undefined;
        default:
            assertNever(typeReference);
    }
}
