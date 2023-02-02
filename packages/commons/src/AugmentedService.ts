import { DeclaredServiceName, HttpService } from "@fern-fern/ir-model/http";

export interface AugmentedService {
    name: DeclaredServiceName;
    originalService: HttpService | undefined;
    wrappedServices: DeclaredServiceName[];
}
