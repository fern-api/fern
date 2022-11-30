import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { WithBaseContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { RawSingleUnionType } from "./RawSingleUnionType";

export declare namespace GeneratedUnionSchema {
    export interface Init<Context> extends AbstractGeneratedSchema.Init {
        discriminant: WireStringWithAllCasings;
        getParsedDiscriminant: (context: Context) => string;
        getReferenceToParsedUnion: (context: Context) => ts.TypeNode;
        buildParsedUnion: (args: {
            discriminantValueToBuild: string;
            existingValue: ts.Expression;
            context: Context;
        }) => ts.Expression;
        singleUnionTypes: RawSingleUnionType<Context>[];
        getDefaultCaseForParseTransform?: (args: { context: Context; parsedValue: ts.Expression }) => ts.Statement[];
    }
}

export class GeneratedUnionSchema<Context extends WithBaseContextMixin> extends AbstractGeneratedSchema<Context> {
    private static VALUE_PARAMETER_NAME = "value";

    private discriminant: WireStringWithAllCasings;
    private getParsedDiscriminant: (context: Context) => string;
    private getReferenceToParsedUnion: (context: Context) => ts.TypeNode;
    private buildParsedUnion: (args: {
        discriminantValueToBuild: string;
        existingValue: ts.Expression;
        context: Context;
    }) => ts.Expression;
    private singleUnionTypes: RawSingleUnionType<Context>[];
    private getDefaultCaseForParseTransform:
        | ((args: { context: Context; parsedValue: ts.Expression }) => ts.Statement[])
        | undefined;

    constructor({
        discriminant,
        getParsedDiscriminant,
        getReferenceToParsedUnion,
        buildParsedUnion,
        singleUnionTypes,
        getDefaultCaseForParseTransform,
        ...superInit
    }: GeneratedUnionSchema.Init<Context>) {
        super(superInit);
        this.getParsedDiscriminant = getParsedDiscriminant;
        this.getReferenceToParsedUnion = getReferenceToParsedUnion;
        this.buildParsedUnion = buildParsedUnion;
        this.discriminant = discriminant;
        this.singleUnionTypes = singleUnionTypes;
        this.getDefaultCaseForParseTransform = getDefaultCaseForParseTransform;
    }

    public override generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void {
        const interfaces = this.singleUnionTypes.map((singleUnionType) => singleUnionType.generateInterface(context));

        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    interfaces.map((interface_) =>
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(this.getModuleName()),
                                interface_.name
                            )
                        )
                    )
                )
            ),
        });

        module.addInterfaces(interfaces);
    }

    protected override getReferenceToParsedShape(context: Context): ts.TypeNode {
        return this.getReferenceToParsedUnion(context);
    }

    public override getSchema(context: Context): Zurg.Schema {
        return context.base.coreUtilities.zurg
            .union({
                parsedDiscriminant: this.getParsedDiscriminant(context),
                rawDiscriminant: this.discriminant.wireValue,
                singleUnionTypes: this.singleUnionTypes.map((singleUnionType) => singleUnionType.getSchema(context)),
            })
            .transform({
                newShape: this.getReferenceToParsedShape(context),
                parse: this.generateAddVisitTransform(context),
                json: ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME),
                            undefined,
                            undefined
                        ),
                    ],
                    undefined,
                    undefined,
                    ts.factory.createAsExpression(
                        ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                    )
                ),
            });
    }

    public override writeSchemaToFile(context: Context): void {
        if (this.singleUnionTypes.length > 0) {
            super.writeSchemaToFile(context);
        }
    }

    private generateAddVisitTransform(context: Context): ts.Expression {
        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME),
                    undefined,
                    undefined
                ),
            ],
            undefined,
            undefined,
            ts.factory.createBlock(
                [
                    ts.factory.createSwitchStatement(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME),
                            this.getParsedDiscriminant(context)
                        ),
                        ts.factory.createCaseBlock(this.getSwitchClauses(context))
                    ),
                ],
                true
            )
        );
    }

    private getSwitchClauses(context: Context): ts.CaseOrDefaultClause[] {
        const clauses: ts.CaseOrDefaultClause[] = this.singleUnionTypes.map((singleUnionType) =>
            ts.factory.createCaseClause(ts.factory.createStringLiteral(singleUnionType.discriminantValue), [
                ts.factory.createReturnStatement(
                    this.buildParsedUnion({
                        discriminantValueToBuild: singleUnionType.discriminantValue,
                        existingValue: ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME),
                        context,
                    })
                ),
            ])
        );
        if (this.getDefaultCaseForParseTransform != null) {
            clauses.push(
                ts.factory.createDefaultClause(
                    this.getDefaultCaseForParseTransform({
                        context,
                        parsedValue: ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME),
                    })
                )
            );
        }
        return clauses;
    }
}
