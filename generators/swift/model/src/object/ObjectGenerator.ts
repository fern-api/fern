import { sanitizeSelf, swift } from "@fern-api/swift-codegen";
import { InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";

import { StructGenerator } from "../helpers/struct-generator/StructGenerator";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace ObjectGenerator {
    interface Args {
        name: string;
        symbolId: string;
        properties: (ObjectProperty | InlinedRequestBodyProperty)[];
        extendedProperties?: ObjectProperty[];
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class ObjectGenerator {
    private readonly name: string;
    private readonly symbolId: string;
    private readonly properties: (ObjectProperty | InlinedRequestBodyProperty)[];
    private readonly extendedProperties: ObjectProperty[];
    private readonly docsContent?: string;
    private readonly context: ModelGeneratorContext;

    public constructor({ name, symbolId, properties, extendedProperties, docsContent, context }: ObjectGenerator.Args) {
        this.name = name;
        this.symbolId = symbolId;
        this.properties = properties;
        this.extendedProperties = extendedProperties ?? [];
        this.docsContent = docsContent;
        this.context = context;
    }

    public generate(): swift.Struct {
        return this.generateStructForTypeDeclaration();
    }

    public generateStructForTypeDeclaration(): swift.Struct {
        return new StructGenerator({
            name: this.name,
            symbolId: this.symbolId,
            constantPropertyDefinitions: [],
            dataPropertyDefinitions: [...this.extendedProperties, ...this.properties].map((p) => ({
                unsafeName: sanitizeSelf(p.name.name.camelCase.unsafeName),
                rawName: p.name.wireValue,
                type: p.valueType,
                docsContent: p.docs
            })),
            additionalProperties: true,
            docsContent: this.docsContent,
            context: this.context
        }).generate();
    }
}
