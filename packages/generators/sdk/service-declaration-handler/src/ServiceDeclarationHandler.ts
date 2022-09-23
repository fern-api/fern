import { HttpService } from "@fern-fern/ir-model/services/http";
import { SdkDeclarationHandler } from "@fern-typescript/sdk-declaration-handler";
import { generateHttpService } from "./http/generateHttpService";

export const ServiceDeclarationHandler: SdkDeclarationHandler<HttpService> = {
    run: async (serviceDeclaration, { file }) => {
        generateHttpService({ service: serviceDeclaration, file });
    },
};
