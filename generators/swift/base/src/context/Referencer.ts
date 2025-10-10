import { BaseSwiftCustomConfigSchema, swift } from "@fern-api/swift-codegen";
import { AsIsSymbolName } from "../AsIs";
import type { AbstractSwiftGeneratorContext } from ".";

export class Referencer {
    private readonly context: AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>;
    private readonly fromSymbol: swift.Symbol | string;

    public constructor(
        context: AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>,
        fromSymbol: swift.Symbol | string
    ) {
        this.context = context;
        this.fromSymbol = fromSymbol;
    }

    private get project() {
        return this.context.project;
    }

    public referenceSwiftType(symbolName: swift.SwiftTypeSymbolName) {
        const symbolRef = this.project.srcNameRegistry.reference({
            fromSymbol: this.fromSymbol,
            toSymbol: swift.Symbol.swiftType(symbolName)
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    public referenceFoundationType(symbolName: swift.FoundationTypeSymbolName) {
        const symbolRef = this.project.srcNameRegistry.reference({
            fromSymbol: this.fromSymbol,
            toSymbol: swift.Symbol.foundationType(symbolName)
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    public referenceAsIsType(symbolName: AsIsSymbolName) {
        const symbol = this.project.srcNameRegistry.getAsIsSymbolOrThrow(symbolName);
        const symbolRef = this.project.srcNameRegistry.reference({
            fromSymbol: this.fromSymbol,
            toSymbol: symbol
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    public referenceType(symbol: swift.Symbol | string) {
        const symbolRef = this.project.srcNameRegistry.reference({
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
        return this.project.srcNameRegistry.resolveReference({
            fromSymbol: this.fromSymbol,
            reference
        });
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
}
