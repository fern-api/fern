import { HttpService } from "@fern-fern/ir-model/services/http";
import { GeneratorContext, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { generateHttpService } from "./http/generateHttpService";

export declare namespace ServiceDeclarationHandler {
    export interface Args {
        serviceFile: SdkFile;
        serviceClassName: string;
        context: GeneratorContext;
        withEndpoint: (endpointId: string, run: (args: ServiceDeclarationHandler.withEndpoint.Args) => void) => void;
    }

    export namespace withEndpoint {
        export interface Args {
            endpointFile: SdkFile;
            schemaFile: SdkFile;
        }
    }
}

export function ServiceDeclarationHandler(
    service: HttpService,
    { serviceFile, serviceClassName, withEndpoint }: ServiceDeclarationHandler.Args
): void {
    generateHttpService({ service, serviceFile, serviceClassName, withEndpoint });
}
