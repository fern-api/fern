import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";

export declare namespace AbstractEndpointDeclaration {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
    }
}

export abstract class AbstractEndpointDeclaration {
    protected service: HttpService;
    protected endpoint: HttpEndpoint;

    constructor({ service, endpoint }: AbstractEndpointDeclaration.Init) {
        this.service = service;
        this.endpoint = endpoint;
    }

    protected getReferenceToEndpointFileType(typeName: string, file: SdkFile): ts.EntityName {
        return AbstractEndpointDeclaration.getReferenceToEndpointFileType({
            typeName,
            file,
            serviceName: this.service.name,
            endpoint: this.endpoint,
        });
    }

    protected static getReferenceToEndpointFileType({
        typeName,
        file,
        serviceName,
        endpoint,
    }: {
        typeName: string;
        file: SdkFile;
        serviceName: DeclaredServiceName;
        endpoint: HttpEndpoint;
    }): ts.EntityName {
        return ts.factory.createQualifiedName(
            file.getReferenceToEndpointFile(serviceName, endpoint).entityName,
            typeName
        );
    }
}
