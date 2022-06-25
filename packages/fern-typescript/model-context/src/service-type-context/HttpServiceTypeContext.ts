import { EndpointId, FernFilepath, ServiceName } from "@fern-api/api";
import { ImportStrategy } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { BaseServiceTypeContext, ServiceTypeMetadata } from "./BaseServiceTypeContext";
import { GeneratedRequest, InlinedServiceTypeReference, ServiceTypeReference } from "./types";

export type HttpServiceTypeReference = ServiceTypeReference<HttpServiceTypeMetadata>;
export type InlinedHttpServiceTypeReference = InlinedServiceTypeReference<HttpServiceTypeMetadata>;

export interface GeneratedHttpEndpointTypes {
    request: GeneratedRequest<HttpServiceTypeMetadata>;
    response: {
        reference: InlinedHttpServiceTypeReference;
        successBodyReference: HttpServiceTypeReference | undefined;
        errorBodyReference: InlinedHttpServiceTypeReference;
    };
}

export interface HttpServiceTypeMetadata {
    serviceName: ServiceName;
    endpointId: EndpointId;
    typeName: string;
}

type NonQualifiedServiceName = string;

export declare namespace HttpServiceTypeContext {
    namespace getReferenceToHttpServiceType {
        interface Args {
            metadata: HttpServiceTypeMetadata;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }

    namespace getReferenceToHttpServiceTypeUtils {
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

    public addHttpServiceTypeDeclaration(
        metadata: HttpServiceTypeMetadata,
        withFile: (file: SourceFile) => void
    ): void {
        this.addServiceTypeDeclaration(convertToServiceTypeMetadata(metadata), withFile);
    }

    public getReferenceToHttpServiceType({
        metadata,
        importStrategy,
        referencedIn,
    }: HttpServiceTypeContext.getReferenceToHttpServiceType.Args): ts.TypeReferenceNode {
        return this.getReferenceToServiceType({
            metadata: convertToServiceTypeMetadata(metadata),
            importStrategy,
            referencedIn,
        });
    }

    public getReferenceToHttpServiceTypeUtils({
        metadata,
        referencedIn,
        importStrategy,
    }: HttpServiceTypeContext.getReferenceToHttpServiceTypeUtils.Args): ts.Expression {
        return this.getReferenceToServiceTypeUtils({
            metadata: convertToServiceTypeMetadata(metadata),
            referencedIn,
            importStrategy,
        });
    }

    public registerGeneratedTypes({
        serviceName,
        endpointId,
        generatedTypes,
    }: HttpServiceTypeContext.registerGeneratedTypes.Args): void {
        const generatedTypesForPackage = (this.generatedTypes[serviceName.fernFilepath] ??= {});
        const generatedTypesForService = (generatedTypesForPackage[serviceName.name] ??= {});
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
