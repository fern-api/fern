import {
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    ObjectWriter,
} from "@fern-typescript/commons";
import { GeneratedUnion, Reference, WithBaseContextMixin } from "@fern-typescript/contexts";
import {
    InterfaceDeclarationStructure,
    OptionalKind,
    PropertySignatureStructure,
    ts,
    VariableDeclarationKind,
} from "ts-morph";
import { KnownSingleUnionType } from "./known-single-union-type/KnownSingleUnionType";
import { ParsedSingleUnionType } from "./parsed-single-union-type/ParsedSingleUnionType";

export declare namespace GeneratedUnionImpl {
    export interface Init<Context extends WithBaseContextMixin> {
        typeName: string;
        discriminant: string;
        getDocs: ((context: Context) => string | null | undefined) | undefined;
        parsedSingleUnionTypes: KnownSingleUnionType<Context>[];
        unknownSingleUnionType: ParsedSingleUnionType<Context>;
        getReferenceToUnion: (context: Context) => Reference;
    }
}

export class GeneratedUnionImpl<Context extends WithBaseContextMixin> implements GeneratedUnion<Context> {
    public static readonly UTILS_INTERFACE_NAME = "_Utils";
    public static readonly VISITOR_INTERFACE_NAME = "_Visitor";
    public static readonly VISITOR_RETURN_TYPE = "_Result";
    public static readonly VISITOR_PARAMETER_NAME = "visitor";
    public static readonly VISITEE_PARAMETER_NAME = "value";
    public static readonly UNKNOWN_VISITOR_KEY = "_other";
    public static readonly VISIT_UTIL_PROPERTY_NAME = "_visit";

    public readonly getReferenceToUnion: (context: Context) => Reference;
    public readonly discriminant: string;

    private getDocs: ((context: Context) => string | null | undefined) | undefined;
    private typeName: string;
    private parsedSingleUnionTypes: KnownSingleUnionType<Context>[];
    private unknownSingleUnionType: ParsedSingleUnionType<Context>;

    constructor({
        typeName,
        discriminant,
        getDocs,
        parsedSingleUnionTypes,
        unknownSingleUnionType,
        getReferenceToUnion,
    }: GeneratedUnionImpl.Init<Context>) {
        this.getReferenceToUnion = getReferenceToUnion;
        this.discriminant = discriminant;
        this.getDocs = getDocs;
        this.typeName = typeName;
        this.parsedSingleUnionTypes = parsedSingleUnionTypes;
        this.unknownSingleUnionType = unknownSingleUnionType;
    }

    public writeToFile(context: Context): void {
        this.writeTypeAlias(context);
        this.writeModule(context);
        this.writeConst(context);
    }

    public getReferenceTo(context: Context): ts.TypeNode {
        return this.getReferenceToUnion(context).getTypeNode();
    }

    public build({
        discriminantValueToBuild,
        builderArgument,
        context,
    }: {
        discriminantValueToBuild: string | number;
        builderArgument: ts.Expression | undefined;
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
            builderArgument != null ? [builderArgument] : []
        );
    }

    public buildFromExistingValue({
        discriminantValueToBuild,
        existingValue,
        context,
    }: {
        discriminantValueToBuild: string | number;
        existingValue: ts.Expression;
        context: Context;
    }): ts.Expression {
        const singleUnionType = this.parsedSingleUnionTypes.find(
            (singleUnionType) => singleUnionType.getDiscriminantValue() === discriminantValueToBuild
        );
        if (singleUnionType == null) {
            throw new Error(`No single union type exists for discriminant value "${discriminantValueToBuild}"`);
        }
        return this.buildSingleUnionTypeFromExistingValue({
            existingValue,
            context,
            singleUnionType,
        });
    }

    public buildUnknown({ existingValue, context }: { existingValue: ts.Expression; context: Context }): ts.Expression {
        return this.buildSingleUnionTypeFromExistingValue({
            existingValue,
            context,
            singleUnionType: this.unknownSingleUnionType,
        });
    }

    private buildSingleUnionTypeFromExistingValue({
        singleUnionType,
        context,
        existingValue,
    }: {
        singleUnionType: ParsedSingleUnionType<Context>;
        context: Context;
        existingValue: ts.Expression;
    }): ts.Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToUnion(context).getExpression(),
                singleUnionType.getBuilderName()
            ),
            undefined,
            singleUnionType.getBuilderArgsFromExistingValue(existingValue)
        );
    }

    /**************
     * TYPE ALIAS *
     **************/

    private writeTypeAlias(context: Context): void {
        const typeAlias = context.base.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getWriterForMultiLineUnionType(
                this.getAllSingleUnionTypesIncludingUnknown().map((singleUnionType) => ({
                    node: this.getReferenceToSingleUnionType(singleUnionType, context),
                    docs: singleUnionType.getDocs(),
                }))
            ),
            isExported: true,
        });
        if (this.getDocs != null) {
            maybeAddDocs(typeAlias, this.getDocs(context));
        }
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

    /**********
     * MODULE *
     **********/

    private writeModule(context: Context): void {
        const module = context.base.sourceFile.addModule({
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: true,
        });
        module.addInterfaces(this.getSingleUnionTypeInterfaces(context));
        module.addInterface(this.getUtilsInterface(context));
        module.addInterface(this.getVisitorInterface(context));
    }

    private getSingleUnionTypeInterfaces(context: Context): OptionalKind<InterfaceDeclarationStructure>[] {
        const interfaces = this.getAllSingleUnionTypesIncludingUnknown().map((singleUnionType) =>
            singleUnionType.getInterfaceDeclaration(context, this)
        );

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
            properties: this.getAllSingleUnionTypesIncludingUnknown().map<OptionalKind<PropertySignatureStructure>>(
                (singleUnionType) => ({
                    name: singleUnionType.getVisitorKey(),
                    type: getTextOfTsNode(singleUnionType.getVisitMethodSignature(context, this)),
                })
            ),
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
        const writer = FernWriters.object.writer({ asConst: true });
        this.addBuilderProperties(context, writer);
        this.addVisitProperty(context, writer);

        if (writer.isEmpty) {
            return;
        }

        context.base.sourceFile.addVariableStatement({
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
        for (const singleUnionType of this.getAllSingleUnionTypesIncludingUnknown()) {
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
                                    ts.factory.createIdentifier(this.discriminant)
                                ),
                                ts.factory.createCaseBlock([
                                    ...this.parsedSingleUnionTypes.map((parsedSingleUnionType) =>
                                        ts.factory.createCaseClause(
                                            parsedSingleUnionType.getDiscriminantValueAsExpression(),
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

    private getAllSingleUnionTypesIncludingUnknown(): ParsedSingleUnionType<Context>[] {
        return [...this.parsedSingleUnionTypes, this.unknownSingleUnionType];
    }
}
