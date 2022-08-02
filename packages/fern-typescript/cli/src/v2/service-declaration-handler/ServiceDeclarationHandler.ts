import { HttpService } from "@fern-fern/ir-model/services";
import { DeclarationHandlerArgs } from "../client/types";
import { generateHttpService } from "./http/generateHttpService";

export interface ServiceDeclarationHandler {
    run: (typeDeclaration: HttpService, args: DeclarationHandlerArgs) => Promise<void>;
}

export const ServiceDeclarationHandler: ServiceDeclarationHandler = {
    run: async (serviceDeclaration, { withFile }) => {
        await withFile((file) => {
            generateHttpService({ service: serviceDeclaration, file });
        });
    },
};
