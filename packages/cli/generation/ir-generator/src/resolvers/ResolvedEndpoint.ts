import { RawSchemas } from "@fern-api/fern-definition-schema";

import { FernFileContext } from "../FernFileContext";

export interface ResolvedEndpoint {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
}
