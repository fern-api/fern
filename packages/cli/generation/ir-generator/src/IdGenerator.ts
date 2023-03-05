import * as FernIr from "@fern-fern/ir-model";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { DeclaredTypeName } from "@fern-fern/ir-model/types";

export const IdGenerator = {
    generateTypeId: (typeName: Omit<DeclaredTypeName, "typeId">): FernIr.commons.TypeId => {
        return generateId(typeName.fernFilepath, "types", typeName.name.originalName);
    },
    generateErrorId: (errorName: Omit<DeclaredErrorName, "errorId">): FernIr.commons.TypeId => {
        return generateId(errorName.fernFilepath, "errors", errorName.name.originalName);
    },
    generateServiceId: (serviceName: DeclaredServiceName): FernIr.commons.TypeId => {
        return generateId(serviceName.fernFilepath, "service");
    },
    generateSubpackageId: (fernFilepath: FernFilepath): FernIr.commons.SubpackageId => {
        return generateId(fernFilepath, "subpackage");
    },
};

function generateId(fernFilepath: FernFilepath, namespace: string, name?: string): string {
    let id = generateFernFilepathIdPrefix(fernFilepath) + ":" + namespace;
    if (name != null) {
        id += "/" + name;
    }
    return id;
}

function generateFernFilepathIdPrefix(fernFilepath: FernFilepath): string {
    return fernFilepath.allParts.map((part) => part.originalName).join("/");
}
