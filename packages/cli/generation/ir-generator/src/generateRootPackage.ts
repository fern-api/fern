import { FernFilepath } from "@fern-fern/ir-model/commons";
import { IntermediateRepresentation, Package, Subpackage } from "@fern-fern/ir-model/ir";
import { IdGenerator } from "./IdGenerator";

export function generateRootPackage(
    ir: Pick<IntermediateRepresentation, "types" | "errors" | "services">
): Pick<IntermediateRepresentation, "subpackages" | "rootPackage"> {
    const subpackages: IntermediateRepresentation["subpackages"] = {};
    const rootPackage: IntermediateRepresentation["rootPackage"] = {
        fernFilepath: {
            allParts: [],
            packagePath: [],
            file: undefined,
        },
        service: undefined,
        types: [],
        errors: [],
        subpackages: [],
    };

    const getSubpackageForFernFilepath = (fernFilepath: FernFilepath, index = 0, parent = rootPackage): Package => {
        const nextPart = fernFilepath.allParts[index];
        if (nextPart == null) {
            return parent;
        }
        const subpackagesInParent = parent.subpackages.map((subpackageId) => {
            const subpackage = subpackages[subpackageId];
            if (subpackage == null) {
                throw new Error("Subpackage ID is invalid: " + subpackageId);
            }
            return subpackage;
        });

        const nextIndex = index + 1;
        const fernFilepathForNextParent: FernFilepath = {
            allParts: fernFilepath.allParts.slice(0, nextIndex),
            packagePath: fernFilepath.packagePath.slice(0, nextIndex),
            file: nextIndex === fernFilepath.allParts.length ? fernFilepath.file : undefined,
        };
        let nextParent = subpackagesInParent.find(
            (subpackage) => subpackage.name.originalName === nextPart.originalName
        );
        if (nextParent == null) {
            const newParentId = IdGenerator.generateSubpackageId(fernFilepathForNextParent);
            const newParent: Subpackage = {
                fernFilepath: fernFilepathForNextParent,
                name: nextPart,
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
            };
            subpackages[newParentId] = newParent;
            parent.subpackages.push(newParentId);
            nextParent = newParent;
        }

        return getSubpackageForFernFilepath(fernFilepath, nextIndex, nextParent);
    };

    for (const [typeId, type] of Object.entries(ir.types)) {
        const subpackage = getSubpackageForFernFilepath(type.name.fernFilepath);
        subpackage.types.push(typeId);
    }
    for (const [errorId, error] of Object.entries(ir.errors)) {
        const subpackage = getSubpackageForFernFilepath(error.name.fernFilepath);
        subpackage.errors.push(errorId);
    }
    for (const [serviceId, service] of Object.entries(ir.services)) {
        const subpackage = getSubpackageForFernFilepath(service.name.fernFilepath);
        if (subpackage.service != null) {
            throw new Error("Found duplicate service for " + serviceId);
        }
        subpackage.service = serviceId;
    }

    return {
        subpackages,
        rootPackage,
    };
}
