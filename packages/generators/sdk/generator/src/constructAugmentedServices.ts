import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { AugmentedService } from "@fern-typescript/commons-v2";
import { isEqual } from "lodash-es";
import { StringifiedFernFilepath, stringifyFernFilepath } from "./utils/stringifyFernFilepath";

export function constructAugmentedServices(intermediateRepresentation: IntermediateRepresentation): AugmentedService[] {
    const augmentedServices: Record<StringifiedFernFilepath, AugmentedService> = {};

    for (const service of intermediateRepresentation.services.http) {
        const leafService: AugmentedService = {
            wrappedServices: [],
            ...augmentedServices[stringifyFernFilepath(service.name.fernFilepath)],
            originalService: service,
            name: service.name,
        };
        augmentedServices[stringifyFernFilepath(service.name.fernFilepath)] = leafService;

        let lastDeclaredService = leafService;
        for (let index = service.name.fernFilepath.length - 1; index >= 0; index--) {
            const fernFilepath = service.name.fernFilepath.slice(0, index);
            const fernFilepathV2 = service.name.fernFilepathV2.slice(0, index);

            const wrapper = (augmentedServices[stringifyFernFilepath(fernFilepath)] ??= {
                name: {
                    name: "Wrapper",
                    fernFilepath,
                    fernFilepathV2,
                },
                wrappedServices: [],
                originalService: undefined,
            });
            if (!wrapper.wrappedServices.some((wrapped) => isEqual(wrapped, lastDeclaredService.name))) {
                wrapper.wrappedServices.push(lastDeclaredService.name);
            }
            lastDeclaredService = wrapper;
        }
    }

    return Object.values(augmentedServices);
}
