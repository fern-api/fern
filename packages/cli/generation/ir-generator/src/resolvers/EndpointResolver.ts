import { FernWorkspace, getDefinitionFile } from "@fern-api/workspace-loader";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { parseReferenceToEndpointName } from "../utils/parseReferenceToEndpointName";
import { ResolvedEndpoint } from "./ResolvedEndpoint";

export interface EndpointResolver {
    resolveEndpoint: (args: { endpoint: string; file: FernFileContext }) => Promise<ResolvedEndpoint | undefined>;
    resolveEndpointOrThrow: (args: { endpoint: string; file: FernFileContext }) => Promise<ResolvedEndpoint>;
}

interface RawEndpointInfo {
    endpointName: string;
    file: FernFileContext;
}

export class EndpointResolverImpl implements EndpointResolver {
    constructor(private readonly workspace: FernWorkspace) {}

    public async resolveEndpointOrThrow({
        endpoint,
        file
    }: {
        endpoint: string;
        file: FernFileContext;
    }): Promise<ResolvedEndpoint> {
        const resolvedEndpoint = await this.resolveEndpoint({ endpoint, file });
        if (resolvedEndpoint == null) {
            throw new Error("Cannot resolve endpoint: " + endpoint + " in file " + file.relativeFilepath);
        }
        return resolvedEndpoint;
    }

    public async resolveEndpoint({
        endpoint,
        file
    }: {
        endpoint: string;
        file: FernFileContext;
    }): Promise<ResolvedEndpoint | undefined> {
        const maybeDeclaration = await this.getDeclarationOfEndpoint({
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

    public async getDeclarationOfEndpoint({
        referenceToEndpoint,
        file
    }: {
        referenceToEndpoint: string;
        file: FernFileContext;
    }): Promise<RawEndpointInfo | undefined> {
        const parsedReference = parseReferenceToEndpointName({
            reference: referenceToEndpoint,
            referencedIn: file.relativeFilepath,
            imports: file.imports
        });
        if (parsedReference == null) {
            return undefined;
        }
        const definitionFile = await getDefinitionFile(this.workspace, parsedReference.relativeFilepath);
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
                rootApiFile: (await this.workspace.getDefinition()).rootApiFile.contents
            })
        };
    }
}
