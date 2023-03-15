import * as FernIr from "@fern-fern/ir-model";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { DeclaredServiceName, HttpEndpoint } from "@fern-fern/ir-model/http";
import { DeclaredTypeName } from "@fern-fern/ir-model/types";

export const IdGenerator = {
    generateTypeId: (typeName: Omit<DeclaredTypeName, "typeId">): FernIr.commons.TypeId => {
        const joinedFernFilePath = stringifyFernFilepath(typeName.fernFilepath);
        return `type_${joinedFernFilePath}:${typeName.name.originalName}`;
    },
    generateErrorId: (errorName: Omit<DeclaredErrorName, "errorId">): FernIr.commons.TypeId => {
        const joinedFernFilePath = stringifyFernFilepath(errorName.fernFilepath);
        return `error_${joinedFernFilePath}:${errorName.name.originalName}`;
    },
    generateServiceId: (serviceName: DeclaredServiceName): FernIr.commons.TypeId => {
        const joinedFernFilePath = stringifyFernFilepath(serviceName.fernFilepath);
        return `service_${joinedFernFilePath}`;
    },
    generateSubpackageId: (fernFilepath: FernFilepath): FernIr.commons.SubpackageId => {
        const joinedFernFilePath = stringifyFernFilepath(fernFilepath);
        return `subpackage_${joinedFernFilePath}`;
    },
    generateEndpointId: (declaredServiceName: DeclaredServiceName, httpEndpoint: HttpEndpoint): string => {
        const joinedFernFilePath = stringifyFernFilepath(declaredServiceName.fernFilepath);
        const endpointId = httpEndpoint.name.originalName;
        return `endpoint_${joinedFernFilePath}.${endpointId}`;
    },
};

function stringifyFernFilepath(fernFilepath: FernFilepath): string {
    return fernFilepath.allParts.map((part) => part.originalName).join("/");
}
