import { GeneratedTypeReferenceExample } from "@fern-typescript/contexts"

import { ExampleTypeReference } from "@fern-fern/ir-sdk/api"

import { GeneratedTypeReferenceExampleImpl } from "./GeneratedTypeReferenceExampleImpl"

export declare namespace TypeReferenceExampleGenerator {
    export interface Init {
        useBigInt: boolean
        includeSerdeLayer: boolean
    }
}

export class TypeReferenceExampleGenerator {
    private useBigInt: boolean
    private includeSerdeLayer: boolean

    constructor({ useBigInt, includeSerdeLayer }: TypeReferenceExampleGenerator.Init) {
        this.useBigInt = useBigInt
        this.includeSerdeLayer = includeSerdeLayer
    }

    public generateExample(example: ExampleTypeReference): GeneratedTypeReferenceExample {
        return new GeneratedTypeReferenceExampleImpl({
            example,
            useBigInt: this.useBigInt,
            includeSerdeLayer: this.includeSerdeLayer
        })
    }
}
