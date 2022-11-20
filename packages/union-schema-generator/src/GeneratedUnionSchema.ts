import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { GeneratedUnion, TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { RawSingleUnionType } from "./RawSingleUnionType";

export declare namespace GeneratedUnionSchema {
    export interface Init<Context extends TypeSchemaContext> extends AbstractGeneratedSchema.Init {
        discriminant: WireStringWithAllCasings;
        getGeneratedUnion: (context: Context) => GeneratedUnion<Context>;
        singleUnionTypes: RawSingleUnionType<Context>[];
        getDefaultCaseForParseTransform?: (args: { context: Context; parsedValue: ts.Expression }) => ts.Statement[];
    }
}

export class GeneratedUnionSchema<Context extends TypeSchemaContext> extends AbstractGeneratedSchema<Context> {
    private static VALUE_PARAMETER_NAME = "value";

    private discriminant: WireStringWithAllCasings;
    private getGeneratedUnion: (context: Context) => GeneratedUnion<Context>;
    private singleUnionTypes: RawSingleUnionType<Context>[];
    private getDefaultCaseForParseTransform:
        | ((args: { context: Context; parsedValue: ts.Expression }) => ts.Statement[])
        | undefined;

    constructor({
        discriminant,
        getGeneratedUnion,
        singleUnionTypes,
        getDefaultCaseForParseTransform,
        ...superInit
    }: GeneratedUnionSchema.Init<Context>) {
        super(superInit);
        this.getGeneratedUnion = getGeneratedUnion;
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
        return this.getGeneratedUnion(context).getReferenceTo(context);
    }

    public override getSchema(context: Context): Zurg.Schema {
        return context.coreUtilities.zurg
            .union({
                parsedDiscriminant: this.getGeneratedUnion(context).discriminant,
                rawDiscriminant: this.discriminant.wireValue,
                singleUnionTypes: this.singleUnionTypes.map((singleUnionType) => singleUnionType.getSchema(context)),
            })
            .transform({
                newShape: this.getGeneratedUnion(context).getReferenceTo(context),
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
                            this.getGeneratedUnion(context).discriminant
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
                    this.getGeneratedUnion(context).buildFromExistingValue({
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
