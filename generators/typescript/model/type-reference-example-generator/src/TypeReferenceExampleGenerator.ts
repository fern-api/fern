import { ExampleTypeReference } from "@fern-fern/ir-sdk/api";
import { GeneratedTypeReferenceExample } from "@fern-typescript/contexts";
import { GeneratedTypeReferenceExampleImpl } from "./GeneratedTypeReferenceExampleImpl";

export class TypeReferenceExampleGenerator {
    public generateExample(example: ExampleTypeReference): GeneratedTypeReferenceExample {
        return new GeneratedTypeReferenceExampleImpl({ example });
    }
}
