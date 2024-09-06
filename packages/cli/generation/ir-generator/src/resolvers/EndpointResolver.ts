import { HttpEndpointReferenceParser } from "@fern-api/fern-definition-schema";
import { HttpMethod } from "@fern-api/ir-sdk";
import {
    FernWorkspace,
    getDefinitionFile,
    visitAllDefinitionFiles,
    visitAllPackageMarkers
} from "@fern-api/workspace-loader";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { CASINGS_GENERATOR } from "../utils/getAllPropertiesForObject";
import { parseReferenceToEndpointName } from "../utils/parseReferenceToEndpointName";
import { ResolvedEndpoint } from "./ResolvedEndpoint";

export interface EndpointResolver {
    // Resolves an endpoint reference specified in a Fern definition (e.g. "auth.getToken").
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

    public async resolveEndpointByMethodAndPath({
        method,
        path
    }: {
        method: HttpMethod;
        path: string;
    }): Promise<ResolvedEndpoint | undefined> {
        let result: ResolvedEndpoint | undefined = undefined;
        await visitAllDefinitionFiles(this.workspace, async (relativeFilepath, file, metadata) => {
            const context = constructFernFileContext({
                relativeFilepath,
                definitionFile: file,
                casingsGenerator: CASINGS_GENERATOR,
                rootApiFile: this.workspace.definition.rootApiFile.contents,
                defaultUrl: metadata.defaultUrl
            });
            for (const [endpointId, endpointDeclaration] of Object.entries(file.service?.endpoints ?? {})) {
                if (endpointDeclaration.method === method && endpointDeclaration.path === path) {
                    result = {
                        endpointId,
                        endpoint: endpointDeclaration,
                        file: context
                    };
                }
            }
        });
        await visitAllPackageMarkers(this.workspace, async (relativeFilepath, packageMarker) => {
            const context = constructFernFileContext({
                relativeFilepath,
                definitionFile: packageMarker,
                casingsGenerator: CASINGS_GENERATOR,
                rootApiFile: this.workspace.definition.rootApiFile.contents
            });
            for (const [endpointId, endpointDeclaration] of Object.entries(packageMarker.service?.endpoints ?? {})) {
                if (endpointDeclaration.method === method && endpointDeclaration.path === path) {
                    result = {
                        endpointId,
                        endpoint: endpointDeclaration,
                        file: context
                    };
                }
            }
        });
        return result;
    }

    public async resolveEndpoint({
        endpoint,
        file
    }: {
        endpoint: string;
        file: FernFileContext;
    }): Promise<ResolvedEndpoint | undefined> {
        const referenceParser = new HttpEndpointReferenceParser();
        const parsedEndpointReference = referenceParser.tryParse(endpoint);
        if (parsedEndpointReference != null) {
            return await this.resolveEndpointByMethodAndPath(parsedEndpointReference);
        }

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
