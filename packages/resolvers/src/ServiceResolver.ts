import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { DeclaredServiceName, HttpService } from "@fern-fern/ir-model/services";
import path from "path";
import { StringifiedFernFilepath, stringifyFernFilepath } from "./stringify-fern-filepath";

type SimpleServiceName = string;

export class ServiceResolver {
    private resolvedServices: Record<StringifiedFernFilepath, Record<SimpleServiceName, HttpService>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        for (const httpService of intermediateRepresentation.services.http) {
            const servicesAtFilepath = (this.resolvedServices[stringifyFernFilepath(httpService.name.fernFilepath)] ??=
                {});
            servicesAtFilepath[httpService.name.name] = httpService;
        }
    }

    public getServiceDeclarationFromName(serviceName: DeclaredServiceName): HttpService {
        const resolvedService =
            this.resolvedServices[stringifyFernFilepath(serviceName.fernFilepath)]?.[serviceName.name];
        if (resolvedService == null) {
            throw new Error("Service not found: " + serviceNameToString(serviceName));
        }
        return resolvedService;
    }
}

function serviceNameToString(serviceName: DeclaredServiceName) {
    return path.join(stringifyFernFilepath(serviceName.fernFilepath), serviceName.name);
}
