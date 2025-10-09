import { SymbolRegistry as Namespace } from "@fern-api/core-utils";

export class RequestsNamespace {
    private readonly namespace: Namespace;

    public constructor() {
        this.namespace = new Namespace();
    }

    public addRequestTypeSymbol(
        endpointId: string,
        requestNamePascalCase: string,
        symbolNameCandidates: [string, ...string[]]
    ) {
        const nameId = `${endpointId}_${requestNamePascalCase}`;
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }
}
