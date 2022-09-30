import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint, HttpEndpointId } from "@fern-fern/ir-model/services/http";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";

export declare namespace AbstractEndpointDeclaration {
    export interface Init {
        serviceName: DeclaredServiceName;
        endpoint: HttpEndpoint;
    }
}

export abstract class AbstractEndpointDeclaration {
    protected serviceName: DeclaredServiceName;
    protected endpoint: HttpEndpoint;

    constructor({ serviceName, endpoint }: AbstractEndpointDeclaration.Init) {
        this.serviceName = serviceName;
        this.endpoint = endpoint;
    }

    protected getReferenceToEndpointFileType(typeName: string, file: SdkFile): ts.EntityName {
        return AbstractEndpointDeclaration.getReferenceToEndpointFileType({
            typeName,
            file,
            serviceName: this.serviceName,
            endpointId: this.endpoint.id,
        });
    }

    protected static getReferenceToEndpointFileType({
        typeName,
        file,
        serviceName,
        endpointId,
    }: {
        typeName: string;
        file: SdkFile;
        serviceName: DeclaredServiceName;
        endpointId: HttpEndpointId;
    }): ts.EntityName {
        return ts.factory.createQualifiedName(
            file.getReferenceToEndpointFile(serviceName, endpointId).entityName,
            typeName
        );
    }
}
