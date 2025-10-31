import { SymbolRegistry as Namespace } from "@fern-api/core-utils";

export class SourceModuleNamespace {
    private readonly namespace: Namespace;

    public constructor() {
        this.namespace = new Namespace();
    }

    public addAsIsSymbolName(symbolName: string) {
        const nameId = this.asIsSymbolNameId(symbolName);
        this.namespace.registerSymbol(nameId, [symbolName]);
    }

    private asIsSymbolNameId(symbolName: string): string {
        return `AsIs:${symbolName}`;
    }

    public addRootClientSymbolName(symbolNameCandidates: [string, ...string[]]) {
        const nameId = this.rootClientSymbolNameId();
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public getRootClientSymbolNameOrThrow() {
        return this.namespace.getSymbolNameByIdOrThrow(this.rootClientSymbolNameId());
    }

    private rootClientSymbolNameId(): string {
        return `RootClientClass`;
    }

    public addEnvironmentSymbolName(symbolNameCandidates: [string, ...string[]]) {
        const nameId = this.environmentSymbolNameId();
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public getEnvironmentSymbolNameOrThrow() {
        return this.namespace.getSymbolNameByIdOrThrow(this.environmentSymbolNameId());
    }

    private environmentSymbolNameId(): string {
        return `EnvironmentEnum`;
    }

    public addRequestsContainerSymbolName(symbolNameCandidates: [string, ...string[]]) {
        const nameId = this.requestsContainerSymbolNameId();
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public getRequestsContainerSymbolNameOrThrow() {
        return this.namespace.getSymbolNameByIdOrThrow(this.requestsContainerSymbolNameId());
    }

    private requestsContainerSymbolNameId(): string {
        return `RequestsContainer`;
    }

    public addSubClientSymbolName(subpackageId: string, symbolNameCandidates: [string, ...string[]]) {
        const nameId = this.subClientSymbolNameId(subpackageId);
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public getSubClientSymbolNameOrThrow(subpackageId: string) {
        return this.namespace.getSymbolNameByIdOrThrow(this.subClientSymbolNameId(subpackageId));
    }

    private subClientSymbolNameId(subpackageId: string): string {
        return `SubClient:${subpackageId}`;
    }

    public addSchemaTypeSymbolName(typeId: string, symbolNameCandidates: [string, ...string[]]) {
        const nameId = this.schemaTypeSymbolNameId(typeId);
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public getSchemaTypeSymbolNameOrThrow(typeId: string) {
        const nameId = this.schemaTypeSymbolNameId(typeId);
        return this.namespace.getSymbolNameByIdOrThrow(nameId);
    }

    private schemaTypeSymbolNameId(typeId: string): string {
        return `SchemaType:${typeId}`;
    }
}
