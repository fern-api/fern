import {
    FernWorkspace,
    getDefinitionFile,
    visitAllDefinitionFiles,
    visitAllPackageMarkers
} from "@fern-api/api-workspace-commons";
import { HttpEndpointReferenceParser } from "@fern-api/fern-definition-schema";
import { HttpMethod } from "@fern-api/ir-sdk";

import { FernFileContext, constructFernFileContext } from "../FernFileContext";
import { CASINGS_GENERATOR } from "../utils/getAllPropertiesForObject";
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

    public resolveEndpointByMethodAndPath({
        method,
        path
    }: {
        method: HttpMethod;
        path: string;
    }): ResolvedEndpoint | undefined {
        let result: ResolvedEndpoint | undefined = undefined;
        visitAllDefinitionFiles(this.workspace, (relativeFilepath, file, metadata) => {
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
        visitAllPackageMarkers(this.workspace, (relativeFilepath, packageMarker) => {
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

    public resolveEndpoint({
        endpoint,
        file
    }: {
        endpoint: string;
        file: FernFileContext;
    }): ResolvedEndpoint | undefined {
        const referenceParser = new HttpEndpointReferenceParser();
        const parsedEndpointReference = referenceParser.tryParse(endpoint);
        if (parsedEndpointReference != null) {
            return this.resolveEndpointByMethodAndPath(parsedEndpointReference);
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
