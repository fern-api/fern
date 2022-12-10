import { NameAndWireValue } from "@fern-fern/ir-model/commons";
import {
    SingleUnionType,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import { TypeContext } from "@fern-typescript/contexts";
import {
    AbstractKnownSingleUnionType,
    NoPropertiesSingleUnionTypeGenerator,
    SinglePropertySingleUnionTypeGenerator,
    SingleUnionTypeGenerator,
} from "@fern-typescript/union-generator";
import { SamePropertyAsObjectSingleUnionTypeGenerator } from "./SamePropertyAsObjectSingleUnionTypeGenerator";

export declare namespace ParsedSingleUnionTypeForUnion {
    export interface Init {
        singleUnionType: SingleUnionType;
        union: UnionTypeDeclaration;
    }
}

export class ParsedSingleUnionTypeForUnion<Context extends TypeContext> extends AbstractKnownSingleUnionType<Context> {
    private singleUnionTypeFromUnion: SingleUnionType;
    protected union: UnionTypeDeclaration;

    constructor({ singleUnionType, union }: ParsedSingleUnionTypeForUnion.Init) {
        super({
            singleUnionType: SingleUnionTypeProperties._visit<SingleUnionTypeGenerator<Context>>(
                singleUnionType.shape,
                {
                    noProperties: () => new NoPropertiesSingleUnionTypeGenerator(),
                    samePropertiesAsObject: (extended) =>
                        new SamePropertyAsObjectSingleUnionTypeGenerator({ extended }),
                    singleProperty: (singleProperty) =>
                        new SinglePropertySingleUnionTypeGenerator({
                            propertyName: ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty),
                            getReferenceToPropertyType: (context) =>
                                context.type.getReferenceToType(singleProperty.type),
                        }),
                    _unknown: () => {
                        throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape._type);
                    },
                }
            ),
        });

        this.union = union;
        this.singleUnionTypeFromUnion = singleUnionType;
    }

    public getDocs(): string | null | undefined {
        return this.singleUnionTypeFromUnion.docs;
    }

    public getInterfaceName(): string {
        return this.singleUnionTypeFromUnion.discriminantValue.pascalCase;
    }

    public getDiscriminantValue(): string {
        return this.singleUnionTypeFromUnion.discriminantValue.wireValue;
    }

    public getBuilderName(): string {
        return this.singleUnionTypeFromUnion.discriminantValue.camelCase;
    }

    public getVisitorKey(): string {
        return this.singleUnionTypeFromUnion.discriminantValue.camelCase;
    }

    protected getDiscriminant(): NameAndWireValue {
        return this.union.discriminantV3;
    }

    public static getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string {
        return singleProperty.nameV2.name.unsafeName.camelCase;
    }
}
