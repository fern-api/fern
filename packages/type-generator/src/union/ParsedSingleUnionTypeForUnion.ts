import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import {
    SingleUnionType,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import { TypeContext } from "@fern-typescript/sdk-declaration-handler";
import {
    AbstractParsedSingleUnionType,
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

export class ParsedSingleUnionTypeForUnion extends AbstractParsedSingleUnionType<TypeContext> {
    private singleUnionTypeFromUnion: SingleUnionType;
    protected union: UnionTypeDeclaration;

    constructor(init: ParsedSingleUnionTypeForUnion.Init) {
        super(
            SingleUnionTypeProperties._visit<SingleUnionTypeGenerator<TypeContext>>(init.singleUnionType.shape, {
                noProperties: () => new NoPropertiesSingleUnionTypeGenerator(),
                samePropertiesAsObject: (extended) => new SamePropertyAsObjectSingleUnionTypeGenerator({ extended }),
                singleProperty: (singleProperty) =>
                    new SinglePropertySingleUnionTypeGenerator({
                        propertyName: ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty),
                        getReferenceToPropertyType: (context) => context.getReferenceToType(singleProperty.type),
                    }),
                _unknown: () => {
                    throw new Error("Unknown SingleUnionTypeProperties: " + init.singleUnionType.shape._type);
                },
            })
        );

        this.union = init.union;
        this.singleUnionTypeFromUnion = init.singleUnionType;
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

    protected getDiscriminant(): WireStringWithAllCasings {
        return this.union.discriminantV2;
    }

    public static getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string {
        return singleProperty.nameV2.name.unsafeName.camelCase;
    }
}
