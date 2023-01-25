import { GeneratedFile } from "../commons/GeneratedFile";
import { GeneratedUnion } from "../commons/GeneratedUnion";
import { EndpointErrorUnionContext } from "./EndpointErrorUnionContext";

export interface GeneratedEndpointErrorUnion extends GeneratedFile<EndpointErrorUnionContext> {
    getErrorUnion: () => GeneratedUnion<EndpointErrorUnionContext>;
}
