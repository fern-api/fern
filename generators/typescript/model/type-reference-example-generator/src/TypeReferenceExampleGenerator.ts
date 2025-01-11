import { GeneratedTypeReferenceExample } from "@fern-typescript/contexts";

import { ExampleTypeReference } from "@fern-fern/ir-sdk/api";

import { GeneratedTypeReferenceExampleImpl } from "./GeneratedTypeReferenceExampleImpl";

export class TypeReferenceExampleGenerator {
    public generateExample(example: ExampleTypeReference): GeneratedTypeReferenceExample {
        return new GeneratedTypeReferenceExampleImpl({ example });
    }
}
