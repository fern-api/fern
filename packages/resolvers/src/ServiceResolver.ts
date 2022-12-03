import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { AugmentedService } from "@fern-typescript/commons-v2";
import { isEqual } from "lodash-es";
import path from "path";
import { StringifiedFernFilepath, stringifyFernFilepath } from "./stringify-fern-filepath";

type SimpleServiceName = string;
const WRAPPER_SIMPLE_NAME: SimpleServiceName = "__WRAPPER";

export class ServiceResolver {
    private resolvedServices: Record<StringifiedFernFilepath, Record<SimpleServiceName, AugmentedService>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        this.resolvedServices = constructAugmentedServices(intermediateRepresentation);
    }

    public getAllAugmentedServices(): AugmentedService[] {
        return Object.values(this.resolvedServices).flatMap((nameToServices) => Object.values(nameToServices));
    }

    public getServiceDeclarationFromName(serviceName: DeclaredServiceName): AugmentedService {
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

function constructAugmentedServices(
    intermediateRepresentation: IntermediateRepresentation
): Record<StringifiedFernFilepath, Record<SimpleServiceName, AugmentedService>> {
    const resolvedServices: Record<StringifiedFernFilepath, Record<SimpleServiceName, AugmentedService>> = {};

    for (const service of intermediateRepresentation.services.http) {
        const leafService: AugmentedService = {
            wrappedServices: [],
            ...resolvedServices[stringifyFernFilepath(service.name.fernFilepath)],
            originalService: service,
            name: service.name,
            apiWideHeaders: intermediateRepresentation.headers,
        };
        const servicesAtSameFernFilepath = (resolvedServices[stringifyFernFilepath(service.name.fernFilepath)] ??= {});
        servicesAtSameFernFilepath[service.name.name] = leafService;

        let lastDeclaredService = leafService;
        for (let index = service.name.fernFilepath.length - 1; index >= 0; index--) {
            const fernFilepath = service.name.fernFilepath.slice(0, index);
            const fernFilepathV2 = service.name.fernFilepathV2.slice(0, index);

            const servicesAtFernFilepath = (resolvedServices[stringifyFernFilepath(fernFilepath)] ??= {});

            const wrapper = (servicesAtFernFilepath[WRAPPER_SIMPLE_NAME] ??= {
                name: {
                    name: WRAPPER_SIMPLE_NAME,
                    fernFilepath,
                    fernFilepathV2,
                },
                wrappedServices: [],
                originalService: undefined,
                apiWideHeaders: intermediateRepresentation.headers,
            });
            if (!wrapper.wrappedServices.some((wrapped) => isEqual(wrapped, lastDeclaredService.name))) {
                wrapper.wrappedServices.push(lastDeclaredService.name);
            }
            lastDeclaredService = wrapper;
        }
    }

    return resolvedServices;
}
