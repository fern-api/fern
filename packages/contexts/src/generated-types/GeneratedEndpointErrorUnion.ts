import { EndpointErrorUnionContext } from "../contexts";
import { GeneratedFile } from "./GeneratedFile";
import { GeneratedUnion } from "./GeneratedUnion";

export interface GeneratedEndpointErrorUnion extends GeneratedFile<EndpointErrorUnionContext> {
    getErrorUnion: () => GeneratedUnion<EndpointErrorUnionContext>;
}
