import { FernNavigation } from '@fern-api/fdr-sdk'

export function mergeEndpointPairs<EndpointType extends { method: string }>({
    children,
    findEndpointById,
    stringifyEndpointPathParts,
    disableEndpointPairs,
    apiDefinitionId
}: {
    children: FernNavigation.V1.ApiPackageChild[]
    findEndpointById: (endpointId: FernNavigation.EndpointId) => EndpointType | undefined
    stringifyEndpointPathParts: (endpoint: EndpointType) => string
    disableEndpointPairs: boolean
    apiDefinitionId: FernNavigation.V1.ApiDefinitionId
}): FernNavigation.V1.ApiPackageChild[] {
    if (disableEndpointPairs) {
        return children
    }

    const toRet: FernNavigation.V1.ApiPackageChild[] = []

    const methodAndPathToEndpointNode = new Map<string, FernNavigation.V1.EndpointNode>()
    children.forEach((child) => {
        if (child.type !== 'endpoint') {
            toRet.push(child)
            return
        }

        const endpoint = findEndpointById(child.endpointId)
        if (endpoint == null) {
            throw new Error(`Endpoint ${child.endpointId} not found`)
        }

        const methodAndPath = `${endpoint.method} ${stringifyEndpointPathParts(endpoint)}`

        const existing = methodAndPathToEndpointNode.get(methodAndPath)
        methodAndPathToEndpointNode.set(methodAndPath, child)

        if (existing == null || existing.isResponseStream === child.isResponseStream) {
            toRet.push(child)
            return
        }

        const idx = toRet.indexOf(existing)
        const stream = child.isResponseStream ? child : existing
        const nonStream = child.isResponseStream ? existing : child
        const pairNode: FernNavigation.V1.EndpointPairNode = {
            id: FernNavigation.V1.NodeId(`${apiDefinitionId}:${nonStream.endpointId}+${stream.endpointId}`),
            type: 'endpointPair',
            stream,
            nonStream
        }

        toRet[idx] = pairNode
    })

    return toRet
}
