import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpService } from "@fern-fern/ir-model/services/http";

export interface AugmentedService {
    name: DeclaredServiceName;
    originalService: HttpService | undefined;
    wrappedServices: DeclaredServiceName[];
}
