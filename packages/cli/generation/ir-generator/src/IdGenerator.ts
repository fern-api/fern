import { FernIr } from "@fern-fern/ir-sdk";
import {
    DeclaredErrorName,
    DeclaredServiceName,
    DeclaredTypeName,
    FernFilepath,
    HttpEndpoint,
} from "@fern-fern/ir-sdk/api";

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
