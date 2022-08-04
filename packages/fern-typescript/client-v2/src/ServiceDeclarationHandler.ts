import { HttpService } from "@fern-fern/ir-model/services";
import { DeclarationHandler } from "@fern-typescript/declaration-handler";
import { generateHttpService } from "./http/generateHttpService";

export const ServiceDeclarationHandler: DeclarationHandler<HttpService> = {
    run: async (serviceDeclaration, { withFile }) => {
        await withFile((file) => {
            generateHttpService({ service: serviceDeclaration, file });
        });
    },
};
