import { swift } from "@fern-api/swift-codegen";
import { InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";

import { StructGenerator } from "../helpers";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace ObjectGenerator {
    interface Args {
        name: string;
        properties: (ObjectProperty | InlinedRequestBodyProperty)[];
        extendedProperties?: ObjectProperty[];
        context: ModelGeneratorContext;
    }
}

export class ObjectGenerator {
    private readonly name: string;
    private readonly properties: (ObjectProperty | InlinedRequestBodyProperty)[];
    private readonly extendedProperties: ObjectProperty[];
    private readonly context: ModelGeneratorContext;

    public constructor({ name, properties, extendedProperties, context }: ObjectGenerator.Args) {
        this.name = name;
        this.properties = properties;
        this.extendedProperties = extendedProperties ?? [];
        this.context = context;
    }

    public generate(): swift.Struct {
        return this.generateStructForTypeDeclaration();
    }

    public generateStructForTypeDeclaration(): swift.Struct {
        return new StructGenerator({
            name: this.name,
            constantPropertyDefinitions: [],
            dataPropertyDefinitions: [...this.extendedProperties, ...this.properties].map((p) => ({
                unsafeName: p.name.name.camelCase.unsafeName,
                rawName: p.name.wireValue,
                type: this.context.getSwiftTypeForTypeReference(p.valueType)
            })),
            additionalProperties: true
        }).generate();
    }
}
