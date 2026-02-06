import { FernIr } from "@fern-fern/ir-sdk";
import { GeneratedTypeReferenceExample } from "@fern-typescript/contexts";

import { GeneratedTypeReferenceExampleImpl } from "./GeneratedTypeReferenceExampleImpl.js";

export declare namespace TypeReferenceExampleGenerator {
    export interface Init {
        useBigInt: boolean;
        includeSerdeLayer: boolean;
    }
}

export class TypeReferenceExampleGenerator {
    private useBigInt: boolean;
    private includeSerdeLayer: boolean;

    constructor({ useBigInt, includeSerdeLayer }: TypeReferenceExampleGenerator.Init) {
        this.useBigInt = useBigInt;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public generateExample(example: FernIr.ExampleTypeReference): GeneratedTypeReferenceExample {
        return new GeneratedTypeReferenceExampleImpl({
            example,
            useBigInt: this.useBigInt,
            includeSerdeLayer: this.includeSerdeLayer
        });
    }
}
