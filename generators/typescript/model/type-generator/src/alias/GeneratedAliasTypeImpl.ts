import { assertNever } from "@fern-api/core-utils";
import { ExampleTypeShape, MapType, NamedType, TypeReference } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getTextOfTsNode, maybeAddDocsStructure, writerToString } from "@fern-typescript/commons";
import { BaseContext, NotBrandedGeneratedAliasType } from "@fern-typescript/contexts";
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

export class GeneratedAliasTypeImpl<Context extends BaseContext>
    extends AbstractGeneratedType<TypeReference, Context>
    implements NotBrandedGeneratedAliasType<Context>
{
    public readonly type = "alias";
    public readonly isBranded = false;

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        const statements: StatementStructures[] = [this.generateTypeAlias(context)];
        const module = this.generateModule(context);
        if (module) {
            statements.push(module);
        }
        return statements;
    }

    public generateForInlineUnion(context: Context): ts.TypeNode {
        return context.type.getReferenceToType(this.shape).typeNode;
    }

    private generateTypeAlias(context: Context): TypeAliasDeclarationStructure {
        const typeAlias: TypeAliasDeclarationStructure = {
            kind: StructureKind.TypeAlias,
            name: this.typeName,
            type: getTextOfTsNode(context.type.getReferenceToInlineAliasType(this.shape, this.typeName).typeNode),
            isExported: true
        };
        maybeAddDocsStructure(typeAlias, this.getDocs(context));
        return typeAlias;
    }

    public generateModule(context: Context): ModuleDeclarationStructure | undefined {
        if (!this.inlineInlineTypes) {
            return undefined;
        }

        const listOrSetStatementGenerator = (
            listItemType: TypeReference
        ): undefined | string | WriterFunction | (string | WriterFunction | StatementStructures)[] => {
            const namedType = getNamedType(listItemType);
            if (!namedType) {
                return undefined;
            }
            const typeDeclaration = context.type.getTypeDeclaration(namedType);
            if (typeDeclaration.inline !== true) {
                return undefined;
            }

            const itemTypeName = "Item";
            return context.type.getGeneratedType(typeDeclaration.name, itemTypeName).generateStatements(context);
        };
        const inlineModuleStatements = generateTypeVisitor(this.shape, {
            list: listOrSetStatementGenerator,
            set: listOrSetStatementGenerator,
            map: (mapType: MapType) => {
                const valueTypeName = "Value";
                const namedType = getNamedType(mapType.valueType);
                if (!namedType) {
                    return undefined;
                }
                const typeDeclaration = context.type.getTypeDeclaration(namedType);
                if (typeDeclaration.inline !== true) {
                    return undefined;
                }

                return context.type.getGeneratedType(typeDeclaration.name, valueTypeName).generateStatements(context);
            },
            other: () => {
                return undefined;
            }
        });
        if (!inlineModuleStatements) {
            return undefined;
        }
        return {
            kind: StructureKind.Module,
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: false,
            declarationKind: ModuleDeclarationKind.Namespace,
            statements: inlineModuleStatements
        };
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "alias") {
            throw new Error("Example is not for an alias");
        }
        return context.type.getGeneratedExample(example.value).build(context, opts);
    }
}
function generateTypeVisitor<TOut>(
    typeReference: TypeReference,
    visitor: {
        list: (listItemType: TypeReference) => TOut;
        map: (mapType: MapType) => TOut;
        set: (setItemType: TypeReference) => TOut;
        other: () => TOut;
    }
): TOut {
    return typeReference._visit({
        named: visitor.other,
        primitive: visitor.other,
        unknown: visitor.other,
        container: (containerType) =>
            containerType._visit({
                list: visitor.list,
                literal: visitor.other,
                map: visitor.map,
                set: visitor.set,
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
        // fallthrough
        case "primitive":
            return undefined;
        case "unknown":
            return undefined;
        default:
            assertNever(typeReference);
    }
}
