import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";

export interface ResolvedEndpoint {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
}
