import { ClassReference, Function_ } from "@fern-api/ruby-codegen";

import { EndpointId } from "@fern-fern/ir-sdk/api";

// Note we currently only register the sync endpoint and sync client for the below, for simplicity.
export class ArtifactRegistry {
    endpointRegistry: Map<EndpointId, Function_> = new Map();
    endpointPackageRegistry: Map<EndpointId, ClassReference> = new Map();

    public registerEndpoint(endpointId: EndpointId, endpoint: Function_, endpointPackage: ClassReference): void {
        this.endpointRegistry.set(endpointId, endpoint);
        this.endpointPackageRegistry.set(endpointId, endpointPackage);
    }

    public getEndpointFunction(endpointId: EndpointId): Function_ | undefined {
        return this.endpointRegistry.get(endpointId);
    }

    public getEndpointPackage(endpointId: EndpointId): ClassReference | undefined {
        return this.endpointPackageRegistry.get(endpointId);
    }
}
