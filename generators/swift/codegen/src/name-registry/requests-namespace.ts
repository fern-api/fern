import { SymbolRegistry as Namespace } from "@fern-api/core-utils";

export class RequestsNamespace {
    private readonly namespace: Namespace;

    public constructor() {
        this.namespace = new Namespace();
    }

    public getRequestTypeNameOrThrow(endpointId: string, requestNamePascalCase: string) {
        const nameId = this.requestTypeNameId(endpointId, requestNamePascalCase);
        return this.namespace.getSymbolNameByIdOrThrow(nameId);
    }

    public addRequestTypeSymbol(
        endpointId: string,
        requestNamePascalCase: string,
        symbolNameCandidates: [string, ...string[]]
    ) {
        const nameId = this.requestTypeNameId(endpointId, requestNamePascalCase);
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    private requestTypeNameId(endpointId: string, requestNamePascalCase: string): string {
        return `${endpointId}_${requestNamePascalCase}`;
    }
}
