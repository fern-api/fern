import { assertNever } from "@fern-api/core-utils";
import {
    ExampleTypeShape,
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
    ): string | WriterFunction | ReadonlyArray<string | WriterFunction | StatementStructures> {
        const statements: StatementStructures[] = [this.generateTypeAlias(context)];
        const inlineModule = this.generateModuleForInlineTypes(context);
        if (inlineModule) {
            statements.push(inlineModule);
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
                        node: this.getTypeReferenceNode(context, value)
                    };
                })
            )
        };
        maybeAddDocs(alias, this.getDocs(context));
        return alias;
    }

    private getTypeReferenceNode(context: Context, member: UndiscriminatedUnionMember): ts.TypeNode {
        const inlineMembers = this.getInlineMembersWithTypeDeclaration(context);
        if (inlineMembers.has(member)) {
            const typeDeclaration = inlineMembers.get(member)!;
            return ts.factory.createTypeReferenceNode(
                `${this.typeName}.${typeDeclaration.name.name.pascalCase.safeName}`
            );
        }
        return context.type.getReferenceToType(member.type).typeNode;
    }

    private generateModuleForInlineTypes(context: Context): ModuleDeclarationStructure | undefined {
        const inlineMembers = this.getInlineMembersWithTypeDeclaration(context);
        if (inlineMembers.size === 0) {
            return;
        }
        return {
            kind: StructureKind.Module,
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: false,
            declarationKind: ModuleDeclarationKind.Namespace,
            statements: Array.from(inlineMembers.entries()).flatMap(([member, typeDeclaration]) => {
                const generatedType = context.type.getGeneratedType(typeDeclaration.name);
                return generatedType.generateStatements(context);
            })
        };
    }

    private getInlineMembersWithTypeDeclaration(context: Context): Map<UndiscriminatedUnionMember, TypeDeclaration> {
        const inlineMembers = new Map<UndiscriminatedUnionMember, TypeDeclaration>(
            this.shape.members
                .map((member: UndiscriminatedUnionMember) => {
                    switch (member.type.type) {
                        case "named":
                            return [member, member.type];
                        case "container":
                            if (
                                member.type.container.type === "optional" &&
                                member.type.container.optional.type === "named"
                            ) {
                                return [member, member.type.container.optional];
                            }
                            return undefined;
                        case "primitive":
                            return undefined;
                        case "unknown":
                            return undefined;
                        default:
                            assertNever(member.type);
                    }
                })
                .filter((x): x is [UndiscriminatedUnionMember, TypeReference.Named] => x != null)
                .map(([member, type]): [UndiscriminatedUnionMember, TypeDeclaration] => {
                    return [member, context.type.getTypeDeclaration(type)];
                })
                .filter(([_, declaration]) => declaration.inline === true)
        );
        return inlineMembers;
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "undiscriminatedUnion") {
            throw new Error("Example is not for an undiscriminated union");
        }

        return context.type.getGeneratedExample(example.singleUnionType).build(context, opts);
    }
}
