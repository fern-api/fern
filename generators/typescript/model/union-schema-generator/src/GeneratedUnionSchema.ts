import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { Reference, Zurg, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedUnion, ModelContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, VariableDeclarationKind, ts } from "ts-morph";

import { NameAndWireValue, ObjectProperty } from "@fern-fern/ir-sdk/api";

import { RawSingleUnionType } from "./RawSingleUnionType";

export declare namespace GeneratedUnionSchema {
    export interface Init<Context extends ModelContext> extends AbstractGeneratedSchema.Init {
        discriminant: NameAndWireValue;
        singleUnionTypes: RawSingleUnionType<Context>[];
        baseProperties?: ObjectProperty[];
        getGeneratedUnion: (context: Context) => GeneratedUnion<Context>;
        getReferenceToSchema: (context: Context) => Reference;
        shouldIncludeDefaultCaseInTransform: boolean;
        includeUtilsOnUnionMembers: boolean;
    }
}

export class GeneratedUnionSchema<Context extends ModelContext> extends AbstractGeneratedSchema<Context> {
    private static VALUE_PARAMETER_NAME = "value";
    private static BASE_SCHEMA_NAME = "_Base";

    private discriminant: NameAndWireValue;
    private singleUnionTypes: RawSingleUnionType<Context>[];
    private baseProperties: ObjectProperty[];
    private getGeneratedUnion: (context: Context) => GeneratedUnion<Context>;
    protected getReferenceToSchema: (context: Context) => Reference;
    private shouldIncludeDefaultCaseInTransform: boolean;
    private includeUtilsOnUnionMembers: boolean;

    constructor({
        discriminant,
        singleUnionTypes,
        baseProperties = [],
        getGeneratedUnion,
        getReferenceToSchema,
        shouldIncludeDefaultCaseInTransform,
        includeUtilsOnUnionMembers,
        ...superInit
    }: GeneratedUnionSchema.Init<Context>) {
        super(superInit);
        this.discriminant = discriminant;
        this.singleUnionTypes = singleUnionTypes;
        this.baseProperties = baseProperties;
        this.getGeneratedUnion = getGeneratedUnion;
        this.getReferenceToSchema = getReferenceToSchema;
        this.shouldIncludeDefaultCaseInTransform = shouldIncludeDefaultCaseInTransform;
        this.includeUtilsOnUnionMembers = includeUtilsOnUnionMembers;
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
            isExported: true
        });

        for (const interfaceStructure of interfaces) {
            const interface_ = module.addInterface(interfaceStructure);
            if (this.hasBaseInterface()) {
                interface_.insertExtends(0, GeneratedUnionSchema.BASE_SCHEMA_NAME);
            }
        }

        if (this.hasBaseInterface()) {
            module.addInterface({
                name: GeneratedUnionSchema.BASE_SCHEMA_NAME,
                properties: this.baseProperties.map((property) => {
                    const type = context.typeSchema.getReferenceToRawType(property.valueType);
                    return {
                        name: `"${property.name.wireValue}"`,
                        type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                        hasQuestionToken: type.isOptional
                    };
                }),
                isExported: true
            });
        }
    }

    public override getReferenceToParsedShape(context: Context): ts.TypeNode {
        return this.getReferenceToParsedUnion(context);
    }

    public buildSchema(context: Context): Zurg.Schema {
        let schema: Zurg.Schema = context.coreUtilities.zurg.union({
            parsedDiscriminant: this.getParsedDiscriminant(context),
            rawDiscriminant: this.discriminant.wireValue,
            singleUnionTypes: this.singleUnionTypes.map((singleUnionType) => {
                const singleUnionTypeSchema = singleUnionType.getSchema(context);
                if (this.hasBaseInterface()) {
                    singleUnionTypeSchema.nonDiscriminantProperties =
                        singleUnionTypeSchema.nonDiscriminantProperties.extend(
                            context.coreUtilities.zurg.Schema._fromExpression(
                                ts.factory.createIdentifier(GeneratedUnionSchema.BASE_SCHEMA_NAME)
                            )
                        );
                }
                return singleUnionTypeSchema;
            })
        });

        if (this.includeUtilsOnUnionMembers) {
            schema = schema.transform({
                newShape: this.getReferenceToParsedShape(context),
                transform: this.generateAddVisitTransform(context),
                untransform: ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createObjectBindingPattern([
                                ts.factory.createBindingElement(
                                    undefined,
                                    undefined,
                                    ts.factory.createIdentifier(this.getGeneratedUnion(context).visitPropertyName),
                                    undefined
                                ),
                                ts.factory.createBindingElement(
                                    ts.factory.createToken(ts.SyntaxKind.DotDotDotToken),
                                    undefined,
                                    ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME),
                                    undefined
                                )
                            ])
                        )
                    ],
                    undefined,
                    undefined,
                    ts.factory.createAsExpression(
                        ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                    )
                )
            });
        } else {
            schema = schema.transform({
                newShape: this.getReferenceToParsedShape(context),
                transform: ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME)
                        )
                    ],
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME)
                ),
                untransform: ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME)
                        )
                    ],
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME)
                )
            });
        }

        return schema;
    }

    public override writeSchemaToFile(context: Context): void {
        if (this.singleUnionTypes.length === 0) {
            return;
        }

        if (this.hasBaseInterface()) {
            context.sourceFile.addVariableStatement({
                declarationKind: VariableDeclarationKind.Const,
                declarations: [
                    {
                        name: GeneratedUnionSchema.BASE_SCHEMA_NAME,
                        initializer: getTextOfTsNode(
                            context.coreUtilities.zurg
                                .object(
                                    this.baseProperties.map((baseProperty) => ({
                                        key: {
                                            raw: baseProperty.name.wireValue,
                                            parsed: this.getGeneratedUnion(context).getBasePropertyKey(
                                                baseProperty.name.wireValue
                                            )
                                        },
                                        value: context.typeSchema.getSchemaOfTypeReference(baseProperty.valueType)
                                    }))
                                )
                                .toExpression()
                        )
                    }
                ]
            });
        }

        super.writeSchemaToFile(context);
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
                )
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
                    )
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
                        context
                    })
                )
            ])
        );

        if (this.shouldIncludeDefaultCaseInTransform) {
            clauses.push(
                ts.factory.createDefaultClause([
                    ts.factory.createReturnStatement(
                        this.getGeneratedUnion(context).buildUnknown({
                            existingValue: ts.factory.createIdentifier(GeneratedUnionSchema.VALUE_PARAMETER_NAME),
                            context
                        })
                    )
                ])
            );
        }
        return clauses;
    }

    private getParsedDiscriminant(context: Context): string {
        return this.getGeneratedUnion(context).discriminant;
    }

    private getReferenceToParsedUnion(context: Context): ts.TypeNode {
        return this.getGeneratedUnion(context).getReferenceTo(context);
    }

    private buildParsedUnion({
        discriminantValueToBuild,
        existingValue,
        context
    }: {
        discriminantValueToBuild: string;
        existingValue: ts.Expression;
        context: Context;
    }): ts.Expression {
        return this.getGeneratedUnion(context).buildFromExistingValue({
            discriminantValueToBuild,
            existingValue,
            context
        });
    }

    private hasBaseInterface(): boolean {
        return this.baseProperties.length > 0;
    }
}
