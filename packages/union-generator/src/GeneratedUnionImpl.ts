import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import {
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    ObjectWriter,
} from "@fern-typescript/commons";
import { GeneratedUnion, Reference, TypeContext } from "@fern-typescript/sdk-declaration-handler";
import {
    InterfaceDeclarationStructure,
    OptionalKind,
    PropertySignatureStructure,
    ts,
    VariableDeclarationKind,
} from "ts-morph";
import { AbstractParsedSingleUnionType } from "./parsed-single-union-type/AbstractParsedSingleUnionType";
import { ParsedSingleUnionType } from "./parsed-single-union-type/ParsedSingleUnionType";
import { UnknownSingleUnionType } from "./UnknownSingleUnionType";

export declare namespace GeneratedUnionImpl {
    export interface Init<Context extends TypeContext> {
        typeName: string;
        discriminant: WireStringWithAllCasings;
        docs: string | null | undefined;
        parsedSingleUnionTypes: ParsedSingleUnionType<Context>[];
        unknownSingleUnionType: UnknownSingleUnionType;
        getReferenceToUnion: (context: Context) => Reference;
    }
}

export class GeneratedUnionImpl<Context extends TypeContext> implements GeneratedUnion<Context> {
    public static readonly UNKNOWN_SINGLE_UNION_TYPE_INTERFACE_NAME = "_Unknown";
    public static readonly UTILS_INTERFACE_NAME = "_Utils";
    public static readonly VISITOR_INTERFACE_NAME = "_Visitor";
    public static readonly VISITOR_RETURN_TYPE = "_Result";
    public static readonly VISITOR_PARAMETER_NAME = "visitor";
    public static readonly VISITEE_PARAMETER_NAME = "value";
    public static readonly UNKNOWN_VISITOR_KEY = "_other";
    public static readonly VISIT_UTIL_PROPERTY_NAME = "_visit";

    private discriminantWithAllCasings: WireStringWithAllCasings;
    private docs: string | null | undefined;
    private typeName: string;
    private parsedSingleUnionTypes: ParsedSingleUnionType<Context>[];
    private unknownSingleUnionType: UnknownSingleUnionType;

    public readonly getReferenceToUnion: (context: Context) => Reference;

    constructor({
        typeName,
        discriminant,
        docs,
        parsedSingleUnionTypes,
        unknownSingleUnionType,
        getReferenceToUnion,
    }: GeneratedUnionImpl.Init<Context>) {
        this.getReferenceToUnion = getReferenceToUnion;
        this.discriminantWithAllCasings = discriminant;
        this.docs = docs;
        this.typeName = typeName;
        this.parsedSingleUnionTypes = parsedSingleUnionTypes;
        this.unknownSingleUnionType = unknownSingleUnionType;
    }

    public writeToFile(context: Context): void {
        this.writeTypeAlias(context);
        this.writeModule(context);
        this.writeConst(context);
    }

    public get discriminant(): string {
        return AbstractParsedSingleUnionType.getDiscriminantKey(this.discriminantWithAllCasings);
    }

    public getReferenceTo(context: Context): ts.TypeNode {
        return this.getReferenceToUnion(context).getTypeNode();
    }

    public buildFromExistingValue({
        discriminantValueToBuild,
        existingValue,
        context,
    }: {
        discriminantValueToBuild: string;
        existingValue: ts.Expression;
        context: Context;
    }): ts.Expression {
        const singleUnionType = this.parsedSingleUnionTypes.find(
            (singleUnionType) => singleUnionType.getDiscriminantValue() === discriminantValueToBuild
        );
        if (singleUnionType == null) {
            throw new Error(`No single union type exists for discriminant value "${discriminantValueToBuild}"`);
        }
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToUnion(context).getExpression(),
                singleUnionType.getBuilderName()
            ),
            undefined,
            singleUnionType.getBuilderArgsFromExistingValue(existingValue)
        );
    }

    public addVistMethodToValue({
        context,
        parsedValue,
    }: {
        context: Context;
        parsedValue: ts.Expression;
    }): ts.Expression {
        return AbstractParsedSingleUnionType.addVisitMethodToValue({
            context,
            generatedUnion: this,
            value: parsedValue,
            referenceToBuiltType: this.getReferenceTo(context),
        });
    }

    /**************
     * TYPE ALIAS *
     **************/

    private writeTypeAlias(context: Context): void {
        const typeAlias = context.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getWriterForMultiLineUnionType([
                ...this.parsedSingleUnionTypes.map((singleUnionType) => ({
                    node: this.getReferenceToSingleUnionType(singleUnionType, context),
                    docs: singleUnionType.getDocs(),
                })),
                {
                    node: this.getReferenceToUnknownType(context),
                    docs: undefined,
                },
            ]),
            isExported: true,
        });
        maybeAddDocs(typeAlias, this.docs);
    }

    public getReferenceToSingleUnionType(
        singleUnionType: ParsedSingleUnionType<Context>,
        context: Context
    ): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(context).getEntityName(),
                singleUnionType.getInterfaceName()
            )
        );
    }

    private getReferenceToUnknownType(context: Context): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(context).getEntityName(),
                GeneratedUnionImpl.UNKNOWN_SINGLE_UNION_TYPE_INTERFACE_NAME
            )
        );
    }

    /**********
     * MODULE *
     **********/

    private writeModule(context: Context): void {
        const module = context.sourceFile.addModule({
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: true,
        });
        module.addInterfaces(this.getSingleUnionTypeInterfaces(context));
        module.addInterface(this.getUtilsInterface(context));
        module.addInterface(this.getVisitorInterface(context));
    }

    private getSingleUnionTypeInterfaces(context: Context): OptionalKind<InterfaceDeclarationStructure>[] {
        const interfaces = [
            ...this.parsedSingleUnionTypes.map((singleUnionType) => singleUnionType.getInterfaceDeclaration(context)),
            AbstractParsedSingleUnionType.createDiscriminatedInterface({
                typeName: GeneratedUnionImpl.UNKNOWN_SINGLE_UNION_TYPE_INTERFACE_NAME,
                discriminant: this.discriminantWithAllCasings,
                discriminantValue: this.unknownSingleUnionType.discriminantType,
                nonDiscriminantProperties: this.unknownSingleUnionType.getNonDiscriminantProperties?.(context),
            }),
        ];

        for (const interface_ of interfaces) {
            interface_.extends.push(ts.factory.createTypeReferenceNode(GeneratedUnionImpl.UTILS_INTERFACE_NAME));
        }

        return interfaces.map((interface_) => ({
            name: interface_.name,
            extends: interface_.extends.map(getTextOfTsNode),
            properties: interface_.jsonProperties,
        }));
    }

    private getUtilsInterface(context: Context): OptionalKind<InterfaceDeclarationStructure> {
        return {
            name: GeneratedUnionImpl.UTILS_INTERFACE_NAME,
            properties: [
                {
                    name: GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME,
                    type: getTextOfTsNode(this.getVisitSignature(context)),
                },
            ],
        };
    }

    private getVisitSignature(context: Context): ts.FunctionTypeNode {
        return ts.factory.createFunctionTypeNode(
            [
                ts.factory.createTypeParameterDeclaration(
                    undefined,
                    ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_RETURN_TYPE),
                    undefined,
                    undefined
                ),
            ],
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_PARAMETER_NAME),
                    undefined,
                    this.getReferenceToVisitorInterface(context)
                ),
            ],
            ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_RETURN_TYPE),
                undefined
            )
        );
    }

    private getVisitorInterface(context: Context): OptionalKind<InterfaceDeclarationStructure> {
        return {
            name: GeneratedUnionImpl.VISITOR_INTERFACE_NAME,
            typeParameters: [
                {
                    name: GeneratedUnionImpl.VISITOR_RETURN_TYPE,
                },
            ],
            properties: [
                ...this.parsedSingleUnionTypes.map<OptionalKind<PropertySignatureStructure>>((singleUnionType) => ({
                    name: singleUnionType.getVisitorKey(),
                    type: getTextOfTsNode(singleUnionType.getVisitMethodSignature(context)),
                })),
                {
                    name: GeneratedUnionImpl.UNKNOWN_VISITOR_KEY,
                    type: getTextOfTsNode(
                        AbstractParsedSingleUnionType.getVisitorPropertySignature({
                            parameterType: this.unknownSingleUnionType.getVisitorArgument(context),
                        })
                    ),
                },
            ],
        };
    }

    public getReferenceToVisitorInterface(context: Context): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(context).getEntityName(),
                GeneratedUnionImpl.VISITOR_INTERFACE_NAME
            ),
            [ts.factory.createTypeReferenceNode(GeneratedUnionImpl.VISITOR_RETURN_TYPE)]
        );
    }

    /*********
     * CONST *
     *********/

    private writeConst(context: Context): void {
        if (this.parsedSingleUnionTypes.length === 0) {
            return;
        }

        const writer = FernWriters.object.writer({ asConst: true });

        this.addBuilderProperties(context, writer);
        this.addVisitProperty(context, writer);

        context.sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: this.typeName,
                    initializer: writer.toFunction(),
                },
            ],
            isExported: true,
        });
    }

    private addBuilderProperties(context: Context, writer: ObjectWriter) {
        for (const singleUnionType of this.parsedSingleUnionTypes) {
            writer.addProperty({
                key: singleUnionType.getBuilderName(),
                value: getTextOfTsNode(singleUnionType.getBuilder(context, this)),
            });
            writer.addNewLine();
        }
    }

    private addVisitProperty(context: Context, writer: ObjectWriter) {
        const referenceToUnion = this.getReferenceToUnion(context);
        writer.addProperty({
            key: GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME,
            value: getTextOfTsNode(
                ts.factory.createArrowFunction(
                    undefined,
                    [
                        ts.factory.createTypeParameterDeclaration(
                            undefined,
                            ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_RETURN_TYPE)
                        ),
                    ],
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(GeneratedUnionImpl.VISITEE_PARAMETER_NAME),
                            undefined,
                            referenceToUnion.getTypeNode(),
                            undefined
                        ),
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_PARAMETER_NAME),
                            undefined,
                            this.getReferenceToVisitorInterface(context),
                            undefined
                        ),
                    ],
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_RETURN_TYPE),
                        undefined
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createBlock(
                        [
                            ts.factory.createSwitchStatement(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(GeneratedUnionImpl.VISITEE_PARAMETER_NAME),
                                    ts.factory.createIdentifier(
                                        AbstractParsedSingleUnionType.getDiscriminantKey(
                                            this.discriminantWithAllCasings
                                        )
                                    )
                                ),
                                ts.factory.createCaseBlock([
                                    ...this.parsedSingleUnionTypes.map((parsedSingleUnionType) =>
                                        ts.factory.createCaseClause(
                                            ts.factory.createStringLiteral(
                                                parsedSingleUnionType.getDiscriminantValue()
                                            ),
                                            [
                                                ts.factory.createReturnStatement(
                                                    parsedSingleUnionType.invokeVisitMethod({
                                                        localReferenceToUnionValue: ts.factory.createIdentifier(
                                                            GeneratedUnionImpl.VISITEE_PARAMETER_NAME
                                                        ),
                                                        localReferenceToVisitor: ts.factory.createIdentifier(
                                                            GeneratedUnionImpl.VISITOR_PARAMETER_NAME
                                                        ),
                                                    })
                                                ),
                                            ]
                                        )
                                    ),
                                    ts.factory.createDefaultClause([
                                        ts.factory.createReturnStatement(
                                            ts.factory.createCallExpression(
                                                ts.factory.createPropertyAccessExpression(
                                                    ts.factory.createIdentifier(
                                                        GeneratedUnionImpl.VISITOR_PARAMETER_NAME
                                                    ),
                                                    ts.factory.createIdentifier(GeneratedUnionImpl.UNKNOWN_VISITOR_KEY)
                                                ),
                                                undefined,
                                                [
                                                    ts.factory.createAsExpression(
                                                        ts.factory.createIdentifier(
                                                            GeneratedUnionImpl.VISITEE_PARAMETER_NAME
                                                        ),
                                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                                    ),
                                                ]
                                            )
                                        ),
                                    ]),
                                ])
                            ),
                        ],
                        true
                    )
                )
            ),
        });
    }
}
