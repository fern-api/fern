import { sanitizeSelf, swift } from "@fern-api/swift-codegen";
import { InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";

import { StructGenerator } from "../helpers/struct-generator/StructGenerator";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace ObjectGenerator {
    interface Args {
        symbol: swift.Symbol;
        properties: (ObjectProperty | InlinedRequestBodyProperty)[];
        extendedProperties?: ObjectProperty[];
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class ObjectGenerator {
    private readonly symbol: swift.Symbol;
    private readonly properties: (ObjectProperty | InlinedRequestBodyProperty)[];
    private readonly extendedProperties: ObjectProperty[];
    private readonly docsContent?: string;
    private readonly context: ModelGeneratorContext;

    public constructor({ symbol, properties, extendedProperties, docsContent, context }: ObjectGenerator.Args) {
        this.symbol = symbol;
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
            symbol: this.symbol,
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
