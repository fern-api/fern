import { ExampleTypeShape, TypeReference } from "@fern-fern/ir-sdk/api";
import {
    GetReferenceOpts,
    generateInlineAliasModule,
    getTextOfTsNode,
    maybeAddDocsStructure
} from "@fern-typescript/commons";
import { BaseContext, NotBrandedGeneratedAliasType } from "@fern-typescript/contexts";
import {
    ModuleDeclarationStructure,
    StatementStructures,
    StructureKind,
    TypeAliasDeclarationStructure,
    ts,
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

    public generateForInlineUnion(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    } {
        const typeReference = context.type.getReferenceToType(this.shape);
        return {
            typeNode: typeReference.typeNode,
            requestTypeNode: typeReference.requestTypeNode,
            responseTypeNode: typeReference.responseTypeNode
        };
    }

    private generateTypeAlias(context: Context): TypeAliasDeclarationStructure {
        const typeAlias: TypeAliasDeclarationStructure = {
            kind: StructureKind.TypeAlias,
            name: this.typeName,
            type: getTextOfTsNode(context.type.getReferenceToInlineAliasType(this.shape, this.typeName).typeNode),
            isExported: true
        };
        maybeAddDocsStructure(typeAlias, this.getDocs({ context }));
        return typeAlias;
    }

    public generateModule(context: Context): ModuleDeclarationStructure | undefined {
        if (!this.enableInlineTypes) {
            return undefined;
        }

        return generateInlineAliasModule({
            aliasTypeName: this.typeName,
            typeReference: this.shape,
            generateStatements: (typeName, typeNameOverride) =>
                context.type.getGeneratedType(typeName, typeNameOverride).generateStatements(context),
            getTypeDeclaration: (namedType) => context.type.getTypeDeclaration(namedType)
        });
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts, recursionGuard?: RecursionGuard): ts.Expression {
        if (example.type !== "alias") {
            throw new Error("Example is not for an alias");
        }
        return context.type.getGeneratedExample(example.value).build(context, opts);
    }
}
