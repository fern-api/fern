import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ImportsManager } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

export declare namespace ReactQueryProviderGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        namespaceExport: string;
        clientClassName: string;
    }
}

export class ReactQueryProviderGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private namespaceExport: string;
    private clientClassName: string;

    constructor({ intermediateRepresentation, namespaceExport, clientClassName }: ReactQueryProviderGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.namespaceExport = namespaceExport;
        this.clientClassName = clientClassName;
    }

    public generateProvider({
        file,
        importsManager
    }: {
        file: SourceFile;
        importsManager: ImportsManager;
    }): void {
        importsManager.addImport("react", "createContext");
        importsManager.addImport("react", "ReactNode");

        const providerName = `${this.namespaceExport}Provider`;
        const contextName = "SdkClientContext";

        const contextCode = `
export const ${contextName} = createContext<any | null>(null);
`;

        const providerCode = `
export interface ${providerName}Props {
    client: any;
    children: ReactNode;
}

export function ${providerName}({ client, children }: ${providerName}Props) {
    return (
        <${contextName}.Provider value={client}>
            {children}
        </${contextName}.Provider>
    );
}
`;

        file.addStatements(contextCode);
        file.addStatements(providerCode);
    }
}
