import { SymbolRegistry as Namespace } from "@fern-api/core-utils";

export class ModuleNamespace {
    private readonly namespace: Namespace;

    public constructor() {
        this.namespace = new Namespace();
    }

    private asIsNameId(symbolName: string): string {
        return `AsIs:${symbolName}`;
    }

    private rootClientNameId(): string {
        return `RootClientClass`;
    }

    private environmentNameId(): string {
        return `EnvironmentEnum`;
    }

    private requestsContainerNameId(): string {
        return `RequestsContainer`;
    }

    private requestTypeNameId(endpointId: string, requestNamePascalCase: string): string {
        return `RequestType:${endpointId}:${requestNamePascalCase}`;
    }

    private subClientNameId(subpackageId: string): string {
        return `SubClient:${subpackageId}`;
    }

    private schemaTypeNameId(typeId: string): string {
        return `SchemaType:${typeId}`;
    }

    public getRootClientNameOrThrow() {
        return this.namespace.getSymbolNameByIdOrThrow(this.rootClientNameId());
    }

    public getEnvironmentNameOrThrow() {
        return this.namespace.getSymbolNameByIdOrThrow(this.environmentNameId());
    }

    public getRequestsContainerNameOrThrow() {
        return this.namespace.getSymbolNameByIdOrThrow(this.requestsContainerNameId());
    }

    public getRequestTypeNameOrThrow(endpointId: string, requestNamePascalCase: string) {
        return this.namespace.getSymbolNameByIdOrThrow(this.requestTypeNameId(endpointId, requestNamePascalCase));
    }

    public getSubClientNameOrThrow(subpackageId: string) {
        return this.namespace.getSymbolNameByIdOrThrow(this.subClientNameId(subpackageId));
    }

    public getSchemaTypeNameOrThrow(typeId: string) {
        return this.namespace.getSymbolNameByIdOrThrow(this.schemaTypeNameId(typeId));
    }

    // Setters

    public addAsIsSymbol(symbolName: string) {
        const nameId = this.asIsNameId(symbolName);
        this.namespace.registerSymbol(nameId, [symbolName]);
    }

    public addRootClientSymbol(symbolNameCandidates: [string, ...string[]]) {
        const nameId = this.rootClientNameId();
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public addEnvironmentSymbol(symbolNameCandidates: [string, ...string[]]) {
        const nameId = this.environmentNameId();
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public addRequestsContainerSymbol(symbolNameCandidates: [string, ...string[]]) {
        const nameId = `RequestsContainer`;
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public addRequestTypeSymbol(endpointId: string, requestNamePascalCase: string) {
        const nameId = this.requestTypeNameId(endpointId, requestNamePascalCase);
        return this.namespace.registerSymbol(nameId, [requestNamePascalCase]);
    }

    public addSubClientSymbol(subpackageId: string, symbolNameCandidates: [string, ...string[]]) {
        const nameId = this.subClientNameId(subpackageId);
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public addSchemaTypeSymbol(typeId: string, symbolNameCandidates: [string, ...string[]]) {
        const nameId = `SchemaType:${typeId}`;
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }
}
