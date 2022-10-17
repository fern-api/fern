import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { Reference, SdkFile } from "@fern-typescript/sdk-declaration-handler";

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

    protected getReferenceToEndpointFileExport(export_: string, file: SdkFile): Reference {
        return AbstractEndpointDeclaration.getReferenceToEndpointFileExport({
            export_,
            file,
            serviceName: this.service.name,
            endpoint: this.endpoint,
        });
    }

    protected static getReferenceToEndpointFileExport({
        export_,
        file,
        serviceName,
        endpoint,
    }: {
        export_: string;
        file: SdkFile;
        serviceName: DeclaredServiceName;
        endpoint: HttpEndpoint;
    }): Reference {
        return file.getReferenceToEndpointFileExport(serviceName, endpoint, export_);
    }
}
