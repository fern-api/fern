import { FernWorkspace, getDefinitionFile } from "@fern-api/workspace-loader";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { parseReferenceToEndpointName } from "../utils/parseReferenceToEndpointName";
import { ResolvedEndpoint } from "./ResolvedEndpoint";

export interface EndpointResolver {
    // Resolves an endpoint reference specified in a Fern definition (e.g. "auth.getToken").
    resolveEndpoint: (args: { endpoint: string; file: FernFileContext }) => ResolvedEndpoint | undefined;
    resolveEndpointOrThrow: (args: { endpoint: string; file: FernFileContext }) => ResolvedEndpoint;
}

interface RawEndpointInfo {
    endpointName: string;
    file: FernFileContext;
}

export class EndpointResolverImpl implements EndpointResolver {
    constructor(private readonly workspace: FernWorkspace) {}

    public resolveEndpointOrThrow({ endpoint, file }: { endpoint: string; file: FernFileContext }): ResolvedEndpoint {
        const resolvedEndpoint = this.resolveEndpoint({ endpoint, file });
        if (resolvedEndpoint == null) {
            throw new Error("Cannot resolve endpoint: " + endpoint + " in file " + file.relativeFilepath);
        }
        return resolvedEndpoint;
    }

    public resolveEndpoint({
        endpoint,
        file
    }: {
        endpoint: string;
        file: FernFileContext;
    }): ResolvedEndpoint | undefined {
        const maybeDeclaration = this.getDeclarationOfEndpoint({
            referenceToEndpoint: endpoint,
            file
        });
        if (maybeDeclaration == null) {
            return undefined;
        }
        const maybeEndpoint = maybeDeclaration.file.definitionFile.service?.endpoints?.[maybeDeclaration.endpointName];
        if (maybeEndpoint == null) {
            return undefined;
        }
        return {
            endpointId: maybeDeclaration.endpointName,
            endpoint: maybeEndpoint,
            file: maybeDeclaration.file
        };
    }

    public getDeclarationOfEndpoint({
        referenceToEndpoint,
        file
    }: {
        referenceToEndpoint: string;
        file: FernFileContext;
    }): RawEndpointInfo | undefined {
        const parsedReference = parseReferenceToEndpointName({
            reference: referenceToEndpoint,
            referencedIn: file.relativeFilepath,
            imports: file.imports
        });
        if (parsedReference == null) {
            return undefined;
        }
        const definitionFile = getDefinitionFile(this.workspace, parsedReference.relativeFilepath);
        if (definitionFile == null) {
            return undefined;
        }
        const declaration = definitionFile.service?.endpoints?.[parsedReference.endpointName];
        if (declaration == null) {
            return undefined;
        }
        return {
            endpointName: parsedReference.endpointName,
            file: constructFernFileContext({
                relativeFilepath: parsedReference.relativeFilepath,
                definitionFile,
                casingsGenerator: file.casingsGenerator,
                rootApiFile: this.workspace.definition.rootApiFile.contents
            })
        };
    }
}
