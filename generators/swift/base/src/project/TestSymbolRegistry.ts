import { assertDefined, SymbolRegistry, values } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";

const SYMBOL_ID_PREFIX = "symbol_id:";

export class TestSymbolRegistry {
    private static readonly reservedSymbols = [
        "Swift",
        "Foundation",
        ...swift.Symbol.swiftTypeSymbols.map((symbol) => symbol.name),
        ...swift.Symbol.foundationTypeSymbols.map((symbol) => symbol.name),
        ...values(swift.Protocol)
    ];

    public static create(additionalReservedSymbols?: string[]): TestSymbolRegistry {
        return new TestSymbolRegistry([...TestSymbolRegistry.reservedSymbols, ...(additionalReservedSymbols ?? [])]);
    }

    private readonly registry: SymbolRegistry;

    private constructor(reservedSymbolNames: string[]) {
        this.registry = new SymbolRegistry({
            reservedSymbolNames
        });
    }

    public getModuleSymbolOrThrow(): string {
        const symbolName = this.registry.getSymbolNameById(this.getModuleSymbolId());
        assertDefined(symbolName, "Module symbol not found.");
        return symbolName;
    }

    public getWireTestSuiteSymbolOrThrow(subclientName: string): string {
        const symbolName = this.registry.getSymbolNameById(this.getWireTestSuiteSymbolId(subclientName));
        assertDefined(symbolName, `Wire test suite symbol not found for subclient ${subclientName}`);
        return symbolName;
    }

    public registerWireTestSuiteSymbol(subclientName: string): string {
        return this.registry.registerSymbol(this.getWireTestSuiteSymbolId(subclientName), [
            `${subclientName}WireTests`,
            `${subclientName}WireTestSuite`
        ]);
    }

    private getModuleSymbolId(): string {
        return `${SYMBOL_ID_PREFIX}module`;
    }

    private getWireTestSuiteSymbolId(subclientName: string): string {
        return `${SYMBOL_ID_PREFIX}wire_test_suite_${subclientName}`;
    }
}
