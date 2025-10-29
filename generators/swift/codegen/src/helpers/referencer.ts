import { swift } from "..";
import { NameRegistry } from "../name-registry";

export class Referencer {
    private readonly nameRegistry: NameRegistry;
    private readonly fromSymbol: swift.Symbol | string;

    public constructor(nameRegistry: NameRegistry, fromSymbol: swift.Symbol | string) {
        this.nameRegistry = nameRegistry;
        this.fromSymbol = fromSymbol;
    }

    public referenceSwiftType(symbolName: swift.SwiftTypeSymbolName) {
        const symbolRef = this.nameRegistry.reference({
            fromSymbol: this.fromSymbol,
            toSymbol: swift.Symbol.swiftType(symbolName)
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    public referenceFoundationType(symbolName: swift.FoundationTypeSymbolName) {
        const symbolRef = this.nameRegistry.reference({
            fromSymbol: this.fromSymbol,
            toSymbol: swift.Symbol.foundationType(symbolName)
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    public referenceAsIsType(symbolName: swift.AsIsSymbolName) {
        const symbol = this.nameRegistry.getAsIsSymbolOrThrow(symbolName);
        const symbolRef = this.nameRegistry.reference({
            fromSymbol: this.fromSymbol,
            toSymbol: symbol
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    public referenceType(symbol: swift.Symbol | string) {
        const symbolRef = this.nameRegistry.reference({
            fromSymbol: this.fromSymbol,
            toSymbol: symbol
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    public resolveToSymbolIfSymbolType(typeReference: swift.TypeReference) {
        const reference = typeReference.getReferenceIfSymbolType();
        if (reference === null) {
            return null;
        }
        return this.nameRegistry.resolveReference({
            fromSymbol: this.fromSymbol,
            reference
        });
    }

    public resolvesToTheAsIsType(typeReference: swift.TypeReference, asIsSymbolName: swift.AsIsSymbolName) {
        const resolvedSymbol = this.resolveToSymbolIfSymbolType(typeReference);
        const registeredSymbol = this.nameRegistry.getAsIsSymbolOrThrow(asIsSymbolName);
        return resolvedSymbol?.id === registeredSymbol.id;
    }

    public resolvesToASwiftType(typeReference: swift.TypeReference) {
        const symbol = this.resolveToSymbolIfSymbolType(typeReference);
        return symbol?.isSwiftSymbol ?? false;
    }

    public resolvesToTheSwiftType(typeReference: swift.TypeReference, swiftSymbolName: swift.SwiftTypeSymbolName) {
        const symbol = this.resolveToSymbolIfSymbolType(typeReference);
        return symbol?.id === swift.Symbol.swiftType(swiftSymbolName).id;
    }

    public resolvesToAFoundationType(typeReference: swift.TypeReference) {
        const symbol = this.resolveToSymbolIfSymbolType(typeReference);
        return symbol?.isFoundationSymbol ?? false;
    }

    public resolvesToTheFoundationType(
        typeReference: swift.TypeReference,
        foundationSymbolName: swift.FoundationTypeSymbolName
    ) {
        const symbol = this.resolveToSymbolIfSymbolType(typeReference);
        return symbol?.id === swift.Symbol.foundationType(foundationSymbolName).id;
    }

    public resolvesToACustomType(typeReference: swift.TypeReference) {
        const symbol = this.resolveToSymbolIfSymbolType(typeReference);
        return symbol?.isCustomSymbol ?? false;
    }

    public resolvesToAnEnumWithRawValues(typeReference: swift.TypeReference) {
        const symbol = this.resolveToSymbolIfSymbolType(typeReference);
        return symbol?.shape.type === "enum-with-raw-values";
    }
}
