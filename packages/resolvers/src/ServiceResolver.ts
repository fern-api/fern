import { FernFilepath } from "@fern-fern/ir-model/commons";
import { DeclaredServiceName, HttpService } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { AugmentedService, stringifyFernFilepath } from "@fern-typescript/commons";
import { StringifiedFernFilepath } from "@fern-typescript/commons/src/stringifyFernFilepath";

export class ServiceResolver {
    private resolvedServices: Record<StringifiedFernFilepath, AugmentedService> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        this.resolvedServices = constructAugmentedServices(intermediateRepresentation);
    }

    public getAllAugmentedServices(): AugmentedService[] {
        return Object.values(this.resolvedServices);
    }

    public getAugmentedServiceFromName(service: DeclaredServiceName): AugmentedService {
        const resolvedService = this.resolvedServices[stringifyFernFilepath(service.fernFilepath)];
        if (resolvedService == null) {
            throw new Error("Service not found: " + serviceNameToString(service));
        }
        return resolvedService;
    }

    public getServiceDeclarationFromName(service: DeclaredServiceName): HttpService {
        const resolvedService = this.resolvedServices[stringifyFernFilepath(service.fernFilepath)];
        if (resolvedService?.originalService == null) {
            throw new Error("Service not found: " + serviceNameToString(service));
        }
        return resolvedService.originalService;
    }
}

function serviceNameToString(service: DeclaredServiceName) {
    return stringifyFernFilepath(service.fernFilepath);
}

function constructAugmentedServices(
    intermediateRepresentation: IntermediateRepresentation
): Record<StringifiedFernFilepath, AugmentedService> {
    const resolvedServices: Record<StringifiedFernFilepath, AugmentedService> = {};

    for (const service of Object.values(intermediateRepresentation.services)) {
        const leafServiceFernFilepath = stringifyFernFilepath(service.name.fernFilepath);
        const leafService: AugmentedService = {
            name: service.name,
            wrappedServices: resolvedServices[leafServiceFernFilepath]?.wrappedServices ?? [],
            originalService: service,
        };
        resolvedServices[leafServiceFernFilepath] = leafService;

        let lastService = leafService;

        for (let index = service.name.fernFilepath.allParts.length - 1; index >= 0; index--) {
            const parentPackagePath = service.name.fernFilepath.packagePath.slice(0, index);
            const parentFernFilepath: FernFilepath = {
                allParts: parentPackagePath,
                packagePath: parentPackagePath,
                file: undefined,
            };

            const parent = (resolvedServices[stringifyFernFilepath(parentFernFilepath)] ??= {
                name: { fernFilepath: parentFernFilepath },
                wrappedServices: [],
                originalService: undefined,
            });

            const isLastServiceInParent = parent.wrappedServices.some(
                (wrapped) =>
                    stringifyFernFilepath(wrapped.fernFilepath) === stringifyFernFilepath(lastService.name.fernFilepath)
            );
            if (!isLastServiceInParent) {
                parent.wrappedServices.push(lastService.name);
            }
            lastService = parent;
        }
    }

    return resolvedServices;
}
