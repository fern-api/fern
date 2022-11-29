import { AugmentedService } from "@fern-typescript/commons-v2";
import { GeneratorContext, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { generateHttpService } from "./http/generateHttpService";

export declare namespace ServiceDeclarationHandler {
    export interface Args {
        serviceFile: SdkFile;
        serviceClassName: string;
        context: GeneratorContext;
    }
}

export function ServiceDeclarationHandler(
    service: AugmentedService,
    { serviceFile, serviceClassName }: ServiceDeclarationHandler.Args
): void {
    generateHttpService({ service, serviceFile, serviceClassName });
}
