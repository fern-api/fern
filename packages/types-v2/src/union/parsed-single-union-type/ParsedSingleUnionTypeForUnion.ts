import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { SingleUnionType, SingleUnionTypeProperties, UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { NoPropertiesSingleUnionTypeGenerator } from "../single-union-type-generator/NoPropertiesSingleUnionTypeGenerator";
import { SamePropertyAsObjectSingleUnionTypeGenerator } from "../single-union-type-generator/SamePropertyAsObjectSingleUnionTypeGenerator";
import { SinglePropertySingleUnionTypeGenerator } from "../single-union-type-generator/SinglePropertySingleUnionTypeGenerator";
import { SingleUnionTypeGenerator } from "../single-union-type-generator/SingleUnionTypeGenerator";
import { AbstractParsedSingleUnionType } from "./AbstractParsedSingleUnionType";

export declare namespace ParsedSingleUnionTypeForUnion {
    export interface Init {
        singleUnionType: SingleUnionType;
        union: UnionTypeDeclaration;
    }
}

export class ParsedSingleUnionTypeForUnion extends AbstractParsedSingleUnionType {
    private singleUnionTypeFromUnion: SingleUnionType;
    protected union: UnionTypeDeclaration;

    constructor(init: ParsedSingleUnionTypeForUnion.Init) {
        super(
            SingleUnionTypeProperties._visit<SingleUnionTypeGenerator>(init.singleUnionType.shape, {
                noProperties: () => new NoPropertiesSingleUnionTypeGenerator(),
                samePropertiesAsObject: (extended) => new SamePropertyAsObjectSingleUnionTypeGenerator({ extended }),
                singleProperty: (singleProperty) => new SinglePropertySingleUnionTypeGenerator({ singleProperty }),
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

    protected override getDiscriminant(): WireStringWithAllCasings {
        return this.union.discriminantV2;
    }
}
