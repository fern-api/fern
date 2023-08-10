import { NameAndWireValue } from "@fern-fern/ir-model/commons";
import {
    SingleUnionType,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import { ModelContext } from "@fern-typescript/contexts";
import {
    AbstractKnownSingleUnionType,
    NoPropertiesSingleUnionTypeGenerator,
    SinglePropertySingleUnionTypeGenerator,
    SingleUnionTypeGenerator,
} from "@fern-typescript/union-generator";
import { SamePropertiesAsObjectSingleUnionTypeGenerator } from "./SamePropertiesAsObjectSingleUnionTypeGenerator";

export declare namespace ParsedSingleUnionTypeForUnion {
    export interface Init {
        singleUnionType: SingleUnionType;
        union: UnionTypeDeclaration;
        includeUtilsOnUnionMembers: boolean;
        includeSerdeLayer: boolean;
        noOptionalProperties: boolean;
    }
}

export class ParsedSingleUnionTypeForUnion<Context extends ModelContext> extends AbstractKnownSingleUnionType<Context> {
    private singleUnionTypeFromUnion: SingleUnionType;
    private includeSerdeLayer: boolean;
    protected union: UnionTypeDeclaration;

    constructor({
        singleUnionType,
        union,
        includeUtilsOnUnionMembers,
        includeSerdeLayer,
        noOptionalProperties,
    }: ParsedSingleUnionTypeForUnion.Init) {
        super({
            singleUnionType: SingleUnionTypeProperties._visit<SingleUnionTypeGenerator<Context>>(
                singleUnionType.shape,
                {
                    noProperties: () => new NoPropertiesSingleUnionTypeGenerator(),
                    samePropertiesAsObject: (extended) =>
                        new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended }),
                    singleProperty: (singleProperty) =>
                        new SinglePropertySingleUnionTypeGenerator({
                            propertyName: ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty, {
                                includeSerdeLayer,
                            }),
                            getReferenceToPropertyType: (context) =>
                                context.type.getReferenceToType(singleProperty.type),
                            noOptionalProperties,
                        }),
                    _unknown: () => {
                        throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape._type);
                    },
                }
            ),
            includeUtilsOnUnionMembers,
        });

        this.union = union;
        this.singleUnionTypeFromUnion = singleUnionType;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public getDocs(): string | null | undefined {
        return this.singleUnionTypeFromUnion.docs;
    }

    public getInterfaceName(): string {
        return this.singleUnionTypeFromUnion.discriminantValue.name.pascalCase.safeName;
    }

    public getDiscriminantValue(): string {
        return this.singleUnionTypeFromUnion.discriminantValue.wireValue;
    }

    public getBuilderName(): string {
        if (this.includeSerdeLayer) {
            return this.singleUnionTypeFromUnion.discriminantValue.name.camelCase.unsafeName;
        } else {
            return this.singleUnionTypeFromUnion.discriminantValue.wireValue;
        }
    }

    public getVisitorKey(): string {
        if (this.includeSerdeLayer) {
            return this.singleUnionTypeFromUnion.discriminantValue.name.camelCase.unsafeName;
        } else {
            return this.singleUnionTypeFromUnion.discriminantValue.wireValue;
        }
    }

    protected getDiscriminant(): NameAndWireValue {
        return this.union.discriminant;
    }

    public static getSinglePropertyKey(
        singleProperty: SingleUnionTypeProperty,
        { includeSerdeLayer }: { includeSerdeLayer: boolean }
    ): string {
        if (includeSerdeLayer) {
            return singleProperty.name.name.camelCase.unsafeName;
        } else {
            return singleProperty.name.wireValue;
        }
    }
}
