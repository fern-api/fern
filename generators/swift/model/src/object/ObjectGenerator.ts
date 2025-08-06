import { swift } from "@fern-api/swift-codegen";
import { InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";

import { StructGenerator } from "../helpers";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace ObjectGenerator {
    interface Args {
        name: string;
        properties: (ObjectProperty | InlinedRequestBodyProperty)[];
        extendedProperties?: ObjectProperty[];
        docs?: swift.DocComment;
        context: ModelGeneratorContext;
    }
}

export class ObjectGenerator {
    private readonly name: string;
    private readonly properties: (ObjectProperty | InlinedRequestBodyProperty)[];
    private readonly extendedProperties: ObjectProperty[];
    private readonly docs?: swift.DocComment;
    private readonly context: ModelGeneratorContext;

    public constructor({ name, properties, extendedProperties, docs, context }: ObjectGenerator.Args) {
        this.name = name;
        this.properties = properties;
        this.extendedProperties = extendedProperties ?? [];
        this.docs = docs;
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
                type: this.context.getSwiftTypeForTypeReference(p.valueType),
                docs: p.docs ? swift.docComment({ summary: p.docs }) : undefined
            })),
            additionalProperties: true,
            docs: this.docs
        }).generate();
    }
}
