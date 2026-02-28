import { DeclaredErrorName, DeclaredServiceName, DeclaredTypeName, FernFilepath, FernIr } from "@fern-api/ir-sdk";

import { stringifyFernFilepath } from "./stringifyFernFilepath.js";

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
    generateServiceIdFromFernFilepath: (fernFilepath: FernFilepath): FernIr.commons.TypeId => {
        const joinedFernFilePath = stringifyFernFilepath(fernFilepath);
        return `service_${joinedFernFilePath}`;
    },
    generateSubpackageId: (fernFilepath: FernFilepath): FernIr.commons.SubpackageId => {
        const joinedFernFilePath = stringifyFernFilepath(fernFilepath);
        return `subpackage_${joinedFernFilePath}`;
    },
    generateEndpointId: (
        declaredServiceName: DeclaredServiceName,
        httpEndpoint: Omit<FernIr.http.HttpEndpoint, "id">
    ): string => {
        const joinedFernFilePath = stringifyFernFilepath(declaredServiceName.fernFilepath);
        const endpointId = httpEndpoint.name.originalName;
        return `endpoint_${joinedFernFilePath}.${endpointId}`;
    },
    /**
     * Generates an endpoint ID using an explicit key string instead of the
     * endpoint's originalName. Used for audience-suffixed endpoints where the
     * key includes the suffix for uniqueness (e.g. `create__aud_internal`).
     */
    generateEndpointIdFromKey: (declaredServiceName: DeclaredServiceName, endpointKey: string): string => {
        const joinedFernFilePath = stringifyFernFilepath(declaredServiceName.fernFilepath);
        return `endpoint_${joinedFernFilePath}.${endpointKey}`;
    },
    generateWebhookGroupId: (fernFilepath: FernFilepath): string => {
        const joinedFernFilePath = stringifyFernFilepath(fernFilepath);
        return `webhooks_${joinedFernFilePath}`;
    },
    generateWebhookId: (fernFilepath: FernFilepath, webhookId: string): string => {
        const joinedFernFilePath = stringifyFernFilepath(fernFilepath);
        return `webhooks_${joinedFernFilePath}.${webhookId}`;
    },
    generateWebSocketChannelId: (fernFilepath: FernFilepath): string => {
        const joinedFernFilePath = stringifyFernFilepath(fernFilepath);
        return `channel_${joinedFernFilePath}`;
    }
};
