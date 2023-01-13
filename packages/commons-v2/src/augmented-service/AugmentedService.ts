import { FernFilepath } from "@fern-fern/ir-model/commons";
import { HttpHeader, HttpService } from "@fern-fern/ir-model/http";

export interface AugmentedService {
    fernFilepath: FernFilepath;
    originalService: HttpService | undefined;
    wrappedServices: FernFilepath[];
    apiWideHeaders: HttpHeader[];
}
