import { EndpointId, ServiceName } from "@fern-fern/ir-model/services";
import { ImportStrategy } from "@fern-typescript/commons";
import { SourceFile, ts } from "ts-morph";
import { BaseServiceTypeContext, ServiceTypeMetadata } from "./BaseServiceTypeContext";
import {
    GeneratedRequest,
    InlinedServiceTypeReference,
    ModelServiceTypeReference,
    ServiceTypeReference,
} from "./types";

export type HttpServiceTypeReference = ServiceTypeReference<HttpServiceTypeMetadata>;
export type InlinedHttpServiceTypeReference = InlinedServiceTypeReference<HttpServiceTypeMetadata>;

export interface GeneratedHttpClientEndpointTypes {
    request: GeneratedRequest<HttpServiceTypeMetadata>;
    response: {
        reference: InlinedHttpServiceTypeReference;
        successBodyReference: HttpServiceTypeReference | undefined;
        errorBodyReference: InlinedHttpServiceTypeReference;
    };
}

export interface GeneratedHttpServerEndpointTypes {
    request: GeneratedRequest<HttpServiceTypeMetadata>;
    response: ModelServiceTypeReference | undefined;
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
}

export class HttpServiceTypeContext extends BaseServiceTypeContext {
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
}

function convertToServiceTypeMetadata(httpMetadata: HttpServiceTypeMetadata): ServiceTypeMetadata {
    return {
        typeName: httpMetadata.typeName,
        fernFilepath: httpMetadata.serviceName.fernFilepath,
        relativeFilepathInServiceTypesDirectory: [httpMetadata.serviceName.name],
    };
}
