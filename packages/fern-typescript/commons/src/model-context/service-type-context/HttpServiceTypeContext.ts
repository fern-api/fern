import { EndpointId, FernFilepath, ServiceName } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { ImportStrategy } from "../utils/ImportStrategy";
import { BaseServiceTypeContext, ServiceTypeMetadata } from "./BaseServiceTypeContext";
import { GeneratedRequest, InlinedServiceTypeReference, ServiceTypeReference } from "./types";

export type HttpServiceTypeReference = ServiceTypeReference<HttpServiceTypeMetadata>;

export interface GeneratedHttpEndpointTypes {
    request: GeneratedRequest<HttpServiceTypeMetadata>;
    response: {
        reference: InlinedServiceTypeReference<HttpServiceTypeMetadata>;
        successBodyReference: ServiceTypeReference<HttpServiceTypeMetadata> | undefined;
        errorBodyReference: ServiceTypeReference<HttpServiceTypeMetadata> | undefined;
    };
}

export interface HttpServiceTypeMetadata {
    serviceName: ServiceName;
    endpointId: EndpointId;
    typeName: string;
}

type NonQualifiedServiceName = string;

export declare namespace HttpServiceTypeContext {
    namespace getReferenceToServiceType {
        interface Args {
            metadata: HttpServiceTypeMetadata;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }

    namespace registerGeneratedTypes {
        interface Args {
            serviceName: ServiceName;
            endpointId: EndpointId;
            generatedTypes: GeneratedHttpEndpointTypes;
        }
    }

    namespace getGeneratedTypes {
        interface Args {
            serviceName: ServiceName;
            endpointId: EndpointId;
        }
    }
}

export class HttpServiceTypeContext extends BaseServiceTypeContext {
    private generatedTypes: Record<
        FernFilepath,
        Record<NonQualifiedServiceName, Record<EndpointId, GeneratedHttpEndpointTypes>>
    > = {};

    constructor(modelDirectory: Directory) {
        super(modelDirectory);
    }

    public addHttpServiceTypeDefinition(metadata: HttpServiceTypeMetadata, withFile: (file: SourceFile) => void): void {
        this.addServiceTypeDefinition(convertToServiceTypeMetadata(metadata), withFile);
    }

    public getReferenceToHttpServiceType({
        metadata,
        importStrategy,
        referencedIn,
    }: HttpServiceTypeContext.getReferenceToServiceType.Args): ts.TypeReferenceNode {
        return this.getReferenceToServiceType({
            metadata: convertToServiceTypeMetadata(metadata),
            importStrategy,
            referencedIn,
        });
    }

    public registerGeneratedTypes({
        serviceName,
        endpointId,
        generatedTypes,
    }: HttpServiceTypeContext.registerGeneratedTypes.Args): void {
        let generatedTypesForPackage = this.generatedTypes[serviceName.fernFilepath];
        if (generatedTypesForPackage == null) {
            generatedTypesForPackage = {};
            this.generatedTypes[serviceName.fernFilepath] = generatedTypesForPackage;
        }

        let generatedTypesForService = generatedTypesForPackage[serviceName.name];
        if (generatedTypesForService == null) {
            generatedTypesForService = {};
            generatedTypesForPackage[serviceName.name] = generatedTypesForService;
        }

        generatedTypesForService[endpointId] = generatedTypes;
    }

    public getGeneratedTypes({
        serviceName,
        endpointId,
    }: HttpServiceTypeContext.getGeneratedTypes.Args): GeneratedHttpEndpointTypes {
        const generatedTypes = this.generatedTypes[serviceName.fernFilepath]?.[serviceName.name]?.[endpointId];
        if (generatedTypes == null) {
            throw new Error(
                "Cannot find generated types for " + `${serviceName.fernFilepath}:${serviceName.name}:${endpointId}`
            );
        }
        return generatedTypes;
    }
}

function convertToServiceTypeMetadata(httpMetadata: HttpServiceTypeMetadata): ServiceTypeMetadata {
    return {
        typeName: httpMetadata.typeName,
        fernFilepath: httpMetadata.serviceName.fernFilepath,
        relativeFilepathInServiceTypesDirectory: [httpMetadata.serviceName.name],
    };
}
