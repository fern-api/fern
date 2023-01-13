import { FernFilepath } from "@fern-fern/ir-model/commons";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { AugmentedService } from "@fern-typescript/commons-v2";
import { isEqual } from "lodash-es";
import { StringifiedFernFilepath, stringifyFernFilepath } from "./stringify-fern-filepath";

export class ServiceResolver {
    private resolvedServices: Record<StringifiedFernFilepath, AugmentedService> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        this.resolvedServices = constructAugmentedServices(intermediateRepresentation);
    }

    public getAllAugmentedServices(): AugmentedService[] {
        return Object.values(this.resolvedServices);
    }

    public getServiceDeclarationFromName(service: FernFilepath): AugmentedService {
        const resolvedService = this.resolvedServices[stringifyFernFilepath(service)];
        if (resolvedService == null) {
            throw new Error("Service not found: " + serviceNameToString(service));
        }
        return resolvedService;
    }
}

function serviceNameToString(service: FernFilepath) {
    return stringifyFernFilepath(service);
}

function constructAugmentedServices(
    intermediateRepresentation: IntermediateRepresentation
): Record<StringifiedFernFilepath, AugmentedService> {
    const resolvedServices: Record<StringifiedFernFilepath, AugmentedService> = {};

    for (const service of intermediateRepresentation.services) {
        const leafServiceFernFilepath = stringifyFernFilepath(service.name.fernFilepath);
        const leafService: AugmentedService = {
            wrappedServices: resolvedServices[leafServiceFernFilepath]?.wrappedServices ?? [],
            originalService: service,
            fernFilepath: service.name.fernFilepath,
            apiWideHeaders: intermediateRepresentation.headers,
        };
        resolvedServices[leafServiceFernFilepath] = leafService;

        let lastDeclaredService = leafService;
        for (let index = service.name.fernFilepath.length - 1; index >= 0; index--) {
            const fernFilepath = service.name.fernFilepath.slice(0, index);

            const wrapper = (resolvedServices[stringifyFernFilepath(fernFilepath)] ??= {
                fernFilepath,
                wrappedServices: [],
                originalService: undefined,
                apiWideHeaders: intermediateRepresentation.headers,
            });
            if (!wrapper.wrappedServices.some((wrapped) => isEqual(wrapped, lastDeclaredService.fernFilepath))) {
                wrapper.wrappedServices.push(lastDeclaredService.fernFilepath);
            }
            lastDeclaredService = wrapper;
        }
    }

    return resolvedServices;
}
