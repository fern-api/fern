import { SymbolRegistry as Namespace } from "@fern-api/core-utils";

export class TestModuleNamespace {
    private readonly namespace: Namespace;

    public constructor() {
        this.namespace = new Namespace();
    }

    private asIsNameId(symbolName: string): string {
        return `AsIs:${symbolName}`;
    }

    private wireTestSuiteNameId(typeId: string): string {
        return `WireTestSuite:${typeId}`;
    }

    // Setters

    public addAsIsSymbol(symbolName: string) {
        const nameId = this.asIsNameId(symbolName);
        this.namespace.registerSymbol(nameId, [symbolName]);
    }

    public registerWireTestSuiteSymbol(subclientName: string): string {
        return this.namespace.registerSymbol(this.wireTestSuiteNameId(subclientName), [
            `${subclientName}WireTests`,
            `${subclientName}WireTestSuite`
        ]);
    }

    public getWireTestSuiteNameOrThrow(subclientName: string): string {
        return this.namespace.getSymbolNameByIdOrThrow(this.wireTestSuiteNameId(subclientName));
    }
}
