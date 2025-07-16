import { DeclaredErrorName, DeclaredServiceName, DeclaredTypeName, FernFilepath, FernIr } from '@fern-api/ir-sdk'

import { stringifyFernFilepath } from './stringifyFernFilepath'

export const IdGenerator = {
    generateTypeId: (typeName: Omit<DeclaredTypeName, 'typeId'>): FernIr.commons.TypeId => {
        const joinedFernFilePath = stringifyFernFilepath(typeName.fernFilepath)
        return `type_${joinedFernFilePath}:${typeName.name.originalName}`
    },
    generateErrorId: (errorName: Omit<DeclaredErrorName, 'errorId'>): FernIr.commons.TypeId => {
        const joinedFernFilePath = stringifyFernFilepath(errorName.fernFilepath)
        return `error_${joinedFernFilePath}:${errorName.name.originalName}`
    },
    generateServiceId: (serviceName: DeclaredServiceName): FernIr.commons.TypeId => {
        const joinedFernFilePath = stringifyFernFilepath(serviceName.fernFilepath)
        return `service_${joinedFernFilePath}`
    },
    generateServiceIdFromFernFilepath: (fernFilepath: FernFilepath): FernIr.commons.TypeId => {
        const joinedFernFilePath = stringifyFernFilepath(fernFilepath)
        return `service_${joinedFernFilePath}`
    },
    generateSubpackageId: (fernFilepath: FernFilepath): FernIr.commons.SubpackageId => {
        const joinedFernFilePath = stringifyFernFilepath(fernFilepath)
        return `subpackage_${joinedFernFilePath}`
    },
    generateEndpointId: (
        declaredServiceName: DeclaredServiceName,
        httpEndpoint: Omit<FernIr.http.HttpEndpoint, 'id'>
    ): string => {
        const joinedFernFilePath = stringifyFernFilepath(declaredServiceName.fernFilepath)
        const endpointId = httpEndpoint.name.originalName
        return `endpoint_${joinedFernFilePath}.${endpointId}`
    },
    generateWebhookGroupId: (fernFilepath: FernFilepath): string => {
        const joinedFernFilePath = stringifyFernFilepath(fernFilepath)
        return `webhooks_${joinedFernFilePath}`
    },
    generateWebhookId: (fernFilepath: FernFilepath, webhookId: string): string => {
        const joinedFernFilePath = stringifyFernFilepath(fernFilepath)
        return `webhooks_${joinedFernFilePath}.${webhookId}`
    },
    generateWebSocketChannelId: (fernFilepath: FernFilepath): string => {
        const joinedFernFilePath = stringifyFernFilepath(fernFilepath)
        return `channel_${joinedFernFilePath}`
    }
}
