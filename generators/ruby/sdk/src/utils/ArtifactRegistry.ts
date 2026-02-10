import { FernIrV39 as FernIr } from "@fern-fern/ir-sdk";
import { ClassReference, Function_ } from "@fern-api/ruby-codegen";

// Note we currently only register the sync endpoint and sync client for the below, for simplicity.
export class ArtifactRegistry {
    endpointRegistry: Map<FernIr.EndpointId, Function_> = new Map();
    endpointPackageRegistry: Map<FernIr.EndpointId, ClassReference> = new Map();

    public registerEndpoint(endpointId: FernIr.EndpointId, endpoint: Function_, endpointPackage: ClassReference): void {
        this.endpointRegistry.set(endpointId, endpoint);
        this.endpointPackageRegistry.set(endpointId, endpointPackage);
    }

    public getEndpointFunction(endpointId: FernIr.EndpointId): Function_ | undefined {
        return this.endpointRegistry.get(endpointId);
    }

    public getEndpointPackage(endpointId: FernIr.EndpointId): ClassReference | undefined {
        return this.endpointPackageRegistry.get(endpointId);
    }
}
