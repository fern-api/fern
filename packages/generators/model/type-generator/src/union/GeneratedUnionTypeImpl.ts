import {
    ExampleSingleUnionTypeProperties,
    ExampleTypeShape,
    SingleUnionTypeProperty,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { GeneratedUnion, GeneratedUnionType, ModelContext } from "@fern-typescript/contexts";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { ParsedSingleUnionTypeForUnion } from "./ParsedSingleUnionTypeForUnion";
import { UnknownSingleUnionType } from "./UnknownSingleUnionType";
import { UnknownSingleUnionTypeGenerator } from "./UnknownSingleUnionTypeGenerator";

export declare namespace GeneratedUnionTypeImpl {
    export interface Init<Context extends ModelContext>
        extends AbstractGeneratedType.Init<UnionTypeDeclaration, Context> {
        includeUtilsOnUnionMembers: boolean;
        includeOtherInUnionTypes: boolean;
    }
}

export class GeneratedUnionTypeImpl<Context extends ModelContext>
    extends AbstractGeneratedType<UnionTypeDeclaration, Context>
    implements GeneratedUnionType<Context>
{
    public readonly type = "union";

    private generatedUnion: GeneratedUnionImpl<Context>;

    constructor({
        includeUtilsOnUnionMembers,
        includeOtherInUnionTypes,
        ...superInit
    }: GeneratedUnionTypeImpl.Init<Context>) {
        super(superInit);

        const parsedSingleUnionTypes = this.shape.types.map(
            (singleUnionType) =>
                new ParsedSingleUnionTypeForUnion({
                    singleUnionType,
                    union: this.shape,
                    includeUtilsOnUnionMembers,
                })
        );

        const unknownSingleUnionTypeGenerator = new UnknownSingleUnionTypeGenerator();

        this.generatedUnion = new GeneratedUnionImpl({
            typeName: this.typeName,
            includeUtilsOnUnionMembers,
            includeOtherInUnionTypes,
            getReferenceToUnion: this.getReferenceToSelf.bind(this),
            getDocs: (context: Context) => this.getDocs(context),
            discriminant: this.shape.discriminant.name.camelCase.unsafeName,
            parsedSingleUnionTypes,
            unknownSingleUnionType: new UnknownSingleUnionType({
                singleUnionType: unknownSingleUnionTypeGenerator,
                includeUtilsOnUnionMembers,
            }),
            baseProperties: this.shape.baseProperties,
        });
    }

    public writeToFile(context: Context): void {
        this.generatedUnion.writeToFile(context);
    }

    public getGeneratedUnion(): GeneratedUnion<Context> {
        return this.generatedUnion;
    }

    public getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string {
        return ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty);
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "union") {
            throw new Error("Example is not for an union");
        }

        return this.generatedUnion.build({
            discriminantValueToBuild: example.wireDiscriminantValue,
            builderArgument: ExampleSingleUnionTypeProperties._visit<ts.Expression | undefined>(example.properties, {
                singleProperty: (property) => context.type.getGeneratedExample(property).build(context, opts),
                samePropertiesAsObject: (exampleNamedType) =>
                    context.type
                        .getGeneratedType(exampleNamedType.typeName)
                        .buildExample(exampleNamedType.shape, context, opts),
                noProperties: () => undefined,
                _unknown: () => {
                    throw new Error("Unknown ExampleSingleUnionTypeProperties: " + example.properties.type);
                },
            }),
            nonDiscriminantProperties: ExampleSingleUnionTypeProperties._visit<ts.ObjectLiteralElementLike[]>(
                example.properties,
                {
                    singleProperty: (property) => {
                        const unionMember = this.shape.types.find(
                            (member) => member.discriminantValue.wireValue === example.wireDiscriminantValue
                        );
                        if (unionMember == null || unionMember.shape._type !== "singleProperty") {
                            throw new Error(
                                "Cannot generate union example because union member is not singleProperty."
                            );
                        }
                        return [
                            ts.factory.createPropertyAssignment(
                                ParsedSingleUnionTypeForUnion.getSinglePropertyKey(unionMember.shape),
                                context.type.getGeneratedExample(property).build(context, opts)
                            ),
                        ];
                    },
                    samePropertiesAsObject: (exampleNamedType) => {
                        const generatedType = context.type.getGeneratedType(exampleNamedType.typeName);
                        if (generatedType.type !== "object") {
                            throw new Error(
                                `Cannot generate union example because ${exampleNamedType.typeName.typeId} is not an object`
                            );
                        }
                        return generatedType.buildExampleProperties(exampleNamedType.shape, context, opts);
                    },
                    noProperties: () => [],
                    _unknown: () => {
                        throw new Error("Unknown ExampleSingleUnionTypeProperties: " + example.properties.type);
                    },
                }
            ),
            context,
        });
    }
}
