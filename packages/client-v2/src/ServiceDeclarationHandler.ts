import { HttpService } from "@fern-fern/ir-model/services/http";
import { DeclarationHandler } from "@fern-typescript/declaration-handler";
import { generateHttpService } from "./http/generateHttpService";

export const ServiceDeclarationHandler: DeclarationHandler<HttpService> = {
    run: async (serviceDeclaration, { file }) => {
        generateHttpService({ service: serviceDeclaration, file });
    },
};
