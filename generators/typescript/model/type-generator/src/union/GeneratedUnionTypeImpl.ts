import { GetReferenceOpts } from "@fern-typescript/commons";
import { BaseContext, GeneratedUnion, GeneratedUnionType } from "@fern-typescript/contexts";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ModuleDeclarationStructure, StatementStructures, WriterFunction, ts } from "ts-morph";

import {
    ExampleSingleUnionTypeProperties,
    ExampleTypeShape,
    SingleUnionTypeProperty,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { ParsedSingleUnionTypeForUnion } from "./ParsedSingleUnionTypeForUnion";
import { UnknownSingleUnionType } from "./UnknownSingleUnionType";
import { UnknownSingleUnionTypeGenerator } from "./UnknownSingleUnionTypeGenerator";

export declare namespace GeneratedUnionTypeImpl {
    export interface Init<Context extends BaseContext>
        extends AbstractGeneratedType.Init<UnionTypeDeclaration, Context> {
        includeUtilsOnUnionMembers: boolean;
        includeOtherInUnionTypes: boolean;
        inline: boolean;
    }
}

export class GeneratedUnionTypeImpl<Context extends BaseContext>
    extends AbstractGeneratedType<UnionTypeDeclaration, Context>
    implements GeneratedUnionType<Context>
{
    public readonly type = "union";

    private generatedUnion: GeneratedUnionImpl<Context>;
    private readonly inline: boolean;

    constructor({
        includeUtilsOnUnionMembers,
        includeOtherInUnionTypes,
        inline,
        ...superInit
    }: GeneratedUnionTypeImpl.Init<Context>) {
        super(superInit);
        this.inline = inline;

        const parsedSingleUnionTypes = this.shape.types.map(
            (singleUnionType) =>
                new ParsedSingleUnionTypeForUnion({
                    singleUnionType,
                    union: this.shape,
                    includeUtilsOnUnionMembers,
                    includeSerdeLayer: this.includeSerdeLayer,
                    retainOriginalCasing: this.retainOriginalCasing,
                    noOptionalProperties: this.noOptionalProperties,
                    enableInlineTypes: this.enableInlineTypes
                })
        );

        const unknownSingleUnionTypeGenerator = new UnknownSingleUnionTypeGenerator();

        this.generatedUnion = new GeneratedUnionImpl({
            typeName: this.typeName,
            includeUtilsOnUnionMembers,
            includeOtherInUnionTypes,
            getReferenceToUnion: this.getReferenceToSelf.bind(this),
            getDocs: (context: Context) => this.getDocs(context),
            discriminant: this.includeSerdeLayer
                ? this.shape.discriminant.name.camelCase.unsafeName
                : this.shape.discriminant.wireValue,
            parsedSingleUnionTypes,
            unknownSingleUnionType: new UnknownSingleUnionType({
                singleUnionType: unknownSingleUnionTypeGenerator,
                includeUtilsOnUnionMembers
            }),
            baseProperties: this.shape.baseProperties,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            noOptionalProperties: this.noOptionalProperties,
            inline: this.inline,
            enableInlineTypes: this.enableInlineTypes
        });
    }

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        return this.generatedUnion.generateStatements(context);
    }

    public generateForInlineUnion(context: Context): ts.TypeNode {
        return this.generatedUnion.generateForInlineUnion(context);
    }

    public generateModule(): ModuleDeclarationStructure | undefined {
        return undefined;
    }

    public getGeneratedUnion(): GeneratedUnion<Context> {
        return this.generatedUnion;
    }

    public getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string {
        return ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty, {
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing
        });
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "union") {
            throw new Error("Example is not for an union");
        }

        return this.generatedUnion.build({
            discriminantValueToBuild: example.singleUnionType.wireDiscriminantValue.wireValue,
            builderArgument: ExampleSingleUnionTypeProperties._visit<ts.Expression | undefined>(
                example.singleUnionType.shape,
                {
                    singleProperty: (property) => context.type.getGeneratedExample(property).build(context, opts),
                    samePropertiesAsObject: (exampleNamedType) =>
                        context.type
                            .getGeneratedTypeById(exampleNamedType.typeId)
                            .buildExample(ExampleTypeShape.object(exampleNamedType.object), context, opts),
                    noProperties: () => undefined,
                    _other: () => {
                        throw new Error("Unknown ExampleSingleUnionTypeProperties: " + example.type);
                    }
                }
            ),
            nonDiscriminantProperties: ExampleSingleUnionTypeProperties._visit<ts.ObjectLiteralElementLike[]>(
                example.singleUnionType.shape,
                {
                    singleProperty: (property) => {
                        const unionMember = this.shape.types.find(
                            (member) =>
                                member.discriminantValue.wireValue ===
                                example.singleUnionType.wireDiscriminantValue.wireValue
                        );
                        if (unionMember == null || unionMember.shape.propertiesType !== "singleProperty") {
                            throw new Error(
                                "Cannot generate union example because union member is not singleProperty."
                            );
                        }
                        return [
                            ts.factory.createPropertyAssignment(
                                ParsedSingleUnionTypeForUnion.getSinglePropertyKey(unionMember.shape, {
                                    includeSerdeLayer: this.includeSerdeLayer,
                                    retainOriginalCasing: this.retainOriginalCasing
                                }),
                                context.type.getGeneratedExample(property).build(context, opts)
                            )
                        ];
                    },
                    samePropertiesAsObject: (exampleNamedType) => {
                        const generatedType = context.type.getGeneratedTypeById(exampleNamedType.typeId);
                        if (generatedType.type !== "object") {
                            throw new Error(
                                `Cannot generate union example because ${exampleNamedType.typeId} is not an object`
                            );
                        }
                        return generatedType.buildExampleProperties(
                            ExampleTypeShape.object(exampleNamedType.object),
                            context,
                            opts
                        );
                    },
                    noProperties: () => [],
                    _other: () => {
                        throw new Error("Unknown ExampleSingleUnionTypeProperties: " + example.type);
                    }
                }
            ),
            context
        });
    }
}
