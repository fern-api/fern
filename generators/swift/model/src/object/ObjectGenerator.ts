import { getWireValue } from "@fern-api/base-generator";
import { sanitizeSelf, swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import { StructGenerator } from "../helpers/struct-generator/StructGenerator.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export declare namespace ObjectGenerator {
    interface Args {
        symbol: swift.Symbol;
        properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[];
        extendedProperties?: FernIr.ObjectProperty[];
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class ObjectGenerator {
    private readonly symbol: swift.Symbol;
    private readonly properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[];
    private readonly extendedProperties: FernIr.ObjectProperty[];
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
        const typeId = this.context.getTypeIdForSchemaSymbol(this.symbol);

        return new StructGenerator({
            symbol: this.symbol,
            constantPropertyDefinitions: [],
            dataPropertyDefinitions: [...this.extendedProperties, ...this.properties].map((p) => ({
                unsafeName: sanitizeSelf(this.context.caseConverter.camelUnsafe(p.name)),
                rawName: getWireValue(p.name),
                type: p.valueType,
                indirect: typeId != null && this.context.shouldGeneratePropertyAsIndirect(typeId, getWireValue(p.name)),
                docsContent: p.docs
            })),
            additionalProperties: true,
            docsContent: this.docsContent,
            context: this.context
        }).generate();
    }
}
